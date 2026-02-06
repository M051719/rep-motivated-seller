/**
 * GLBA Access Control System
 * Role-based access control for NPI (Nonpublic Personal Information)
 * Implements GLBA pretexting provisions and audit logging
 */

import { createClient } from "@supabase/supabase-js";

export interface NPIAccessRequest {
  userId: string;
  npiType:
    | "ssn"
    | "bank_account"
    | "credit_card"
    | "financial_data"
    | "document";
  resourceId: string;
  purpose: string;
  ipAddress?: string;
}

export interface AccessPermission {
  id: string;
  user_id: string;
  npi_type: string;
  access_level: "read" | "write" | "delete";
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface AccessAuditLog {
  id: string;
  user_id: string;
  npi_type: string;
  resource_id: string;
  action: string;
  purpose: string;
  granted: boolean;
  ip_address?: string;
  timestamp: string;
}

export class GLBAAccessControl {
  private static supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      "",
  );

  private static readonly AUDIT_RETENTION_DAYS = parseInt(
    import.meta.env.VITE_GLBA_AUDIT_RETENTION_DAYS ||
      process.env.GLBA_AUDIT_RETENTION_DAYS ||
      "2555", // 7 years
  );

  /**
   * Check if user has permission to access NPI
   */
  public static async checkNPIAccess(
    request: NPIAccessRequest,
  ): Promise<boolean> {
    try {
      const { data: permissions, error } = await this.supabase
        .from("npi_access_permissions")
        .select("*")
        .eq("user_id", request.userId)
        .eq("npi_type", request.npiType)
        .eq("is_active", true);

      if (error) {
        await this.logAccessAttempt(request, false, error.message);
        return false;
      }

      const hasPermission = permissions && permissions.length > 0;

      // Check if permission is expired
      if (hasPermission && permissions[0].expires_at) {
        const expiresAt = new Date(permissions[0].expires_at);
        if (expiresAt < new Date()) {
          await this.logAccessAttempt(request, false, "Permission expired");
          return false;
        }
      }

      await this.logAccessAttempt(request, hasPermission);
      return hasPermission;
    } catch (error) {
      await this.logAccessAttempt(
        request,
        false,
        error instanceof Error ? error.message : "Unknown error",
      );
      return false;
    }
  }

  /**
   * Grant NPI access permission to user
   */
  public static async grantAccess(
    userId: string,
    npiType: string,
    accessLevel: "read" | "write" | "delete",
    grantedBy: string,
    expiresInDays?: number,
  ): Promise<string> {
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await this.supabase
      .from("npi_access_permissions")
      .insert({
        user_id: userId,
        npi_type: npiType,
        access_level: accessLevel,
        granted_by: grantedBy,
        expires_at: expiresAt,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to grant access: ${error.message}`);

    await this.auditPermissionChange("GRANT", userId, npiType, grantedBy);
    return data.id;
  }

  /**
   * Revoke NPI access permission
   */
  public static async revokeAccess(
    permissionId: string,
    revokedBy: string,
    reason: string,
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from("npi_access_permissions")
      .update({ is_active: false })
      .eq("id", permissionId)
      .select("user_id, npi_type")
      .single();

    if (error) throw new Error(`Failed to revoke access: ${error.message}`);

    await this.auditPermissionChange(
      "REVOKE",
      data.user_id,
      data.npi_type,
      revokedBy,
      reason,
    );
  }

  /**
   * Grant temporary access (auto-expires)
   */
  public static async grantTemporaryAccess(
    userId: string,
    npiType: string,
    durationHours: number,
    grantedBy: string,
    purpose: string,
  ): Promise<string> {
    const expiresInDays = durationHours / 24;
    const permissionId = await this.grantAccess(
      userId,
      npiType,
      "read",
      grantedBy,
      expiresInDays,
    );

    await this.supabase.from("glba_audit_log").insert({
      user_id: userId,
      npi_type: npiType,
      action: "TEMPORARY_ACCESS_GRANTED",
      purpose,
      granted: true,
      metadata: { duration_hours: durationHours, granted_by: grantedBy },
    });

    return permissionId;
  }

  /**
   * Log access attempt for audit trail
   */
  private static async logAccessAttempt(
    request: NPIAccessRequest,
    granted: boolean,
    denialReason?: string,
  ): Promise<void> {
    await this.supabase.from("glba_audit_log").insert({
      user_id: request.userId,
      npi_type: request.npiType,
      resource_id: request.resourceId,
      action: "ACCESS_ATTEMPT",
      purpose: request.purpose,
      granted,
      ip_address: request.ipAddress,
      metadata: denialReason ? { denial_reason: denialReason } : null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Audit permission changes
   */
  private static async auditPermissionChange(
    action: string,
    userId: string,
    npiType: string,
    performedBy: string,
    reason?: string,
  ): Promise<void> {
    await this.supabase.from("glba_audit_log").insert({
      user_id: userId,
      npi_type: npiType,
      action,
      purpose: reason || action,
      granted: action === "GRANT",
      metadata: { performed_by: performedBy, reason },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get access audit logs for user
   */
  public static async getUserAuditLog(
    userId: string,
    limit = 100,
  ): Promise<AccessAuditLog[]> {
    const { data, error } = await this.supabase
      .from("glba_audit_log")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get audit log: ${error.message}`);
    return data || [];
  }

  /**
   * Get access statistics for compliance reporting
   */
  public static async getAccessStatistics(days = 30): Promise<{
    totalAccess: number;
    deniedAccess: number;
    grantedAccess: number;
    byType: Record<string, number>;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase
      .from("glba_audit_log")
      .select("*")
      .gte("timestamp", since.toISOString());

    if (error) throw new Error(`Failed to get statistics: ${error.message}`);

    const totalAccess = data?.length || 0;
    const deniedAccess = data?.filter((log) => !log.granted).length || 0;
    const grantedAccess = data?.filter((log) => log.granted).length || 0;

    const byType: Record<string, number> = {};
    data?.forEach((log) => {
      byType[log.npi_type] = (byType[log.npi_type] || 0) + 1;
    });

    return { totalAccess, deniedAccess, grantedAccess, byType };
  }

  /**
   * Generate compliance report
   */
  public static async generateComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    period: { start: string; end: string };
    accessAttempts: number;
    successfulAccess: number;
    deniedAccess: number;
    uniqueUsers: number;
    topAccessedTypes: Array<{ type: string; count: number }>;
  }> {
    const { data, error } = await this.supabase
      .from("glba_audit_log")
      .select("*")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString());

    if (error) throw new Error(`Failed to generate report: ${error.message}`);

    const accessAttempts = data?.length || 0;
    const successfulAccess = data?.filter((log) => log.granted).length || 0;
    const deniedAccess = accessAttempts - successfulAccess;
    const uniqueUsers = new Set(data?.map((log) => log.user_id)).size;

    const typeCounts: Record<string, number> = {};
    data?.forEach((log) => {
      typeCounts[log.npi_type] = (typeCounts[log.npi_type] || 0) + 1;
    });

    const topAccessedTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      accessAttempts,
      successfulAccess,
      deniedAccess,
      uniqueUsers,
      topAccessedTypes,
    };
  }

  /**
   * Clean up expired audit logs (maintain 7-year retention)
   */
  public static async cleanupExpiredLogs(): Promise<number> {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.AUDIT_RETENTION_DAYS);

    const { data, error } = await this.supabase
      .from("glba_audit_log")
      .delete()
      .lt("timestamp", retentionDate.toISOString())
      .select("count");

    if (error) throw new Error(`Failed to cleanup logs: ${error.message}`);
    return data?.[0]?.count || 0;
  }
}
