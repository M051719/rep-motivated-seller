// src/tests/setup.ts
import { beforeAll, afterAll, afterEach } from "vitest";
import { setupAPIsMocks, resetAPIMocks } from "./setup/apiMocks";

// Setup runs before all tests
beforeAll(() => {
  console.log("🚀 Starting service integration tests...\n");

  setupAPIsMocks();

  // Set test environment variables if not already set
  if (!process.env.VITE_SUPABASE_URL) {
    process.env.VITE_SUPABASE_URL = "https://ltxqodqlexvojqqxquew.supabase.co";
  }
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    process.env.HUBSPOT_ACCESS_TOKEN = "test-token";
  }

  console.log("Environment Configuration:");
  console.log("- Supabase URL:", process.env.VITE_SUPABASE_URL);
  console.log(
    "- Google Maps API:",
    process.env.VITE_GOOGLE_MAPS_API_KEY
      ? "✅ Configured"
      : "⚠️ Not configured",
  );
  console.log(
    "- HubSpot API:",
    process.env.VITE_HUBSPOT_API_KEY ? "✅ Configured" : "⚠️ Not configured",
  );
  console.log(
    "- Lob API:",
    process.env.VITE_LOB_API_KEY ? "✅ Configured" : "⚠️ Not configured",
  );
  console.log(
    "- Twilio API:",
    process.env.VITE_TWILIO_API_KEY ? "✅ Configured" : "⚠️ Not configured\n",
  );
});

// Cleanup after each test
afterEach(() => {
  // Clear any test data or reset state if needed
});

// Teardown after all tests
afterAll(() => {
  resetAPIMocks();
  console.log("\n✅ All service integration tests completed!");
});

// Global error handler
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
