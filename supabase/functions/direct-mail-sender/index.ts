import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

console.log("🚀 Direct mail sender function started");

serve(async (req) => {
  console.log(`📥 Received ${req.method} request`);

  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
      },
    );

    console.log("✅ Supabase client initialized");

    const requestData = await req.json();
    console.log("📄 Direct mail request received:", {
      campaignName: requestData.campaignName,
      recipients: requestData.recipients?.length || 0,
    });

    const {
      campaignName,
      templateUrl,
      recipients,
      from,
      mergeVariables,
      mailType = "usps_first_class",
      color = true,
      doubleSided = false,
    } = requestData;

    const lobApiKey = Deno.env.get("LOB_API_KEY");
    if (!lobApiKey) {
      console.error("❌ Lob API key not configured");
      throw new Error("Lob API key not configured");
    }

    // Default sender address
    const defaultFrom = {
      name: "RepMotivatedSeller",
      address_line1: "14603 Gilmore street #7",
      address_city: "Van Nuys",
      address_state: "CA",
      address_zip: "91411",
      address_country: "US",
    };

    const senderAddress = from || defaultFrom;
    console.log("📮 Using sender address:", senderAddress.name);

    // Create mail campaign record
    console.log("💾 Creating campaign record...");
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("mail_campaigns")
      .insert({
        name: campaignName,
        template_url: templateUrl || "default",
        status: "sending",
        total_recipients: recipients.length,
      })
      .select()
      .single();

    if (campaignError) {
      console.error("❌ Campaign creation error:", campaignError);
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    console.log(`✅ Campaign created with ID: ${campaign.id}`);

    let sentCount = 0;
    let failedCount = 0;
    let totalCost = 0;
    const results = [];

    console.log(`📬 Processing ${recipients.length} recipients...`);

    // Process each recipient
    for (const [index, recipient] of recipients.entries()) {
      try {
        console.log(
          `📤 Processing recipient ${index + 1}/${recipients.length}: ${recipient.name}`,
        );

        // Prepare merge variables for this recipient
        const recipientMergeVariables = {
          ...mergeVariables,
          recipient_name: recipient.name,
          recipient_address: `${recipient.address_line1}, ${recipient.address_city}, ${recipient.address_state} ${recipient.address_zip}`,
        };

        // Create postcard HTML content
        const postcardBack = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
                .header { color: #0066cc; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                .content { font-size: 14px; line-height: 1.4; margin-bottom: 15px; }
                .highlight { background: #f0f8ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
                .contact { text-align: center; margin: 15px 0; }
                .phone { font-size: 16px; font-weight: bold; color: #d9534f; }
                .website { font-size: 12px; color: #666; }
                .footer { border-top: 1px solid #ddd; padding-top: 8px; font-size: 10px; color: #888; }
              </style>
            </head>
            <body>
              <div class="header">🏠 Hello ${recipient.name}!</div>
              
              <div class="content">
                We're here to help you avoid foreclosure and explore your options.
              </div>
              
              <div class="highlight">
                <strong>🆘 Free Consultation Available</strong><br>
                Get personalized help from our foreclosure prevention experts.
              </div>
              
              <div class="contact">
                <div class="phone">📞 Call Now: (555) 123-4567</div>
                <div class="website">🌐 Visit: repmotivatedseller.org</div>
              </div>
              
              <div class="footer">
                <strong>RepMotivatedSeller</strong><br>
                14603 Gilmore street #7, Van Nuys, CA 91411<br>
                To opt out, visit repmotivatedseller.org/unsubscribe
              </div>
            </body>
          </html>
        `;

        // Send postcard via Lob
        const lobResponse = await fetch("https://api.lob.com/v1/postcards", {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${lobApiKey}:`)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: {
              name: recipient.name,
              address_line1: recipient.address_line1,
              address_line2: recipient.address_line2 || undefined,
              address_city: recipient.address_city,
              address_state: recipient.address_state,
              address_zip: recipient.address_zip,
              address_country: recipient.address_country || "US",
            },
            from: senderAddress,
            front:
              templateUrl ||
              '<html><body style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-align: center; padding: 50px;"><h1 style="font-size: 24px;">🏠 RepMotivatedSeller</h1><p style="font-size: 16px;">Foreclosure Prevention Experts</p></body></html>',
            back: postcardBack,
            size: "4x6",
            mail_type: mailType,
            color: color,
            double_sided: doubleSided,
          }),
        });

        if (lobResponse.ok) {
          const lobResult = await lobResponse.json();
          sentCount++;
          const cost = parseFloat(
            lobResult.expected_delivery_date ? "0.50" : "0.50",
          ); // Approximate cost
          totalCost += cost;

          console.log(`✅ Sent to ${recipient.name} (${lobResult.id})`);

          results.push({
            recipient: recipient.name,
            status: "sent",
            lob_id: lobResult.id,
            cost: cost.toFixed(2),
            expected_delivery_date: lobResult.expected_delivery_date,
          });

          // Save individual mail record
          await supabaseClient.from("mail_records").insert({
            campaign_id: campaign.id,
            recipient_name: recipient.name,
            recipient_address: recipient,
            lob_id: lobResult.id,
            status: "sent",
            cost: cost,
            expected_delivery_date: lobResult.expected_delivery_date,
          });
        } else {
          const errorData = await lobResponse.text();
          console.error(
            `❌ Lob API error for ${recipient.name}:`,
            lobResponse.status,
            errorData,
          );
          throw new Error(
            `Lob API error: ${lobResponse.status} - ${errorData}`,
          );
        }
      } catch (error) {
        console.error(`❌ Failed to send to ${recipient.name}:`, error);
        failedCount++;

        results.push({
          recipient: recipient.name,
          status: "failed",
          error: error.message,
        });

        // Save failed mail record
        await supabaseClient.from("mail_records").insert({
          campaign_id: campaign.id,
          recipient_name: recipient.name,
          recipient_address: recipient,
          status: "failed",
          error_message: error.message,
          cost: 0,
        });
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Update campaign with final results
    const finalStatus =
      failedCount === 0 ? "completed" : sentCount === 0 ? "failed" : "partial";

    console.log(
      `📊 Campaign results: ${sentCount} sent, ${failedCount} failed, $${totalCost.toFixed(2)} total cost`,
    );

    await supabaseClient
      .from("mail_campaigns")
      .update({
        status: finalStatus,
        sent_count: sentCount,
        failed_count: failedCount,
        total_cost: totalCost,
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);

    console.log("✅ Direct mail campaign completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaign.id,
        results: {
          sent_count: sentCount,
          failed_count: failedCount,
          total_cost: totalCost.toFixed(2),
          status: finalStatus,
        },
        details: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("❌ Direct mail processing error:", error);
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

console.log("🎯 Direct mail sender function ready");
