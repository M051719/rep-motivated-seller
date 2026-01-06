const response = await fetch('https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/send-direct-mail', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM'
  },
  body: JSON.stringify({
    to_address: {
      name: 'Test Property Owner',
      address_line1: '123 Test St',
      address_city: 'Los Angeles',
      address_state: 'CA',
      address_zip: '90001'
    },
    template_type: 'land_acquisition',
    property_data: {
      address: '123 Test St, Los Angeles, CA 90001',
      estimated_value: 500000
    },
    campaign_id: 'test_campaign_dec10'
  })
});

const data = await response.json();
console.log('Response:', JSON.stringify(data, null, 2));
