typescriptimport { HubSpotService } from '../services/hubspotService';

// Test connection
const testConnection = async () => {
  const results = await HubSpotService.validateConnection();
  console.log(results);
};

// Manual sync
const manualSync = async () => {
  const count = await HubSpotService.bulkSyncToHubSpot(10);
  console.log(`Synced ${count} records`);
};