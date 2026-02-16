import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Missing or invalid Authorization header",
          message:
            'This endpoint requires a valid JWT token. Please include "Authorization: Bearer q6djVCdScS2VQeLx5EG+8jBqvw7Ox8g9RCcE8UGZUTewCYmpYmgDkUlDzh3/9dbNCx00U/xyOj0e+HvLdjGiUA==" in your request headers.',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");

    // Get required environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          message: "Missing required Supabase environment variables",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create Supabase client using the JWT token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Invalid JWT token",
          message:
            "The provided JWT token is invalid or expired. Please obtain a new token by logging in.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user is an admin
    const { data: adminProfile, error: adminError } = await supabaseClient
      .from("admin_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile || adminProfile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse URL to get the path
    const url = new URL(req.url);
    const path = url.pathname.split("/admin-dashboard/")[1];

    // Handle different endpoints
    if (req.method === "GET") {
      // Get property submissions with optional filtering
      if (path === "submissions") {
        const status = url.searchParams.get("status");
        const assignedTo = url.searchParams.get("assignedTo");
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        let query = supabaseClient
          .from("property_submissions")
          .select(
            `
            *,
            follow_ups(*)
          `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq("status", status);
        }

        if (assignedTo) {
          query =
            assignedTo === "unassigned"
              ? query.is("assigned_to", null)
              : query.eq("assigned_to", assignedTo);
        }

        const { data, error, count } = await query;

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get total count for pagination
        const { count: totalCount } = await supabaseClient
          .from("property_submissions")
          .select("*", { count: "exact", head: true });

        return new Response(
          JSON.stringify({
            data,
            pagination: {
              page,
              limit,
              total: totalCount,
              pages: Math.ceil(totalCount / limit),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Get a single property submission by ID
      if (path.startsWith("submissions/") && path.split("/").length === 2) {
        const id = path.split("/")[1];

        const { data, error } = await supabaseClient
          .from("property_submissions")
          .select(
            `
            *,
            follow_ups(*)
          `,
          )
          .eq("id", id)
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get dashboard statistics
      if (path === "stats") {
        // Get counts by status
        const { data: statusCounts, error: statusError } =
          await supabaseClient.rpc("get_submission_counts_by_status");

        // Get counts by assigned admin
        const { data: assignedCounts, error: assignedError } =
          await supabaseClient.rpc("get_submission_counts_by_admin");

        // Get recent activity
        const { data: recentActivity, error: activityError } =
          await supabaseClient
            .from("follow_ups")
            .select(
              `
            *,
            property_submissions(id, address)
          `,
            )
            .order("created_at", { ascending: false })
            .limit(5);

        if (statusError || assignedError || activityError) {
          return new Response(
            JSON.stringify({
              error:
                statusError?.message ||
                assignedError?.message ||
                activityError?.message,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify({
            statusCounts: statusCounts || [],
            assignedCounts: assignedCounts || [],
            recentActivity: recentActivity || [],
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Handle POST requests
    if (req.method === "POST") {
      const body = await req.json();

      // Add a follow-up to a property submission
      if (path === "follow-ups") {
        const { property_id, notes, follow_up_type, scheduled_date } = body;

        if (!property_id || !notes || !follow_up_type) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        const { data, error } = await supabaseClient
          .from("follow_ups")
          .insert({
            property_id,
            notes,
            follow_up_type,
            scheduled_date: scheduled_date || null,
            created_by: user.id,
          })
          .select();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ data }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle PATCH requests
    if (req.method === "PATCH") {
      const body = await req.json();

      // Update a property submission
      if (path.startsWith("submissions/") && path.split("/").length === 2) {
        const id = path.split("/")[1];
        const { status, assigned_to, ...otherFields } = body;

        const { data, error } = await supabaseClient
          .from("property_submissions")
          .update({
            status,
            assigned_to,
            ...otherFields,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // If no matching endpoint is found
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
