import { createClient } from '@supabase/supabase-js'

// Admin management class - SERVER-SIDE ONLY
export class SupabaseAdmin {
  private supabaseAdmin: any
  
  constructor() {
    // ⚠️ CRITICAL: This should ONLY be used in server-side code
    if (typeof window !== 'undefined') {
      throw new Error('SupabaseAdmin can only be used in server-side code!')
    }
    
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }
    
    this.supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
  }

  // Promote user to admin
  async promoteToAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔧 Promoting user ${userId} to admin...`)
      
      const { data, error } = await this.supabaseAdmin.rpc('make_user_admin', {
        user_id: userId
      })
      
      if (error) {
        console.error('❌ Admin promotion failed:', error)
        return { success: false, error: error.message }
      }
      
      console.log('✅ User promoted to admin successfully')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Admin promotion error:', error)
      return { success: false, error: String(error) }
    }
  }

  // Get user's current role
  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching user role:', error)
        return null
      }
      
      return data?.role || null
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  // List all admin users
  async getAdminUsers(): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at,
          updated_at
        `)
        .eq('role', 'admin')
      
      if (error) {
        console.error('Error fetching admin users:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error getting admin users:', error)
      return []
    }
  }

  // Revoke admin access (demote to user)
  async revokeAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_roles')
        .update({ role: 'user', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}