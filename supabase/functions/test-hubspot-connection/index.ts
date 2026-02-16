// supabase/functions/test-hubspot-connection/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

interface HubSpotContactResponse {
  id?: string;
  properties?: {
    email?: string;
    firstname?: string;
    lastname?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const hubspotApiKey = Deno.env.get("HUBSPOT_API_KEY");

    if (!hubspotApiKey) {
      console.error("HUBSPOT_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({
          error: "HubSpot API key not configured",
          success: false,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        },
      );
    }

    console.log("Testing HubSpot connection...");

    // Test the HubSpot API by trying to get account info
    const hubspotUrl = "https://api.hubapi.com/crm/v3/objects/contacts?limit=1";

    const hubspotResponse = await fetch(hubspotUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${hubspotApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await hubspotResponse.text();
    console.log("HubSpot API Response Status:", hubspotResponse.status);
    console.log("HubSpot API Response:", responseText.substring(0, 500));

    if (!hubspotResponse.ok) {
      console.error("HubSpot API Error:", responseText);
      return new Response(
        JSON.stringify({
          error: `HubSpot API error: ${hubspotResponse.status} - ${responseText}`,
          success: false,
          status: hubspotResponse.status,
          details: responseText,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    let hubspotData;
    try {
      hubspotData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing HubSpot response:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON response from HubSpot API",
          success: false,
          raw_response: responseText,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        },
      );
    }

    // Success response
    const successResponse = {
      success: true,
      message: "HubSpot connection successful!",
      api_key_status: "Valid",
      test_timestamp: new Date().toISOString(),
      hubspot_response: {
        total_contacts: hubspotData.total || 0,
        has_results: hubspotData.results && hubspotData.results.length > 0,
        sample_contact:
          hubspotData.results && hubspotData.results.length > 0
            ? {
                id: hubspotData.results[0].id,
                email: hubspotData.results[0].properties?.email || "N/A",
                name:
                  `${hubspotData.results[0].properties?.firstname || ""} ${hubspotData.results[0].properties?.lastname || ""}`.trim() ||
                  "N/A",
              }
            : "No contacts found",
      },
    };

    console.log("HubSpot connection test successful");

    return new Response(JSON.stringify(successResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Unexpected error testing HubSpot connection:", error);

    return new Response(
      JSON.stringify({
        error: "Unexpected error occurred",
        success: false,
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      },
    );
  }
});
