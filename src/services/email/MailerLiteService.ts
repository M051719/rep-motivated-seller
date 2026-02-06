/**
 * MailerLite Email Service
 *
 * Handles email notifications and subscriber management using MailerLite API
 * API Docs: https://developers.mailerlite.com/docs/
 */

interface MailerLiteSubscriber {
  email: string;
  fields: {
    name?: string;
    phone?: string;
    address?: string;
    urgency?: string;
    status?: string;
    submission_date?: string;
    [key: string]: string | undefined;
  };
}

interface MailerLiteGroup {
  id: string;
  name: string;
}

interface EmailNotification {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
}

export class MailerLiteService {
  private apiKey: string;
  private baseUrl: string = "https://connect.mailerlite.com/api";
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_MAILERLITE_API_KEY || "";
    this.senderEmail =
      import.meta.env.VITE_MAILERLITE_SENDER_EMAIL ||
      "noreply@repmotivatedseller.com";
    this.senderName =
      import.meta.env.VITE_MAILERLITE_SENDER_NAME || "RepMotivatedSeller";

    if (!this.apiKey) {
      console.warn("MailerLite API key not configured");
    }
  }

  /**
   * Get common headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Create or update a subscriber
   */
  async createOrUpdateSubscriber(
    subscriber: MailerLiteSubscriber,
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscribers`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(subscriber),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `MailerLite API error: ${error.message || response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating/updating subscriber:", error);
      throw error;
    }
  }

  /**
   * Get or create a group by name
   */
  async getOrCreateGroup(groupName: string): Promise<MailerLiteGroup> {
    try {
      // Try to find existing group
      const response = await fetch(
        `${this.baseUrl}/groups?filter[name]=${encodeURIComponent(groupName)}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.data && result.data.length > 0) {
        return result.data[0];
      }

      // Create new group if not found
      const createResponse = await fetch(`${this.baseUrl}/groups`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ name: groupName }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create group: ${createResponse.statusText}`);
      }

      const newGroup = await createResponse.json();
      return newGroup.data;
    } catch (error) {
      console.error("Error getting/creating group:", error);
      throw error;
    }
  }

  /**
   * Add subscriber to a group
   */
  async addSubscriberToGroup(
    subscriberId: string,
    groupId: string,
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/subscribers/${subscriberId}/groups/${groupId}`,
        {
          method: "POST",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to add subscriber to group: ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error("Error adding subscriber to group:", error);
      throw error;
    }
  }

  /**
   * Send a transactional email notification
   */
  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      const recipients = Array.isArray(notification.to)
        ? notification.to
        : [notification.to];

      const campaignData = {
        name: `Notification - ${notification.subject} - ${new Date().toISOString()}`,
        type: "regular",
        emails: [
          {
            subject: notification.subject,
            from: notification.from || this.senderEmail,
            from_name: notification.fromName || this.senderName,
            content: {
              html: notification.html,
            },
          },
        ],
        recipients: {
          type: "email",
          emails: recipients,
        },
      };

      const response = await fetch(`${this.baseUrl}/campaigns`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Failed to create campaign: ${error.message || response.statusText}`,
        );
      }

      const campaign = await response.json();

      // Schedule campaign to send immediately
      const scheduleResponse = await fetch(
        `${this.baseUrl}/campaigns/${campaign.data.id}/schedule`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            delivery: "instant",
          }),
        },
      );

      if (!scheduleResponse.ok) {
        throw new Error(
          `Failed to schedule campaign: ${scheduleResponse.statusText}`,
        );
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Send new submission notification
   */
  async sendNewSubmissionNotification(data: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    urgency: "low" | "medium" | "high";
    submissionId: string;
  }): Promise<void> {
    // Create/update subscriber
    const subscriber = await this.createOrUpdateSubscriber({
      email: data.email,
      fields: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        urgency: data.urgency,
        status: "new",
        submission_date: new Date().toISOString(),
      },
    });

    // Store subscriber ID in submission for HubSpot sync
    const subscriberId = subscriber.data?.id;
    if (subscriberId) {
      // Import dynamically to avoid circular dependencies
      const { MailerLiteHubSpotSyncService } =
        await import("../sync/MailerLiteHubSpotSyncService");
      await MailerLiteHubSpotSyncService.updateMailerLiteSubscriberId(
        data.submissionId,
        subscriberId,
      );

      // Trigger sync to HubSpot
      await MailerLiteHubSpotSyncService.syncSubmissionData(
        data.submissionId,
        subscriberId,
      );
    }

    // Add to new_leads group
    const newLeadsGroup = await this.getOrCreateGroup("new_leads");
    await this.addSubscriberToGroup(subscriber.data.id, newLeadsGroup.id);

    // Add to urgent_cases group if high urgency
    if (data.urgency === "high") {
      const urgentGroup = await this.getOrCreateGroup("urgent_cases");
      await this.addSubscriberToGroup(subscriber.data.id, urgentGroup.id);
    }

    // Add to foreclosure_clients group
    const clientsGroup = await this.getOrCreateGroup("foreclosure_clients");
    await this.addSubscriberToGroup(subscriber.data.id, clientsGroup.id);

    // Send notification email to admin
    const adminEmails = (
      import.meta.env.VITE_MAILERLITE_NOTIFICATION_EMAILS || ""
    )
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);

    if (adminEmails.length > 0) {
      await this.sendEmail({
        to: adminEmails,
        subject: `New Foreclosure Submission - ${data.urgency.toUpperCase()} Priority`,
        html: this.generateNewSubmissionEmail(data),
      });
    }
  }

  /**
   * Generate HTML for new submission notification
   */
  private generateNewSubmissionEmail(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    urgency: string;
    submissionId: string;
  }): string {
    const urgencyColor =
      {
        low: "#10B981",
        medium: "#F59E0B",
        high: "#EF4444",
      }[data.urgency] || "#6B7280";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Foreclosure Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Foreclosure Submission</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <div style="display: inline-block; background: ${urgencyColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px;">
                ${data.urgency.toUpperCase()} PRIORITY
              </div>

              <h2 style="color: #1f2937; margin: 20px 0 15px 0; font-size: 20px;">Contact Information</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.email}</td>
                </tr>
                ${
                  data.phone
                    ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.phone}</td>
                </tr>
                `
                    : ""
                }
                ${
                  data.address
                    ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Address:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.address}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 10px 0;"><strong>Submission ID:</strong></td>
                  <td style="padding: 10px 0; font-family: monospace;">${data.submissionId}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://repmotivatedseller.com/admin/submissions/${data.submissionId}"
                 style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                View Full Submission
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p>RepMotivatedSeller - Foreclosure Assistance Platform</p>
            <p style="margin: 5px 0;">
              <a href="https://repmotivatedseller.com" style="color: #10B981; text-decoration: none;">Visit Website</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Test the MailerLite connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/subscribers?limit=1`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error("MailerLite connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const mailerLiteService = new MailerLiteService();
