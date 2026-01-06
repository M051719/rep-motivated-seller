import { HubSpotService } from "../services/hubspotService";

class HubSpotTester {
  async testConnection(): Promise<void> {
    console.log("🔄 Testing HubSpot connection...");

    try {
      const results = await HubSpotService.validateConnection();

      if (results.isValid) {
        console.log("✅ HubSpot connection successful!");
        console.log(`Portal ID: ${results.portalId}`);
        console.log(`Account: ${results.accountName}`);
      } else {
        console.log("❌ HubSpot connection failed!");
        console.log(`Error: ${results.error}`);
      }
    } catch (error) {
      console.error("❌ Connection test error:", error);
    }
  }

  async testContactCreation(): Promise<void> {
    console.log("🔄 Testing contact creation...");

    try {
      const testContact = {
        properties: {
          email: `test-${Date.now()}@example.com`,
          firstname: "Test",
          lastname: "User",
          phone: "555-0123",
          lead_source: "API Test",
        },
      };

      const result = await HubSpotService.createContact(testContact);
      console.log("✅ Test contact created:", result.id);

      return result.id;
    } catch (error) {
      console.error("❌ Contact creation failed:", error);
    }
  }

  async testBulkSync(limit: number = 5): Promise<void> {
    console.log(`🔄 Testing bulk sync (${limit} records)...`);

    try {
      const count = await HubSpotService.bulkSyncToHubSpot(limit);
      console.log(`✅ Bulk sync completed: ${count} records synced`);
    } catch (error) {
      console.error("❌ Bulk sync failed:", error);
    }
  }

  async runAllTests(): Promise<void> {
    console.log("🚀 Starting HubSpot integration tests...\n");

    await this.testConnection();
    console.log("");

    await this.testContactCreation();
    console.log("");

    await this.testBulkSync();
    console.log("");

    console.log("✨ All tests completed!");
  }
}

// Export test functions
export const testConnection = async () => {
  const tester = new HubSpotTester();
  await tester.testConnection();
};

export const manualSync = async (limit: number = 10) => {
  const tester = new HubSpotTester();
  await tester.testBulkSync(limit);
};

export const runAllTests = async () => {
  const tester = new HubSpotTester();
  await tester.runAllTests();
};

// Auto-run if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
