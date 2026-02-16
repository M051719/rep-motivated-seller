import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * MailerLite Webhook Handler
 *
 * Processes MailerLite webhook events and syncs data to HubSpot
 *
 * Supported events:
 * - subscriber.created
 * - subscriber.updated
 * - subscriber.opened_email
 * - subscriber.clicked_email
 * - subscriber.added_to_group
 * - campaign.sent
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify webhook signature (if configured)
    const signature = req.headers.get("x-mailerlite-signature");
    const webhookSecret = Deno.env.get("MAILERLITE_WEBHOOK_SECRET");

    if (webhookSecret && signature) {
      // Verify signature (MailerLite uses HMAC-SHA256)
      const body = await req.text();
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
      );

      const expectedSignature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(body),
      );

      const expectedHex = Array.from(new Uint8Array(expectedSignature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== expectedHex) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Parse body if we already read it
      var webhookPayload = JSON.parse(body);
    } else {
      // No signature verification
      var webhookPayload = await req.json();
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process webhook using database function
    const { data, error } = await supabase.rpc("handle_mailerlite_webhook", {
      webhook_payload: webhookPayload,
    });

    if (error) {
      console.error("Webhook processing error:", error);
      return new Response(
        JSON.stringify({
          error: "Webhook processing failed",
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log successful processing
    console.log("Webhook processed:", {
      event_type: webhookPayload.type,
      subscriber_email: webhookPayload.data?.subscriber?.email,
      result: data,
    });

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
        data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
