import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = 'https://ltxqodqlexvojqqxquew.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM'

const supabase = createClient(supabaseUrl, supabaseKey)

// Method 1: Sign in with email and password to get JWT
async function signInAndGetToken() {
  console.log('🔐 Attempting to sign in...')
  
 const { data, error } = await supabase.auth.signInWithPassword({
  email: 'melvin@sofiesentrepreneurialgroup.com',
  password: 'Lamage02#007' // 
})
  
  if (error) {
    console.error('❌ Error signing in:', error.message)
    return null
  }
  
  if (data.session) {
    console.log('✅ Sign in successful!')
    console.log('🎫 JWT Token:', data.session.access_token)
    console.log('👤 User:', data.session.user.email)
    console.log('⏰ Expires at:', new Date(data.session.expires_at * 1000))
    return data.session.access_token
  }
  
  return null
}

// Method 2: Get existing session (if user is already logged in)
async function getExistingToken() {
  console.log('🔍 Checking for existing session...')
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('❌ Error getting session:', error.message)
    return null
  }
  
  if (session) {
    console.log('✅ Found existing session!')
    console.log('🎫 JWT Token:', session.access_token)
    console.log('👤 User:', session.user.email)
    return session.access_token
  } else {
    console.log('⚠️ No existing session found. Need to sign in first.')
    return null
  }
}

// Method 3: Use the JWT token to make authenticated requests
async function useTokenForRequest(token) {
  if (!token) {
    console.log('❌ No token available')
    return
  }
  
  console.log('🚀 Making authenticated request...')
  
  try {
    const response = await fetch('https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/test-hubspot-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // This is how you use the JWT token
        'apikey': supabaseKey
      }
    })
    
    const result = await response.json()
    console.log('📊 API Response:', result)
    return result
  } catch (error) {
    console.error('❌ Request failed:', error)
  }
}

// Method 4: Complete workflow example
async function completeWorkflow() {
  console.log('🏁 Starting complete JWT workflow...')
  
  // First, try to get existing session
  let token = await getExistingToken()
  
  // If no existing session, sign in
  if (!token) {
    console.log('🔑 No existing session, signing in...')
    token = await signInAndGetToken()
  }
  
  // Use the token to make a request
  if (token) {
    await useTokenForRequest(token)
  }
}

// Run the complete workflow
completeWorkflow()

// Alternative: Just get the token quickly
async function quickGetToken() {
  // Option A: If user is already signed in
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return session.access_token
  }
  
  // Option B: Sign in first (you need the real password)
 const { data, error } = await supabase.auth.signInWithPassword({
  email: 'melvin@sofiesentrepreneurialgroup.com',
  password: 'Lamage02#007' // 
})
  
  return data?.session?.access_token || null
}

// Export functions for use in other files
export { signInAndGetToken, getExistingToken, useTokenForRequest, quickGetToken }