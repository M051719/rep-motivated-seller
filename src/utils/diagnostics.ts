import { supabase, testAuth, testConnection } from '../lib/supabase';

interface DiagnosticResult {
  environment: boolean;
  auth: { success: boolean; authenticated: boolean; user: any };
  database: boolean;
  rls: { accessible: boolean; error?: string };
  network: boolean;
  overall: 'healthy' | 'degraded' | 'failed';
}

export const runEnhancedDiagnostics = async (): Promise<DiagnosticResult> => {
  console.log('🏥 Running Enhanced RepMotivatedSeller Diagnostics...\n');

  const result: DiagnosticResult = {
    environment: false,
    auth: { success: false, authenticated: false, user: null },
    database: false,
    rls: { accessible: false },
    network: false,
    overall: 'failed'
  };

  // 1. Environment Check
  console.log('1️⃣ Environment Variables:');
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  result.environment = !!(envUrl && envKey && envUrl.startsWith('http'));
  
  console.log(`   URL: ${envUrl ? '✅ Set' : '❌ Missing'} ${envUrl ? `(${envUrl.substring(0, 30)}...)` : ''}`);
  console.log(`   Key: ${envKey ? '✅ Set' : '❌ Missing'} ${envKey ? `(${envKey.substring(0, 20)}...)` : ''}`);
  console.log(`   URL Format: ${envUrl?.startsWith('http') ? '✅ Valid' : '❌ Invalid'}\n`);

  // 2. Fast Auth Test (metadata probe)
  console.log('2️⃣ Authentication Test:');
  result.auth = await testAuth(3000);
  
  if (result.auth.success) {
    console.log(`   Status: ✅ Auth system responsive`);
    console.log(`   User: ${result.auth.authenticated ? '✅ Authenticated' : '✅ Anonymous'}`);
    if (result.auth.user) {
      console.log(`   User ID: ${result.auth.user.id}`);
      console.log(`   Email: ${result.auth.user.email || 'N/A'}`);
    }
  } else {
    console.log(`   Status: ❌ Auth system unresponsive`);
  }

  // 3. Network/Database Connectivity
  console.log('\n3️⃣ Database Connection:');
  result.database = await testConnection(5000);
  result.network = result.database; // If DB test passes, network is good

  // 4. RLS Test with Better Error Handling
  console.log('\n4️⃣ Row Level Security Test:');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const { data, error } = await supabase
      .from('foreclosure_responses')
      .select('count')
      .limit(1)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      result.rls = { accessible: false, error: error.message };
      console.log(`   RLS Test: ❌ ${error.code} - ${error.message}`);
      
      // Provide helpful context
      if (error.code === 'PGRST301') {
        console.log(`   🔍 This is normal if no RLS policy allows anonymous access`);
      } else if (error.code === '401') {
        console.log(`   🔍 Authentication required for this operation`);
      } else if (error.code === 'PGRST116') {
        console.log(`   🔍 Table not found - check your database schema`);
      }
    } else {
      result.rls = { accessible: true };
      console.log(`   RLS Test: ✅ Accessible (returned ${data?.length || 0} rows)`);
    }
  } catch (error: any) {
    result.rls = { accessible: false, error: error.message };
    if (error.name === 'AbortError') {
      console.log(`   RLS Test: ❌ Timed out after 5000ms`);
    } else {
      console.log(`   RLS Test: ❌ Failed - ${error.message}`);
    }
  }

  // 5. Overall Health Assessment
  console.log('\n5️⃣ Overall Health:');
  if (result.environment && result.auth.success && result.database) {
    result.overall = 'healthy';
    console.log('   Status: 🟢 HEALTHY - All systems operational');
  } else if (result.environment && result.auth.success) {
    result.overall = 'degraded';
    console.log('   Status: 🟡 DEGRADED - Some issues detected');
  } else {
    result.overall = 'failed';
    console.log('   Status: 🔴 FAILED - Critical issues need attention');
  }

  console.log('\n🏁 Enhanced Diagnostics Complete!');
  return result;
};

// Quick health check for production monitoring
export const quickHealthCheck = async (): Promise<boolean> => {
  try {
    const authResult = await testAuth(2000);
    const dbResult = await testConnection(3000);
    return authResult.success && dbResult;
  } catch {
    return false;
  }
};