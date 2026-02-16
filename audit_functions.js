const SUPABASE_URL = "https://ltxqodqlexvojqqxquew.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZUEibmFub24iLCJpYXQiOjE3MzUxNDY3MjksImV4cCI6MjA1MDcyMjcyOX0.sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg";

// All your deployed functions organized by category
const functionCategories = {
  // Core Business Functions (Production Ready)
  core: [
    "foreclosure-submission",
    "property-submission-form",
    "notification-dispatcher",
    "follow-up-scheduler",
    "crm-sync",
    "payment-webhook",
  ],

  // Authentication & Security (Critical)
  auth: [
    "auth-management",
    "auth-test",
    "auth-redirect-handler",
    "manage-user-roles",
    "admin-auth",
    "admin-auth-fix",
    "webhook-security",
  ],

  // Communication & Notifications (Active)
  communication: [
    "send-notification-email",
    "send-sms-notification",
    "sms-handler",
    "sms-webhook",
    "send-sms",
    "sms-status-webhook",
    "ai-voice-handler",
    "ai-voice-response",
    "twilio-voice-handler",
    "email-automation",
    "send-mail",
  ],

  // Admin & Dashboard (Management)
  admin: [
    "admin-dashboard",
    "admin-dashboard-fix",
    "dashboard-data",
    "security-dashboard",
    "secure-admin-proxy",
  ],

  // Integration & APIs (External Services)
  integration: [
    "external-api-integration",
    "hubspot-sync",
    "hubspot-api",
    "hubspot-bulk-sync",
    "crm-integration",
    "weather-api",
  ],

  // Security & Compliance (Critical Infrastructure)
  security: [
    "security-monitor",
    "security-scanner",
    "security-audit",
    "security-incident-response",
    "generate-security-report",
    "webhook-security",
    "secure-upload",
    "secure-file-upload",
  ],

  // Marketing & CRM (Business Operations)
  marketing: [
    "marketing-preferences",
    "marketing-suppression-list",
    "marketing-events-webhook",
    "mail-campaign-manager",
    "mail-webhooks",
    "update-mail-status",
  ],

  // Education & Learning (Platform Features)
  education: [
    "generate-certificate",
    "verify-certificate",
    "track-learning-progress",
    "track-learning-events",
    "lesson-engagement",
    "course-completion",
    "track-video-progress",
  ],

  // Development & Testing (Non-Production)
  development: [
    "debug-form-submission",
    "check-form-configuration",
    "public-form-debug",
    "jwt-debug",
    "debug-jwt",
    "webhook-test",
    "test-cors",
    "example-function",
  ],

  // Duplicates & Legacy (Cleanup Candidates)
  cleanup: [
    "sms-fallback-handler",
    "voice-fallback-handler",
    "voice-response-fallback",
    "public-form-handler-fixed",
    "react-hooks-alt",
    "cors-handler",
    "cors-middleware",
  ],

  // Utility & Analytics (Support Functions)
  utility: [
    "property-valuation",
    "call-analytics",
    "db-performance-monitor",
    "analyze-unused-indexes",
    "consolidate-policies",
    "inspect-table-structure",
    "get-table-info",
    "find-user-column",
  ],
};

async function testFunction(functionName) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      name: functionName,
      status: response.status,
      accessible: response.status !== 404,
      error: response.status >= 400 ? await response.text() : null,
    };
  } catch (error) {
    return {
      name: functionName,
      status: "ERROR",
      accessible: false,
      error: error.message,
    };
  }
}

async function auditAllFunctions() {
  console.log("🔍 Starting comprehensive function audit...\n");

  const results = {
    total: 0,
    accessible: 0,
    errors: 0,
    categories: {},
  };

  for (const [category, functions] of Object.entries(functionCategories)) {
    console.log(`📂 Testing ${category.toUpperCase()} functions...`);
    results.categories[category] = {
      total: functions.length,
      accessible: 0,
      errors: 0,
      functions: [],
    };

    for (const functionName of functions) {
      const result = await testFunction(functionName);
      results.categories[category].functions.push(result);

      if (result.accessible) {
        results.categories[category].accessible++;
        results.accessible++;
      } else {
        results.categories[category].errors++;
        results.errors++;
      }

      results.total++;

      console.log(
        `  ${result.accessible ? "✅" : "❌"} ${functionName} (${result.status})`,
      );
    }
    console.log("");
  }

  // Summary Report
  console.log("📊 AUDIT SUMMARY");
  console.log("================");
  console.log(`Total Functions: ${results.total}`);
  console.log(
    `Accessible: ${results.accessible} (${Math.round((results.accessible / results.total) * 100)}%)`,
  );
  console.log(
    `Errors: ${results.errors} (${Math.round((results.errors / results.total) * 100)}%)`,
  );
  console.log("");

  // Category Breakdown
  for (const [category, data] of Object.entries(results.categories)) {
    const successRate = Math.round((data.accessible / data.total) * 100);
    console.log(
      `${category.toUpperCase()}: ${data.accessible}/${data.total} (${successRate}%)`,
    );
  }

  return results;
}

auditAllFunctions();
