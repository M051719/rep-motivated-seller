import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { submissionId, scheduleType, notes, assignedTo } = await req.json();

    if (!submissionId) {
      throw new Error("Missing submission ID");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get submission details
    const { data: submission, error: submissionError } = await supabaseClient
      .from("property_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      throw new Error("Submission not found");
    }

    // Calculate follow-up dates based on schedule type
    const followUpDates = [];
    const now = new Date();

    switch (scheduleType) {
      case "urgent":
        // Schedule follow-ups for tomorrow, 3 days, and 1 week
        followUpDates.push(
          new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        );
        break;
      case "standard":
        // Schedule follow-ups for 3 days, 1 week, and 2 weeks
        followUpDates.push(
          new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        );
        break;
      case "relaxed":
        // Schedule follow-ups for 1 week, 2 weeks, and 1 month
        followUpDates.push(
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        );
        break;
      default:
        // Default to 3 days, 1 week, 2 weeks
        followUpDates.push(
          new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        );
    }

    // Create follow-up entries
    const followUps = followUpDates.map((date, index) => ({
      submission_id: submissionId,
      scheduled_date: date.toISOString(),
      status: "pending",
      notes:
        notes ||
        `Automated follow-up #${index + 1} for ${submission.contact_name}`,
      assigned_to: assignedTo || null,
    }));

    const { data: createdFollowUps, error: followUpError } =
      await supabaseClient.from("follow_ups").insert(followUps).select();

    if (followUpError) {
      throw followUpError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${followUps.length} follow-ups scheduled`,
        followUps: createdFollowUps,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
