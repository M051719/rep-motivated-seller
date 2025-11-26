const { exec } = require('child_process');

console.log('🔍 Testing network connectivity to Supabase...\n');

// Test IPv6 connectivity
console.log('Testing IPv6 (Direct Connection)...');
exec('ping -6 db.ltxqodqlexvojqqxquew.supabase.co', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ IPv6 not available - Use Shared Pooler (IPv4)');
  } else {
    console.log('✅ IPv6 available - Direct Connection recommended');
  }
});

// Test IPv4 connectivity
console.log('Testing IPv4 (Shared Pooler)...');
exec('ping aws-0-us-east-2.pooler.supabase.com', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ IPv4 pooler not reachable');
  } else {
    console.log('✅ IPv4 pooler available - Shared Pooler works');
  }
});

setTimeout(() => {
  console.log('\n📋 Network Test Complete!');
  console.log('Use the connection string that worked in your tests.');
}, 3000);