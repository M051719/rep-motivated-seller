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
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Create Supabase client with user token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    // Verify the user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if user has admin role
    const { data: adminProfile } = await supabaseClient
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!adminProfile) {
      throw new Error("Not authorized. Admin access required.");
    }

    const { action, period, filters } = await req.json();

    // Handle different dashboard data requests
    switch (action) {
      case "summary":
        return await getSummaryData(supabaseAdmin);
      case "recent_submissions":
        return await getRecentSubmissions(supabaseAdmin, filters);
      case "upcoming_followups":
        return await getUpcomingFollowups(supabaseAdmin, filters);
      case "performance_metrics":
        return await getPerformanceMetrics(supabaseAdmin, period);
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getSummaryData(supabase) {
  // Get counts from different tables
  const [
    propertySubmissionsResult,
    newSubmissionsResult,
    followupsResult,
    completedFollowupsResult,
  ] = await Promise.all([
    supabase
      .from("property_submissions")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("property_submissions")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ),
    supabase.from("follow_ups").select("*", { count: "exact", head: true }),
    supabase
      .from("follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  // Calculate conversion rate
  const totalSubmissions = propertySubmissionsResult.count || 0;
  const completedFollowups = completedFollowupsResult.count || 0;
  const conversionRate =
    totalSubmissions > 0
      ? Math.round((completedFollowups / totalSubmissions) * 100)
      : 0;

  return new Response(
    JSON.stringify({
      total_submissions: propertySubmissionsResult.count,
      new_submissions: newSubmissionsResult.count,
      pending_followups: followupsResult.count,
      completed_followups: completedFollowupsResult.count,
      conversion_rate: conversionRate,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function getRecentSubmissions(supabase, filters = {}) {
  let query = supabase
    .from("property_submissions")
    .select(
      `
      id,
      property_address,
      city,
      state,
      foreclosure_status,
      contact_name,
      contact_email,
      contact_phone,
      created_at
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  // Apply filters if provided
  if (filters.status) {
    query = query.eq("foreclosure_status", filters.status);
  }

  if (filters.search) {
    query = query.or(
      `property_address.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({ submissions: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getUpcomingFollowups(supabase, filters = {}) {
  let query = supabase
    .from("follow_ups")
    .select(
      `
      id,
      scheduled_date,
      status,
      notes,
      property_submissions (
        id,
        property_address,
        contact_name,
        contact_phone
      )
    `,
    )
    .eq("status", "pending")
    .order("scheduled_date", { ascending: true })
    .limit(10);

  // Apply filters if provided
  if (filters.assignedTo) {
    query = query.eq("assigned_to", filters.assignedTo);
  }

  if (filters.dateRange) {
    query = query
      .lte("scheduled_date", filters.dateRange.end)
      .gte("scheduled_date", filters.dateRange.start);
  }

  const { data, error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({ followups: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getPerformanceMetrics(supabase, period = "week") {
  // Calculate date range based on period
  const now = new Date();
  let startDate;

  switch (period) {
    case "day":
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "quarter":
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  // Get submissions and completed follow-ups in the period
  const [submissionsResult, followupsResult] = await Promise.all([
    supabase
      .from("property_submissions")
      .select("created_at")
      .gte("created_at", startDate.toISOString()),
    supabase
      .from("follow_ups")
      .select("status, scheduled_date")
      .eq("status", "completed")
      .gte("updated_at", startDate.toISOString()),
  ]);

  if (submissionsResult.error) throw submissionsResult.error;
  if (followupsResult.error) throw followupsResult.error;

  // Group by date for time series data
  const submissionsByDate = groupByDate(submissionsResult.data || []);
  const followupsByDate = groupByDate(followupsResult.data || []);

  return new Response(
    JSON.stringify({
      period,
      submissions: {
        total: submissionsResult.data?.length || 0,
        by_date: submissionsByDate,
      },
      followups: {
        total: followupsResult.data?.length || 0,
        by_date: followupsByDate,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

function groupByDate(items) {
  const grouped = {};

  items.forEach((item) => {
    const date = new Date(item.created_at || item.scheduled_date);
    const dateStr = date.toISOString().split("T")[0];

    if (!grouped[dateStr]) {
      grouped[dateStr] = 0;
    }

    grouped[dateStr]++;
  });

  return grouped;
}
