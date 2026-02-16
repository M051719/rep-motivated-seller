// Example 1: Direct import with hardcoded keys
import { supabase } from "./src/lib/supabase";

// Example 2: Import with environment variables
import { supabase as envSupabase } from "./src/lib/supabase-env";

// Example function to get data
async function getForeclosureSubmissions() {
  const { data, error } = await supabase
    .from("foreclosure_responses")
    .select("*");

  if (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }

  return data;
}

// Example function to call Edge Function
async function callAdminDashboard() {
  const { data, error } = await supabase.functions.invoke("admin-dashboard", {
    body: { action: "summary" },
  });

  if (error) {
    console.error("Error calling function:", error);
    return null;
  }

  return data;
}
