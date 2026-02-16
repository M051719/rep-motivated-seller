import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

console.log("🔒 Compliance logger function started");

interface ComplianceLogEntry {
  event_type:
    | "data_access"
    | "payment_processing"
    | "privacy_request"
    | "data_retention"
    | "security_incident";
  user_id?: string;
  resource_type: string;
  resource_id?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  pci_dss_relevant: boolean;
  glba_relevant: boolean;
  metadata?: any;
  compliance_notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const logEntry: ComplianceLogEntry = await req.json();

    console.log(
      `📊 Logging compliance event: ${logEntry.event_type} - ${logEntry.action}`,
    );

    // Validate required fields
    if (!logEntry.event_type || !logEntry.resource_type || !logEntry.action) {
      throw new Error(
        "Missing required fields: event_type, resource_type, action",
      );
    }

    // Enhanced log entry with compliance flags
    const enhancedLogEntry = {
      ...logEntry,
      timestamp: new Date().toISOString(),
      ip_address:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
      // Auto-determine compliance relevance if not specified
      pci_dss_relevant:
        logEntry.pci_dss_relevant ??
        (logEntry.event_type === "payment_processing" ||
          logEntry.resource_type.includes("payment") ||
          logEntry.resource_type.includes("card")),
      glba_relevant:
        logEntry.glba_relevant ??
        (logEntry.resource_type.includes("financial") ||
          logEntry.resource_type.includes("foreclosure") ||
          logEntry.resource_type.includes("mortgage")),
    };

    // Create compliance log table if not exists
    const { error: schemaError } = await supabaseClient.rpc(
      "create_compliance_log_table",
    );
    if (schemaError) {
      console.log("Compliance table already exists or creation not needed");
    }

    // Insert compliance log entry
    const { data, error } = await supabaseClient
      .from("compliance_log")
      .insert([enhancedLogEntry])
      .select();

    if (error) {
      console.error("❌ Error saving compliance log:", error);
      throw error;
    }

    console.log("✅ Compliance log entry saved:", data[0].id);

    // Check for high-risk events and alert
    if (
      logEntry.event_type === "security_incident" ||
      logEntry.action.includes("unauthorized") ||
      logEntry.action.includes("breach")
    ) {
      console.log("🚨 High-risk compliance event detected!");

      // Send alert (implement your alerting mechanism)
      await sendComplianceAlert(enhancedLogEntry);
    }

    return new Response(
      JSON.stringify({
        success: true,
        log_id: data[0].id,
        pci_dss_logged: enhancedLogEntry.pci_dss_relevant,
        glba_logged: enhancedLogEntry.glba_relevant,
        timestamp: enhancedLogEntry.timestamp,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("❌ Compliance logging error:", error);

    // Even if logging fails, we should alert about it
    try {
      await sendComplianceAlert({
        event_type: "security_incident",
        resource_type: "compliance_system",
        action: "logging_failure",
        metadata: { error: error.message },
        pci_dss_relevant: true,
        glba_relevant: true,
        timestamp: new Date().toISOString(),
      } as ComplianceLogEntry);
    } catch (alertError) {
      console.error("❌ Failed to send compliance alert:", alertError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

async function sendComplianceAlert(logEntry: ComplianceLogEntry) {
  try {
    console.log(`🚨 Sending compliance alert for: ${logEntry.event_type}`);

    // This would integrate with your alerting system
    // For now, we'll just log it prominently

    const alertData = {
      severity: "HIGH",
      compliance_type: [
        ...(logEntry.pci_dss_relevant ? ["PCI_DSS"] : []),
        ...(logEntry.glba_relevant ? ["GLBA"] : []),
      ],
      event: logEntry,
      requires_immediate_attention: true,
    };

    console.log("🚨 COMPLIANCE ALERT:", JSON.stringify(alertData, null, 2));

    // You could send this to:
    // - Email notification system
    // - Slack/Teams webhook
    // - Security incident management system
    // - SMS alerts for critical events

    return true;
  } catch (error) {
    console.error("❌ Alert sending failed:", error);
    return false;
  }
}

console.log("🎯 Compliance logger function ready");
