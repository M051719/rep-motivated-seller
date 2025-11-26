/**
 * HubSpot CRM Integration Service
 * 
 * Manages syncing foreclosure submissions to HubSpot CRM
 * Handles contacts, deals, and sync status tracking
 */

import { supabase } from '../../lib/supabase';

export interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
  submission_id: string;
  contact_email?: string;
}

export interface BulkSyncResult {
  total_processed: number;
  successful_syncs: number;
  errors: number;
  details: SyncResult[];
}

export interface ConnectionTest {
  test_name: string;
  status: 'PASS' | 'FAIL' | 'INFO';
  details: string;
}

export interface SyncError {
  id: string;
  table_name: string;
  record_id: string;
  error_message: string;
  error_details: any;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  retry_count: number;
  notes?: string;
}

export interface SyncStats {
  total_submissions: number;
  synced_count: number;
  pending_count: number;
  error_count: number;
  sync_rate: number;
}

export class HubSpotService {
  /**
   * Check if current user is admin
   */
  private static async checkAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Admin check error:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Unexpected error checking admin status:', error);
      return false;
    }
  }

  /**
   * Validate HubSpot connection and permissions
   * Admin only
   */
  static async validateConnection(): Promise<ConnectionTest[]> {
    // Check admin status first
    const isAdmin = await this.checkAdmin();
    if (!isAdmin) {
      return [{
        test_name: 'Permission Check',
        status: 'FAIL',
        details: 'Admin access required for HubSpot operations'
      }];
    }

    try {
      const { data, error } = await supabase
        .rpc('validate_hubspot_connection');

      if (error) {
        console.error('Connection validation error:', error);
        return [{
          test_name: 'Connection Test',
          status: 'FAIL',
          details: error.message
        }];
      }

      return data || [];
    } catch (error: any) {
      console.error('Unexpected error during validation:', error);
      return [{
        test_name: 'Connection Test',
        status: 'FAIL',
        details: error.message || 'Unknown error'
      }];
    }
  }

  /**
   * Sync a single submission to HubSpot
   * Admin only
   */
  static async syncSubmission(submissionId: string): Promise<SyncResult> {
    // Check admin status first
    const isAdmin = await this.checkAdmin();
    if (!isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
        submission_id: submissionId
      };
    }

    try {
      const { data, error } = await supabase
        .rpc('sync_submission_to_hubspot', {
          submission_id: submissionId
        });

      if (error) {
        console.error('Sync error:', error);
        return {
          success: false,
          error: error.message,
          submission_id: submissionId
        };
      }

      return data as SyncResult;
    } catch (error: any) {
      console.error('Unexpected sync error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        submission_id: submissionId
      };
    }
  }

  /**
   * Bulk sync multiple unsynced submissions
   * Admin only
   */
  static async bulkSync(limit: number = 10): Promise<BulkSyncResult> {
    // Check admin status first
    const isAdmin = await this.checkAdmin();
    if (!isAdmin) {
      return {
        total_processed: 0,
        successful_syncs: 0,
        errors: 1,
        details: [{
          success: false,
          error: 'Admin access required',
          submission_id: 'bulk'
        }]
      };
    }

    try {
      const { data, error } = await supabase
        .rpc('bulk_sync_to_hubspot', {
          limit_count: limit
        });

      if (error) {
        console.error('Bulk sync error:', error);
        return {
          total_processed: 0,
          successful_syncs: 0,
          errors: 1,
          details: [{
            success: false,
            error: error.message,
            submission_id: 'bulk'
          }]
        };
      }

      return data as BulkSyncResult;
    } catch (error: any) {
      console.error('Unexpected bulk sync error:', error);
      return {
        total_processed: 0,
        successful_syncs: 0,
        errors: 1,
        details: [{
          success: false,
          error: error.message || 'Unknown error',
          submission_id: 'bulk'
        }]
      };
    }
  }

  /**
   * Get sync statistics
   */
  static async getSyncStats(): Promise<SyncStats> {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('id, synced_to_hubspot, last_sync_error');

      if (error) {
        console.error('Error fetching sync stats:', error);
        return {
          total_submissions: 0,
          synced_count: 0,
          pending_count: 0,
          error_count: 0,
          sync_rate: 0
        };
      }

      const total = data.length;
      const synced = data.filter(s => s.synced_to_hubspot).length;
      const errors = data.filter(s => s.last_sync_error).length;
      const pending = total - synced;

      return {
        total_submissions: total,
        synced_count: synced,
        pending_count: pending,
        error_count: errors,
        sync_rate: total > 0 ? (synced / total) * 100 : 0
      };
    } catch (error) {
      console.error('Unexpected error fetching stats:', error);
      return {
        total_submissions: 0,
        synced_count: 0,
        pending_count: 0,
        error_count: 0,
        sync_rate: 0
      };
    }
  }

  /**
   * Get recent sync errors
   */
  static async getSyncErrors(limit: number = 50): Promise<SyncError[]> {
    try {
      const { data, error } = await supabase
        .from('sync_errors')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching sync errors:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching errors:', error);
      return [];
    }
  }

  /**
   * Mark a sync error as resolved
   */
  static async resolveError(errorId: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sync_errors')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', errorId);

      if (error) {
        console.error('Error resolving sync error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error resolving error:', error);
      return false;
    }
  }

  /**
   * Retry failed syncs
   */
  static async retryFailedSyncs(maxRetries: number = 3): Promise<BulkSyncResult> {
    try {
      // Get failed submissions
      const { data: failedSubmissions, error: fetchError } = await supabase
        .from('submissions')
        .select('id')
        .eq('synced_to_hubspot', false)
        .not('last_sync_error', 'is', null)
        .lt('sync_attempts', maxRetries)
        .limit(10);

      if (fetchError || !failedSubmissions) {
        return {
          total_processed: 0,
          successful_syncs: 0,
          errors: 1,
          details: []
        };
      }

      // Retry each failed submission
      const results: SyncResult[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const submission of failedSubmissions) {
        const result = await this.syncSubmission(submission.id);
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return {
        total_processed: failedSubmissions.length,
        successful_syncs: successCount,
        errors: errorCount,
        details: results
      };
    } catch (error: any) {
      console.error('Unexpected error retrying syncs:', error);
      return {
        total_processed: 0,
        successful_syncs: 0,
        errors: 1,
        details: []
      };
    }
  }

  /**
   * Get unsynced submissions count
   */
  static async getUnsyncedCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('synced_to_hubspot', false);

      if (error) {
        console.error('Error counting unsynced submissions:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Unexpected error counting unsynced:', error);
      return 0;
    }
  }

  /**
   * Check if HubSpot is configured
   */
  static async isConfigured(): Promise<boolean> {
    const tests = await this.validateConnection();
    const vaultTest = tests.find(t => t.test_name === 'Vault Secret');
    return vaultTest?.status === 'PASS';
  }
}

// Export singleton instance
export const hubSpotService = new HubSpotService();
