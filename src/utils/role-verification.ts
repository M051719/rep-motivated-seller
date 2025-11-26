import { supabase } from '../lib/supabase'

export interface UserRole {
  userId: string
  role: string
  isAdmin: boolean
  isAuthenticated: boolean
}

export class RoleVerification {
  // Get current user's role from JWT
  static async getCurrentUserRole(): Promise<UserRole> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return {
          userId: '',
          role: 'anonymous',
          isAdmin: false,
          isAuthenticated: false
        }
      }

      // Get fresh session to ensure latest JWT
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          userId: user.id,
          role: 'user',
          isAdmin: false,
          isAuthenticated: false
        }
      }

      // Decode JWT to get role claim
      const role = this.extractRoleFromJWT(session.access_token)
      
      return {
        userId: user.id,
        role: role,
        isAdmin: role === 'admin',
        isAuthenticated: true
      }
      
    } catch (error) {
      console.error('Error getting user role:', error)
      return {
        userId: '',
        role: 'anonymous',
        isAdmin: false,
        isAuthenticated: false
      }
    }
  }

  // Extract role from JWT token
  static extractRoleFromJWT(token: string): string {
    try {
      // Decode JWT payload (base64)
      const payload = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payload))
      
      console.log('🔍 JWT Payload:', decodedPayload)
      
      // Check for role in custom claims
      return decodedPayload.role || decodedPayload.user_metadata?.role || 'user'
      
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return 'user'
    }
  }

  // Check if current user is admin
  static async isCurrentUserAdmin(): Promise<boolean> {
    const userRole = await this.getCurrentUserRole()
    return userRole.isAdmin
  }

  // Force refresh JWT to get updated role
  static async refreshUserRole(): Promise<UserRole> {
    try {
      // Sign out and sign back in to refresh JWT
      const { error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
      }
      
      return await this.getCurrentUserRole()
      
    } catch (error) {
      console.error('Error refreshing user role:', error)
      return await this.getCurrentUserRole()
    }
  }

  // Verify JWT token manually (for debugging)
  static async verifyJWTToken(): Promise<{
    isValid: boolean
    payload?: any
    role?: string
    error?: string
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return {
          isValid: false,
          error: 'No access token found'
        }
      }
      
      // Decode and verify
      const payload = this.decodeJWT(session.access_token)
      const role = payload.role || payload.user_metadata?.role || 'user'
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      const isExpired = payload.exp && payload.exp < now
      
      return {
        isValid: !isExpired,
        payload,
        role,
        error: isExpired ? 'Token expired' : undefined
      }
      
    } catch (error) {
      return {
        isValid: false,
        error: String(error)
      }
    }
  }

  // Helper to decode JWT
  private static decodeJWT(token: string): any {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  }
}