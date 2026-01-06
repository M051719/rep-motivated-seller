export const HUBSPOT_CONFIG = {
  baseUrl: "https://api.hubapi.com",
  apiVersion: "v3",
  endpoints: {
    contacts: "/crm/v3/objects/contacts",
    deals: "/crm/v3/objects/deals",
    companies: "/crm/v3/objects/companies",
    account: "/account-info/v3/details",
  },
  rateLimits: {
    requestsPerSecond: 10,
    burstLimit: 100,
  },
  retryConfig: {
    maxRetries: 3,
    backoffMs: 1000,
  },
};

export const CUSTOM_PROPERTIES = {
  contacts: [
    "property_interest",
    "investment_budget",
    "location_preference",
    "lead_source",
    "qualification_status",
  ],
  deals: [
    "property_address",
    "property_value",
    "property_type",
    "acquisition_method",
    "expected_roi",
  ],
};
