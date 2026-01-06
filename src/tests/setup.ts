// src/tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup runs before all tests
beforeAll(() => {
  console.log('🚀 Starting service integration tests...\n');
  
  // Set test environment variables if not already set
  if (!process.env.VITE_SUPABASE_URL) {
    process.env.VITE_SUPABASE_URL = 'https://ltxqodqlexvojqqxquew.supabase.co';
  }
  
  console.log('Environment Configuration:');
  console.log('- Supabase URL:', process.env.VITE_SUPABASE_URL);
  console.log('- Google Maps API:', process.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configured' : '⚠️ Not configured');
  console.log('- HubSpot API:', process.env.VITE_HUBSPOT_API_KEY ? '✅ Configured' : '⚠️ Not configured');
  console.log('- Lob API:', process.env.VITE_LOB_API_KEY ? '✅ Configured' : '⚠️ Not configured');
  console.log('- Twilio API:', process.env.VITE_TWILIO_API_KEY ? '✅ Configured' : '⚠️ Not configured\n');
});

// Cleanup after each test
afterEach(() => {
  // Clear any test data or reset state if needed
});

// Teardown after all tests
afterAll(() => {
  console.log('\n✅ All service integration tests completed!');
});

// Global error handler
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
