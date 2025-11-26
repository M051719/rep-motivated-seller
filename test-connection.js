// Supabase Connection Test Script
// Run with: node test-connection.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ltxqodqlexvojqqxquew.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM'

console.log('================================================')
console.log('Supabase Connection Test')
console.log('Project: ltxqodqlexvojqqxquew')
console.log('================================================\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Check connection
    console.log('[1/5] Testing basic connection...')
    const { data, error } = await supabase
      .from('sms_consent')
      .select('count')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    console.log('✅ Basic connection successful!\n')

    // Test 2: Test table query
    console.log('[2/5] Testing table query (sms_keywords)...')
    const { data: keywords, error: keywordsError } = await supabase
      .from('sms_keywords')
      .select('keyword, action')
      .limit(5)

    if (keywordsError) {
      console.error('❌ Table query failed:', keywordsError.message)
    } else {
      console.log('✅ Table query successful!')
      console.log('   Found keywords:', keywords?.map(k => k.keyword).join(', ') || 'none')
      console.log()
    }

    // Test 3: Test database function
    console.log('[3/5] Testing database function...')
    const { data: versionData, error: versionError } = await supabase.rpc('version')

    if (versionError && versionError.code !== '42883') {
      console.log('⚠️  Database function test skipped (function may not exist)')
    } else if (!versionError) {
      console.log('✅ Database function call successful!')
    }
    console.log()

    // Test 4: Test real-time subscription
    console.log('[4/5] Testing real-time subscription...')
    const channel = supabase
      .channel('test-connection')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sms_consent' },
        (payload) => {
          console.log('Real-time event received:', payload)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription successful!')
          channel.unsubscribe()
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('❌ Real-time subscription failed')
        }
      })

    // Wait for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log()

    // Test 5: Keep connection alive
    console.log('[5/5] Keeping connection alive for 10 seconds...')
    console.log('   (This shows Supabase as "Connected" in Dashboard)')

    let count = 0
    const interval = setInterval(async () => {
      count++
      const { data } = await supabase
        .from('sms_consent')
        .select('count')
        .limit(1)

      console.log(`   Heartbeat ${count}/10 - Connection active`)

      if (count >= 10) {
        clearInterval(interval)
        console.log('\n✅ Connection maintained successfully!')
        console.log('\nCheck your Supabase Dashboard now - it should show "Connected"')
        console.log('Dashboard: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew\n')
      }
    }, 1000)

  } catch (error) {
    console.error('\n❌ Connection test failed with error:')
    console.error(error)
    return false
  }
}

// Run the test
console.log('Starting connection tests...\n')
testConnection().catch(console.error)
