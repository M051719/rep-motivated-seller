import { supabase } from "../lib/supabase";
import { HUBSPOT_CONFIG, CUSTOM_PROPERTIES } from "../config/hubspot";
import {
  HubSpotContact,
  HubSpotDeal,
  SyncResult,
  ConnectionValidation,
} from "../types/hubspot";

class HubSpotServiceClass {
  private accessToken: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.HUBSPOT_ACCESS_TOKEN || "";
    this.baseUrl = HUBSPOT_CONFIG.baseUrl;

    if (!this.accessToken) {
      console.warn("HubSpot access token not found in environment variables");
    }
  }

  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
    body?: any,
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HubSpot API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`HubSpot API request failed: ${error}`);
      throw error;
    }
  }

  async validateConnection(): Promise<ConnectionValidation> {
    try {
      const response = await this.makeRequest(HUBSPOT_CONFIG.endpoints.account);

      return {
        isValid: true,
        portalId: response.portalId?.toString(),
        accountName: response.accountName || "Unknown",
      };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error ? error.message : "Unknown connection error",
      };
    }
  }

  async createContact(contactData: HubSpotContact): Promise<any> {
    try {
      const response = await this.makeRequest(
        HUBSPOT_CONFIG.endpoints.contacts,
        "POST",
        contactData,
      );
      return response;
    } catch (error) {
      console.error("Error creating HubSpot contact:", error);
      throw error;
    }
  }

  async updateContact(
    contactId: string,
    contactData: Partial<HubSpotContact>,
  ): Promise<any> {
    try {
      const response = await this.makeRequest(
        `${HUBSPOT_CONFIG.endpoints.contacts}/${contactId}`,
        "PATCH",
        contactData,
      );
      return response;
    } catch (error) {
      console.error("Error updating HubSpot contact:", error);
      throw error;
    }
  }

  async createDeal(dealData: HubSpotDeal): Promise<any> {
    try {
      const response = await this.makeRequest(
        HUBSPOT_CONFIG.endpoints.deals,
        "POST",
        dealData,
      );
      return response;
    } catch (error) {
      console.error("Error creating HubSpot deal:", error);
      throw error;
    }
  }

  async searchContactByEmail(email: string): Promise<any> {
    try {
      const searchEndpoint = `${HUBSPOT_CONFIG.endpoints.contacts}/search`;
      const searchBody = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
      };

      const response = await this.makeRequest(
        searchEndpoint,
        "POST",
        searchBody,
      );
      return response.results?.[0] || null;
    } catch (error) {
      console.error("Error searching HubSpot contact:", error);
      throw error;
    }
  }

  async bulkSyncToHubSpot(limit: number = 50): Promise<number> {
    try {
      // Fetch leads from your Supabase database
      const { data: leads, error } = await supabase
        .from("leads") // Adjust table name as needed
        .select("*")
        .is("hubspot_contact_id", null) // Only sync leads not yet in HubSpot
        .limit(limit);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!leads || leads.length === 0) {
        console.log("No leads to sync");
        return 0;
      }

      let syncedCount = 0;
      const results: SyncResult = {
        success: true,
        recordsProcessed: leads.length,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: [],
      };

      for (const lead of leads) {
        try {
          // Rate limiting - wait between requests
          await this.delay(100);

          // Check if contact already exists
          let hubspotContact = await this.searchContactByEmail(lead.email);

          const contactData: HubSpotContact = {
            properties: {
              email: lead.email,
              firstname: lead.first_name || "",
              lastname: lead.last_name || "",
              phone: lead.phone || "",
              company: lead.company || "",
              lead_source: lead.source || "Website",
              property_interest: lead.property_type || "",
              investment_budget: lead.budget?.toString() || "",
              location_preference: lead.location || "",
            },
          };

          if (hubspotContact) {
            // Update existing contact
            hubspotContact = await this.updateContact(hubspotContact.id, {
              properties: contactData.properties,
            });
            results.recordsUpdated++;
          } else {
            // Create new contact
            hubspotContact = await this.createContact(contactData);
            results.recordsCreated++;
          }

          // Update your database with HubSpot contact ID
          await supabase
            .from("leads")
            .update({
              hubspot_contact_id: hubspotContact.id,
              synced_at: new Date().toISOString(),
            })
            .eq("id", lead.id);

          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync lead ${lead.id}:`, error);
          results.recordsFailed++;
          results.errors.push(
            `Lead ${lead.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      console.log("Bulk sync results:", results);
      return syncedCount;
    } catch (error) {
      console.error("Bulk sync failed:", error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Static wrappers for test compatibility
  static async syncLead(leadData: any): Promise<SyncResult> {
    const instance = new HubSpotServiceClass();
    try {
      const contact = await instance.createContact({
        properties: {
          email: leadData.email,
          firstname: leadData.firstName,
          lastname: leadData.lastName,
          phone: leadData.phone,
        },
      });

      return {
        success: true,
        contactId: contact.id,
        recordsProcessed: 1,
        recordsCreated: 1,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        recordsProcessed: 1,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      } as SyncResult;
    }
  }

  static async getRecentContacts(limit: number = 10): Promise<any[]> {
    const instance = new HubSpotServiceClass();
    try {
      const response = await instance.makeRequest(
        `${HUBSPOT_CONFIG.endpoints.contacts}?limit=${limit}`,
        "GET",
      );
      return response.results || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  }

  async syncLead(leadData: any): Promise<SyncResult> {
    return HubSpotServiceClass.syncLead(leadData);
  }

  async getRecentContacts(limit?: number): Promise<any[]> {
    return HubSpotServiceClass.getRecentContacts(limit);
  }
}

export const HubSpotService = new HubSpotServiceClass();
