import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE";
  table: string;
  record: any;
  schema: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body: WebhookPayload = await req.json();
    const { record, type } = body;

    // Get notification settings
    const { data: settings } = await supabaseClient
      .from("notification_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings?.email_notifications) {
      return new Response(
        JSON.stringify({ message: "Email notifications disabled" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Determine email type and recipients
    let emailPayload: EmailPayload;
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
    const urgentEmail = Deno.env.get("URGENT_EMAIL") ?? "";
    const fromEmail =
      Deno.env.get("FROM_EMAIL") ?? "noreply@repmotivatedseller.org";

    if (type === "INSERT") {
      // New submission
      const isUrgent = record.urgency_level === "high";
      const recipient = isUrgent ? urgentEmail : adminEmail;

      emailPayload = {
        to: recipient,
        subject: isUrgent
          ? "🚨 URGENT: New Foreclosure Assistance Request"
          : "New Foreclosure Assistance Request",
        html: generateEmailTemplate({
          title: isUrgent
            ? "URGENT: New Foreclosure Assistance Request"
            : "New Foreclosure Assistance Request",
          name: record.name,
          email: record.email,
          phone: record.phone,
          urgencyLevel: record.urgency_level,
          missedPayments: record.missed_payments,
          receivedNod: record.received_nod,
          propertyAddress: record.property_address,
        }),
        from: fromEmail,
      };
    } else if (type === "UPDATE" && record.status !== "new") {
      // Status update
      emailPayload = {
        to: record.email,
        subject: `Your Foreclosure Assistance Request: Status Update`,
        html: generateStatusUpdateTemplate({
          name: record.name,
          status: record.status,
          notes: record.notes,
        }),
        from: fromEmail,
      };
    } else {
      return new Response(
        JSON.stringify({ message: "No email sent for this event" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Send email via MailerLite API
    const mailerliteApiKey = Deno.env.get("MAILERLITE_API_KEY") ?? "";
    const response = await fetch("https://api.mailerlite.com/api/v2/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MailerLite-ApiKey": mailerliteApiKey,
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

function generateEmailTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        .urgency-high { color: #dc3545; font-weight: bold; }
        .urgency-medium { color: #fd7e14; font-weight: bold; }
        .urgency-low { color: #28a745; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${data.title}</h2>
        </div>
        <div class="content">
          <p>A new foreclosure assistance request has been submitted with the following details:</p>

          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>

          <h3>Property Information</h3>
          <p><strong>Address:</strong> ${data.propertyAddress || "Not provided"}</p>

          <h3>Situation Details</h3>
          <p><strong>Urgency Level:</strong> <span class="urgency-${data.urgencyLevel}">${data.urgencyLevel.toUpperCase()}</span></p>
          <p><strong>Missed Payments:</strong> ${data.missedPayments || 0}</p>
          <p><strong>Received Notice of Default:</strong> ${data.receivedNod ? "Yes" : "No"}</p>

          <p>Please log in to the admin dashboard to view full details and take appropriate action.</p>

          <p><a href="${Deno.env.get("SITE_URL")}/admin/dashboard">Access Admin Dashboard</a></p>
        </div>
        <div class="footer">
          <p>This is an automated message from RepMotivatedSeller Foreclosure Assistance Platform.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateStatusUpdateTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        .status { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Your Foreclosure Assistance Request: Status Update</h2>
        </div>
        <div class="content">
          <p>Hello ${data.name},</p>

          <p>We wanted to let you know that the status of your foreclosure assistance request has been updated.</p>

          <p><strong>Current Status:</strong> <span class="status">${data.status.toUpperCase()}</span></p>

          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}

          <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>

          <p>Thank you for choosing RepMotivatedSeller for your foreclosure assistance needs.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from RepMotivatedSeller Foreclosure Assistance Platform.</p>
          <p>© ${new Date().getFullYear()} RepMotivatedSeller. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
