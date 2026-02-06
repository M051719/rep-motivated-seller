interface ForeclosureResponse {
  email: string;
  name: string;
  phone: string;
  property_address: string;
  status: string;
  urgency_level?: string;
  missed_payments?: number;
  received_nod?: boolean;
  property_value?: number;
  mortgage_balance?: number;
  challenges?: string;
  difficulties?: string;
  family_impact?: string;
  financial_impact?: string;
  preferred_solution?: string;
  openness_to_options?: string;
}

// CRM Integration Types
type CRMType = "hubspot" | "salesforce" | "pipedrive" | "custom";

interface CRMConfig {
  type: CRMType;
  apiKey?: string;
  baseUrl?: string;
  ownerId?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  securityToken?: string;
}

// Get CRM configuration from environment variables
function getCRMConfig(): CRMConfig | null {
  const crmType = import.meta.env.CRM_TYPE as CRMType;

  if (!crmType) {
    return null;
  }

  const config: CRMConfig = { type: crmType };

  switch (crmType) {
    case "hubspot":
      config.apiKey = import.meta.env.HUBSPOT_API_KEY;
      config.ownerId = import.meta.env.HUBSPOT_OWNER_ID;
      break;
    case "salesforce":
      config.clientId = import.meta.env.SALESFORCE_CLIENT_ID;
      config.clientSecret = import.meta.env.SALESFORCE_CLIENT_SECRET;
      config.username = import.meta.env.SALESFORCE_USERNAME;
      config.password = import.meta.env.SALESFORCE_PASSWORD;
      config.securityToken = import.meta.env.SALESFORCE_SECURITY_TOKEN;
      break;
    case "pipedrive":
      config.apiKey = import.meta.env.PIPEDRIVE_API_KEY;
      break;
    case "custom":
      config.baseUrl = import.meta.env.CUSTOM_CRM_URL;
      config.apiKey = import.meta.env.CUSTOM_CRM_API_KEY;
      break;
  }

  return config;
}

// Create or update a contact in the CRM
export async function syncContactToCRM(
  response: ForeclosureResponse,
): Promise<string | null> {
  const config = getCRMConfig();

  if (!config) {
    console.warn("CRM integration not configured");
    return null;
  }

  try {
    switch (config.type) {
      case "hubspot":
        return await syncToHubSpot(response, config);
      case "salesforce":
        return await syncToSalesforce(response, config);
      case "pipedrive":
        return await syncToPipedrive(response, config);
      case "custom":
        return await syncToCustomCRM(response, config);
      default:
        console.warn(`Unsupported CRM type: ${config.type}`);
        return null;
    }
  } catch (error) {
    console.error("Error syncing contact to CRM:", error);
    throw error;
  }
}

