import { supabase } from '../supabase'
import { RoleVerification } from '../role-verification'

export class GLBAAccessControl {
  // Define GLBA-specific access levels
  static readonly ACCESS_LEVELS = {
    CLIENT: 1,           // Can access own documents only
    ADVISOR: 2,          // Can access assigned client documents
    COMPLIANCE: 3,       // Can access audit trails and compliance reports
    ADMIN: 4             // Full system access
  } as const

  // Check access permission for specific NPI
  static async checkNPIAccess(
    userId: string, 
    resourceType: 'document' | 'client_data' | 'financial_record',
    resourceId: string
  ): Promise<{
    hasAccess: boolean
    accessLevel: number
    reason: string
  }> {
    try {
      // Get user's role and access level
      const userRole = await RoleVerification.getCurrentUserRole()
      const accessLevel = this.getAccessLevelForRole(userRole.role)

      // Check specific resource permissions
      const { data: permission, error } = await supabase
        .from('npi_access_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        return {
          hasAccess: false,
          accessLevel: 0,
          reason: 'Database error checking permissions'
        }
      }

      // If no specific permission, check general access rules
      if (!permission) {
        return this.checkGeneralAccess(userRole.role, resourceType)
      }

      // Log access attempt
      await this.logAccessAttempt(userId, resourceType, resourceId, true)

      return {
        hasAccess: true,
        accessLevel,
        reason: 'Explicit permission granted'
      }

    } catch (error) {
      await this.logAccessAttempt(userId, resourceType, resourceId, false, error.message)
      return {
        hasAccess: false,
        accessLevel: 0,
        reason: `Access check failed: ${error.message}`
      }
    }
  }

  // Get access level based on user role
  private static getAccessLevelForRole(role: string): number {
    switch (role) {
      case 'admin': return this.ACCESS_LEVELS.ADMIN
      case 'compliance': return this.ACCESS_LEVELS.COMPLIANCE  
      case 'advisor': return this.ACCESS_LEVELS.ADVISOR
      case 'client': 
      case 'user': return this.ACCESS_LEVELS.CLIENT
      default: return 0
    }
  }

  // Check general access rules
  private static checkGeneralAccess(
    role: string, 
    resourceType: string
  ): {
    hasAccess: boolean
    accessLevel: number
    reason: string
  } {
    const accessLevel = this.getAccessLevelForRole(role)

    // Admin has access to everything
    if (role === 'admin') {
      return {
        hasAccess: true,
        accessLevel,
        reason: 'Administrator access'
      }
    }

    // Compliance can access audit and compliance data
    if (role === 'compliance' && ['audit_log', 'compliance_report'].includes(resourceType)) {
      return {
        hasAccess: true,
        accessLevel,
        reason: 'Compliance officer access'
      }
    }

    // Default deny
    return {
      hasAccess: false,
      accessLevel: 0,
      reason: 'Insufficient privileges - access denied'
    }
  }

  // Log all access attempts for GLBA compliance
  static async logAccessAttempt(
    userId: string,
    resourceType: string,
    resourceId: string,
    wasGranted: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      await supabase
        .from('glba_audit_log')
        .insert({
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
          access_granted: wasGranted,
          timestamp: new Date().toISOString(),
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          error_message: errorMessage,
          compliance_category: 'npi_access'
        })
    } catch (error) {
      console.error('Failed to log access attempt:', error)
    }
  }

  // Grant temporary access with expiration
  static async grantTemporaryAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    durationHours: number,
    grantedBy: string,
    reason: string
  ): Promise<{
    success: boolean
    error?: string
    expiresAt: string
  }> {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + durationHours)

      const { error } = await supabase
        .from('npi_access_permissions')
        .insert({
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
          granted_by: grantedBy,
          granted_reason: reason,
          expires_at: expiresAt.toISOString(),
          is_active: true,
          is_temporary: true
        })

      if (error) {
        return {
          success: false,
          error: error.message,
          expiresAt: ''
        }
      }

      // Log the permission grant
      await this.logAccessAttempt(
        grantedBy,
        'permission_grant',
        `${resourceType}:${resourceId}`,
        true,
        `Granted ${durationHours}h access to ${userId}`
      )

      return {
        success: true,
        expiresAt: expiresAt.toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        expiresAt: ''
      }
    }
  }

  // Get client IP for audit logging
  private static async getClientIP(): Promise<string> {
    try {
      // In production, this would get the actual client IP
      // For now, return a placeholder
      return 'client_ip_placeholder'
    } catch (error) {
      return 'unknown'
    }
  }

  // Generate compliance report
  static async generateComplianceReport(startDate: string, endDate: string): Promise<{
    totalAccesses: number
    deniedAccesses: number
    complianceScore: number
    violations: any[]
    recommendations: string[]
  }> {
    try {
      const { data: auditLogs, error } = await supabase
        .from('glba_audit_log')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)

      if (error) {
        throw error
      }

      const totalAccesses = auditLogs?.length || 0
      const deniedAccesses = auditLogs?.filter(log => !log.access_granted).length || 0
      const violations = auditLogs?.filter(log => 
        log.error_message && 
        !log.access_granted
      ) || []

      const complianceScore = totalAccesses > 0 
        ? Math.round(((totalAccesses - violations.length) / totalAccesses) * 100)
        : 100

      const recommendations = []
      if (complianceScore < 95) {
        recommendations.push('Review access control policies')
      }
      if (deniedAccesses > totalAccesses * 0.1) {
        recommendations.push('Investigate high number of access denials')
      }

      return {
        totalAccesses,
        deniedAccesses,
        complianceScore,
        violations,
        recommendations
      }

    } catch (error) {
      throw new Error(`Compliance report generation failed: ${error.message}`)
    }
  }
}