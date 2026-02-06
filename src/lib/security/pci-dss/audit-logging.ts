/**
 * PCI DSS Audit Logging
 * Requirement 10: Track and monitor all access to network resources and cardholder data
 * Maintains 1-year audit logs with secure storage
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
);

export interface PCIAuditLog {
  id?: string;
  timestamp: string;
  user_id: string;
  event_type: PCIEventType;
  resource_accessed: string;
  action: string;
  result: "success" | "failure" | "denied";
  ip_address: string;
  user_agent: string;
  metadata?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
}

export type PCIEventType =
  | "payment_attempt"
  | "payment_success"
  | "payment_failure"
  | "token_created"
  | "token_used"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "refund_initiated"
  | "refund_completed"
  | "access_denied"
  | "security_violation"
  | "data_export"
  | "admin_access"
  | "configuration_change";

/**
 * PCI DSS Audit Logger
 * Implements PCI DSS Requirement 10.2: Automated audit trails
 */
export class PCIAuditLogger {
  /**
   * Log a PCI-related event
   * PCI DSS 10.2: Implement automated audit trails for all system components
   */
  static async logEvent(
    event: Omit<PCIAuditLog, "timestamp" | "ip_address" | "user_agent">,
  ): Promise<void> {
    try {
      const auditLog: PCIAuditLog = {
        ...event,
        timestamp: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        console.log("[PCI DSS Audit]", auditLog);
      }

      // Store in database for compliance
      const { error } = await supabase.from("pci_audit_logs").insert(auditLog);

      if (error) {
        console.error("Failed to log PCI audit event:", error);
        // Fallback: log to localStorage for recovery
        this.logToLocalStorage(auditLog);
      }
    } catch (error) {
      console.error("Critical: PCI audit logging failed:", error);
    }
  }

  /**
   * Log payment attempt
   * PCI DSS 10.2.4: Invalid logical access attempts
   */
  static async logPaymentAttempt(data: {
    userId: string;
    amount: number;
    currency: string;
    provider: string;
    success: boolean;
    errorMessage?: string;
    last4?: string;
  }): Promise<void> {
    await this.logEvent({
      user_id: data.userId,
      event_type: data.success ? "payment_success" : "payment_failure",
      resource_accessed: `payment_${data.provider}`,
      action: `Processed ${data.currency} ${data.amount} payment`,
      result: data.success ? "success" : "failure",
      severity: data.success ? "low" : "medium",
      metadata: {
        amount: data.amount,
        currency: data.currency,
        provider: data.provider,
        last4: data.last4,
        errorMessage: data.errorMessage,
      },
    });
  }

  /**
   * Log access denial
   * PCI DSS 10.2.4: Invalid logical access attempts
   */
  static async logAccessDenied(data: {
    userId: string;
    resource: string;
    reason: string;
  }): Promise<void> {
    await this.logEvent({
      user_id: data.userId,
      event_type: "access_denied",
      resource_accessed: data.resource,
      action: "Access attempt denied",
      result: "denied",
      severity: "high",
      metadata: {
        reason: data.reason,
      },
    });
  }

  /**
   * Log security violation
   * PCI DSS 10.2.5: Use of identification and authentication mechanisms
   */
  static async logSecurityViolation(data: {
    userId: string;
    violationType: string;
    description: string;
    severity?: "low" | "medium" | "high" | "critical";
  }): Promise<void> {
    await this.logEvent({
      user_id: data.userId,
      event_type: "security_violation",
      resource_accessed: "security_system",
      action: data.violationType,
      result: "failure",
      severity: data.severity || "critical",
      metadata: {
        description: data.description,
      },
    });
  }

  /**
   * Get client IP address (approximation)
   * In production, use server-side logging for accurate IP
   */
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "Unknown";
    }
  }

  /**
   * Fallback logging to localStorage
   * Used when database logging fails
   */
  private static logToLocalStorage(log: PCIAuditLog): void {
    try {
      const logs = JSON.parse(
        localStorage.getItem("pci_audit_fallback") || "[]",
      );
      logs.push(log);
      // Keep only last 100 logs in localStorage
      if (logs.length > 100) {
        logs.shift();
      }
      localStorage.setItem("pci_audit_fallback", JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to write to localStorage:", error);
    }
  }

  /**
   * Get audit logs for a user
   * PCI DSS 10.2.7: Creation and deletion of system-level objects
   */
  static async getUserAuditLogs(
    userId: string,
    limit: number = 50,
  ): Promise<PCIAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from("pci_audit_logs")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      return [];
    }
  }

  /**
   * Get security statistics
   * PCI DSS 10.6: Review logs and security events
   */
  static async getSecurityStatistics(days: number = 30): Promise<{
    totalEvents: number;
    failedPayments: number;
    accessDenials: number;
    securityViolations: number;
    successfulPayments: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("pci_audit_logs")
        .select("event_type, result")
        .gte("timestamp", startDate.toISOString());

      if (error) throw error;

      const stats = {
        totalEvents: data?.length || 0,
        failedPayments:
          data?.filter((l: any) => l.event_type === "payment_failure").length ||
          0,
        accessDenials:
          data?.filter((l: any) => l.event_type === "access_denied").length ||
          0,
        securityViolations:
          data?.filter((l: any) => l.event_type === "security_violation")
            .length || 0,
        successfulPayments:
          data?.filter((l: any) => l.event_type === "payment_success").length ||
          0,
      };

      return stats;
    } catch (error) {
      console.error("Failed to get security statistics:", error);
      return {
        totalEvents: 0,
        failedPayments: 0,
        accessDenials: 0,
        securityViolations: 0,
        successfulPayments: 0,
      };
    }
  }

  /**
   * Cleanup old logs (keep 1 year per PCI DSS 10.7)
   */
  static async cleanupOldLogs(): Promise<void> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { error } = await supabase
        .from("pci_audit_logs")
        .delete()
        .lt("timestamp", oneYearAgo.toISOString());

      if (error) throw error;
      console.log("PCI audit logs cleanup completed");
    } catch (error) {
      console.error("Failed to cleanup old logs:", error);
    }
  }
}

// Export convenience functions
export const logPaymentAttempt =
  PCIAuditLogger.logPaymentAttempt.bind(PCIAuditLogger);
export const logAccessDenied =
  PCIAuditLogger.logAccessDenied.bind(PCIAuditLogger);
export const logSecurityViolation =
  PCIAuditLogger.logSecurityViolation.bind(PCIAuditLogger);
export const getUserAuditLogs =
  PCIAuditLogger.getUserAuditLogs.bind(PCIAuditLogger);
export const getSecurityStatistics =
  PCIAuditLogger.getSecurityStatistics.bind(PCIAuditLogger);