// HubSpot Integration
async function syncToHubSpot(
  response: ForeclosureResponse,
  config: CRMConfig,
): Promise<string> {
  if (!config.apiKey) {
    throw new Error("HubSpot API key not configured");
  }

  // Map foreclosure response to HubSpot contact properties
  const contactProperties = {
    email: response.email,
    firstname: response.name.split(" ")[0],
    lastname: response.name.split(" ").slice(1).join(" ") || "",
    phone: response.phone,
    address: response.property_address,
    foreclosure_status: response.status,
    urgency_level: response.urgency_level,
    missed_payments: response.missed_payments?.toString() || "0",
    received_nod: response.received_nod ? "Yes" : "No",
    property_value: response.property_value?.toString() || "",
    mortgage_balance: response.mortgage_balance?.toString() || "",
    challenges: response.challenges,
    difficulties: response.difficulties,
    family_impact: response.family_impact,
    financial_impact: response.financial_impact,
    preferred_solution: response.preferred_solution,
    openness_to_options: response.openness_to_options,
  };

  // Check if contact already exists
  const searchResponse = await fetch(
    `https://api.hubapi.com/crm/v3/objects/contacts/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: response.email,
              },
            ],
          },
        ],
      }),
    },
  );

  const searchResult = await searchResponse.json();

  if (searchResult.total > 0) {
    // Update existing contact
    const contactId = searchResult.results[0].id;

    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        properties: contactProperties,
      }),
    });

    return contactId;
  } else {
    // Create new contact
    const createResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          properties: contactProperties,
        }),
      },
    );

    const createResult = await createResponse.json();
    return createResult.id;
  }
}

// Salesforce Integration
async function syncToSalesforce(
  response: ForeclosureResponse,
  config: CRMConfig,
): Promise<string> {
  if (
    !config.clientId ||
    !config.clientSecret ||
    !config.username ||
    !config.password
  ) {
    throw new Error("Salesforce credentials not configured");
  }

  // Get access token
  const tokenResponse = await fetch(
    "https://login.salesforce.com/services/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        username: config.username,
        password: `${config.password}${config.securityToken || ""}`,
      }).toString(),
    },
  );

  const tokenResult = await tokenResponse.json();
  const accessToken = tokenResult.access_token;
  const instanceUrl = tokenResult.instance_url;

  if (!accessToken) {
    throw new Error("Failed to authenticate with Salesforce");
  }

  // Check if contact exists
  const searchResponse = await fetch(
    `${instanceUrl}/services/data/v56.0/query?q=${encodeURIComponent(
      `SELECT Id FROM Contact WHERE Email = '${response.email}'`,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const searchResult = await searchResponse.json();

  // Map foreclosure response to Salesforce contact fields
  const contactData = {
    FirstName: response.name.split(" ")[0],
    LastName: response.name.split(" ").slice(1).join(" ") || "Unknown",
    Email: response.email,
    Phone: response.phone,
    MailingStreet: response.property_address,
    Foreclosure_Status__c: response.status,
    Urgency_Level__c: response.urgency_level,
    Missed_Payments__c: response.missed_payments || 0,
    Received_NOD__c: response.received_nod || false,
    Property_Value__c: response.property_value || 0,
    Mortgage_Balance__c: response.mortgage_balance || 0,
    Challenges__c: response.challenges,
    Difficulties__c: response.difficulties,
    Family_Impact__c: response.family_impact,
    Financial_Impact__c: response.financial_impact,
    Preferred_Solution__c: response.preferred_solution,
    Openness_to_Options__c: response.openness_to_options,
  };

  let contactId;

  if (searchResult.records && searchResult.records.length > 0) {
    // Update existing contact
    contactId = searchResult.records[0].Id;

    await fetch(
      `${instanceUrl}/services/data/v56.0/sobjects/Contact/${contactId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(contactData),
      },
    );
  } else {
    // Create new contact
    const createResponse = await fetch(
      `${instanceUrl}/services/data/v56.0/sobjects/Contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(contactData),
      },
    );

    const createResult = await createResponse.json();
    contactId = createResult.id;
  }

  return contactId;
}

// Pipedrive Integration
async function syncToPipedrive(
  response: ForeclosureResponse,
  config: CRMConfig,
): Promise<string> {
  if (!config.apiKey) {
    throw new Error("Pipedrive API key not configured");
  }

  // Map foreclosure response to Pipedrive person fields
  const personData = {
    name: response.name,
    email: [{ value: response.email, primary: true }],
    phone: [{ value: response.phone, primary: true }],
    visible_to: 3, // Visible to entire company
    address: response.property_address,
    "9a103d13e7ae3764a3c80a4546e33c01e24a7dcf": response.status, // Custom field for status
    "9a103d13e7ae3764a3c80a4546e33c01e24a7dcf_urgency": response.urgency_level, // Custom field for urgency
  };

  // Check if person exists
  const searchResponse = await fetch(
    `https://api.pipedrive.com/v1/persons/search?term=${encodeURIComponent(response.email)}&api_token=${config.apiKey}`,
  );

  const searchResult = await searchResponse.json();

  let personId;

  if (
    searchResult.data &&
    searchResult.data.items &&
    searchResult.data.items.length > 0
  ) {
    // Update existing person
    personId = searchResult.data.items[0].item.id;

    await fetch(
      `https://api.pipedrive.com/v1/persons/${personId}?api_token=${config.apiKey}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personData),
      },
    );
  } else {
    // Create new person
    const createResponse = await fetch(
      `https://api.pipedrive.com/v1/persons?api_token=${config.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personData),
      },
    );

    const createResult = await createResponse.json();
    personId = createResult.data.id;
  }

  return personId.toString();
}

// Custom CRM Integration
async function syncToCustomCRM(
  response: ForeclosureResponse,
  config: CRMConfig,
): Promise<string> {
  if (!config.baseUrl || !config.apiKey) {
    throw new Error("Custom CRM configuration not set");
  }

  // Send data to custom webhook
  const webhookResponse = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(response),
  });

  const result = await webhookResponse.json();

  if (!result.id) {
    throw new Error("Custom CRM integration failed: No ID returned");
  }

  return result.id;
}
