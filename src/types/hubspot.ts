// TypeScript definitions for HubSpot integration
export interface HubSpotContact {
  id?: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    website?: string;
    lifecyclestage?: string;
    lead_source?: string;
    property_interest?: string;
    investment_budget?: string;
    location_preference?: string;
    [key: string]: any;
  };
}

export interface HubSpotDeal {
  id?: string;
  properties: {
    dealname: string;
    amount?: number;
    dealstage?: string;
    pipeline?: string;
    closedate?: string;
    dealtype?: string;
    property_address?: string;
    property_value?: number;
    [key: string]: any;
  };
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
}

export interface ConnectionValidation {
  isValid: boolean;
  portalId?: string;
  accountName?: string;
  error?: string;
}