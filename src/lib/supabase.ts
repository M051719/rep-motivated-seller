import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'RepMotivatedSeller'
    }
  }
});

// Enhanced connection test with timeout and better error isolation
export const testConnection = async (timeoutMs: number = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Step 1: Test auth session (fast metadata probe)
    console.log('1️⃣ Checking auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('⚠️ Session check failed:', sessionError.message);
    } else {
      console.log('✅ Auth system responsive:', sessionData.session ? 'Authenticated' : 'Anonymous');
    }

    // Step 2: Test basic database connectivity with timeout
    console.log('2️⃣ Testing database connection...');
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)
      .abortSignal(controller.signal);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
      
      // Differentiate between auth failures and RLS
      if (error.code === 'PGRST301') {
        console.log('🔍 RLS blocking access (this might be expected)');
      } else if (error.code === '401') {
        console.log('🔍 Authentication required');
      } else {
        console.log('🔍 Other database error:', error.code);
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`❌ Connection test timed out after ${timeoutMs}ms`);
    } else {
      console.error('❌ Connection test failed:', error.message);
    }
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Separate auth-only test for faster debugging
export const testAuth = async (timeoutMs: number = 3000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    console.log('✅ Auth test successful:', session ? 'Authenticated' : 'Anonymous');
    return { success: true, authenticated: !!session, user: session?.user || null };
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`❌ Auth test timed out after ${timeoutMs}ms`);
    } else {
      console.error('❌ Auth test failed:', error.message);
    }
    return { success: false, authenticated: false, user: null };
  } finally {
    clearTimeout(timeoutId);
  }
};