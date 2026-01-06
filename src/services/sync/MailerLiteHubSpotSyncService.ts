/**
 * MailerLite to HubSpot Sync Service
 *
 * Manages automatic syncing of MailerLite subscriber data to HubSpot CRM
 */

import { supabase } from "../../lib/supabase";

export interface MailerLiteHubSpotSyncResult {
  success: boolean;
  message?: string;
  error?: string;
  submission_id: string;
  mailerlite_subscriber_id?: string;
  hubspot_contact_id?: string;
}

export interface SyncLogEntry {
  id: string;
  sync_type: string;
  mailerlite_subscriber_id: string;
  hubspot_contact_id?: string;
  submission_id?: string;
  sync_data: any;
  sync_direction: string;
  success: boolean;
  error_message?: string;
  synced_at: string;
  created_at: string;
}

export interface SyncStats {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  sync_rate: number;
  by_type: {
    type: string;
    count: number;
  }[];
}

export class MailerLiteHubSpotSyncService {
  /**
   * Manually trigger sync for a submission
   */
  static async syncSubmissionData(
    submissionId: string,
    mailerLiteSubscriberId?: string,
    emailEngagement?: {
      opened?: boolean;
      clicked?: boolean;
    },
  ): Promise<MailerLiteHubSpotSyncResult> {
    try {
      const { data, error } = await supabase.rpc("sync_mailerlite_to_hubspot", {
        p_submission_id: submissionId,
        p_mailerlite_subscriber_id: mailerLiteSubscriberId || null,
        p_email_engagement: emailEngagement || null,
      });

      if (error) {
        console.error("Sync error:", error);
        return {
          success: false,
          error: error.message,
          submission_id: submissionId,
        };
      }

      return data as MailerLiteHubSpotSyncResult;
    } catch (error: any) {
      console.error("Unexpected sync error:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
        submission_id: submissionId,
      };
    }
  }

  /**
   * Get sync logs
   */
  static async getSyncLogs(limit: number = 50): Promise<SyncLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from("mailerlite_hubspot_sync_log")
        .select("*")
        .order("synced_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching sync logs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching logs:", error);
      return [];
    }
  }

  /**
   * Get failed syncs
   */
  static async getFailedSyncs(limit: number = 50): Promise<SyncLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from("mailerlite_hubspot_sync_log")
        .select("*")
        .eq("success", false)
        .order("synced_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching failed syncs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching failed syncs:", error);
      return [];
    }
  }

  /**
   * Get sync statistics
   */
  static async getSyncStats(): Promise<SyncStats> {
    try {
      // Get total counts
      const { data: totals, error: totalsError } = await supabase
        .from("mailerlite_hubspot_sync_log")
        .select("success, sync_type");

      if (totalsError || !totals) {
        console.error("Error fetching sync stats:", totalsError);
        return {
          total_syncs: 0,
          successful_syncs: 0,
          failed_syncs: 0,
          sync_rate: 0,
          by_type: [],
        };
      }

      const total = totals.length;
      const successful = totals.filter((s) => s.success).length;
      const failed = totals.filter((s) => !s.success).length;

      // Count by type
      const typeCount: { [key: string]: number } = {};
      totals.forEach((s) => {
        typeCount[s.sync_type] = (typeCount[s.sync_type] || 0) + 1;
      });

      const by_type = Object.entries(typeCount).map(([type, count]) => ({
        type,
        count,
      }));

      return {
        total_syncs: total,
        successful_syncs: successful,
        failed_syncs: failed,
        sync_rate: total > 0 ? (successful / total) * 100 : 0,
        by_type,
      };
    } catch (error) {
      console.error("Unexpected error fetching stats:", error);
      return {
        total_syncs: 0,
        successful_syncs: 0,
        failed_syncs: 0,
        sync_rate: 0,
        by_type: [],
      };
    }
  }

  /**
   * Get submissions with email engagement
   */
  static async getEngagedSubmissions(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, contact_info, email_opened, email_clicked, last_email_activity, mailerlite_subscriber_id, hubspot_contact_id",
        )
        .or("email_opened.eq.true,email_clicked.eq.true")
        .order("last_email_activity", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching engaged submissions:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching engaged submissions:", error);
      return [];
    }
  }

  /**
   * Get webhook URL for MailerLite configuration
   */
  static getWebhookUrl(supabaseUrl: string): string {
    return `${supabaseUrl}/functions/v1/mailerlite-webhook`;
  }

  /**
   * Update submission with MailerLite subscriber ID
   */
  static async updateMailerLiteSubscriberId(
    submissionId: string,
    subscriberId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          mailerlite_subscriber_id: subscriberId,
          mailerlite_synced_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (error) {
        console.error("Error updating subscriber ID:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error updating subscriber ID:", error);
      return false;
    }
  }

  /**
   * Update email engagement tracking
   */
  static async updateEmailEngagement(
    submissionId: string,
    engagement: {
      opened?: boolean;
      clicked?: boolean;
    },
  ): Promise<boolean> {
    try {
      const updates: any = {
        last_email_activity: new Date().toISOString(),
      };

      if (engagement.opened !== undefined) {
        updates.email_opened = engagement.opened;
      }

      if (engagement.clicked !== undefined) {
        updates.email_clicked = engagement.clicked;
      }

      const { error } = await supabase
        .from("submissions")
        .update(updates)
        .eq("id", submissionId);

      if (error) {
        console.error("Error updating email engagement:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error updating engagement:", error);
      return false;
    }
  }
}

// Export singleton instance
export const mailerLiteHubSpotSync = new MailerLiteHubSpotSyncService();
