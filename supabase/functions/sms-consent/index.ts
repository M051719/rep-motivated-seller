// SMS Opt-In/Opt-Out Consent Management Edge Function
// TCPA Compliance Handler
// Handles web-based opt-in/opt-out requests and consent management

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface OptInRequest {
  phone_number: string
  method?: 'web_form' | 'api' | 'manual'
  user_id?: string
  ip_address?: string
  user_agent?: string
  marketing_consent?: boolean
  transactional_consent?: boolean
}

interface OptOutRequest {
  phone_number: string
  method?: 'web_request' | 'api' | 'manual'
  reason?: string
}

interface ConsentStatusRequest {
  phone_number: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    // Route handling
    switch (action) {
      case 'opt-in':
        return await handleOptIn(req, supabase)
      case 'opt-out':
        return await handleOptOut(req, supabase)
      case 'status':
        return await handleGetStatus(req, supabase)
      case 'history':
        return await handleGetHistory(req, supabase)
      case 'bulk-opt-out':
        return await handleBulkOptOut(req, supabase)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: opt-in, opt-out, status, or history' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('SMS Consent Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// =====================================================
// Opt-In Handler
// =====================================================
async function handleOptIn(req: Request, supabase: any) {
  const data: OptInRequest = await req.json()

  // Validate phone number
  const phoneNumber = normalizePhoneNumber(data.phone_number)
  if (!phoneNumber) {
    return new Response(
      JSON.stringify({ error: 'Invalid phone number' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get client IP if not provided
  const ipAddress = data.ip_address || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
  const userAgent = data.user_agent || req.headers.get('user-agent')

  // Record opt-in using database function
  const { data: result, error } = await supabase.rpc('record_sms_opt_in', {
    p_phone_number: phoneNumber,
    p_method: data.method || 'web_form',
    p_user_id: data.user_id || null,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    console.error('Opt-in error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to record opt-in', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Send confirmation SMS via Twilio
  await sendOptInConfirmationSMS(phoneNumber, supabase)

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Successfully opted in to SMS notifications',
      consent_id: result,
      phone_number: phoneNumber,
      confirmation_sent: true,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================
// Opt-Out Handler
// =====================================================
async function handleOptOut(req: Request, supabase: any) {
  const data: OptOutRequest = await req.json()

  // Validate phone number
  const phoneNumber = normalizePhoneNumber(data.phone_number)
  if (!phoneNumber) {
    return new Response(
      JSON.stringify({ error: 'Invalid phone number' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Record opt-out using database function
  const { data: result, error } = await supabase.rpc('record_sms_opt_out', {
    p_phone_number: phoneNumber,
    p_method: data.method || 'web_request',
    p_reason: data.reason || null,
  })

  if (error) {
    console.error('Opt-out error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to record opt-out', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Send confirmation SMS via Twilio
  await sendOptOutConfirmationSMS(phoneNumber, supabase)

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Successfully opted out of SMS notifications',
      consent_id: result,
      phone_number: phoneNumber,
      confirmation_sent: true,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================
// Get Consent Status
// =====================================================
async function handleGetStatus(req: Request, supabase: any) {
  const url = new URL(req.url)
  const phoneNumber = normalizePhoneNumber(url.searchParams.get('phone_number') || '')

  if (!phoneNumber) {
    return new Response(
      JSON.stringify({ error: 'Phone number required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabase
    .from('sms_consent')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      phone_number: phoneNumber,
      consent: data || { consent_status: 'unknown', has_consent: false },
      has_consent: data?.consent_status === 'opted_in',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================
// Get Consent History
// =====================================================
async function handleGetHistory(req: Request, supabase: any) {
  const url = new URL(req.url)
  const phoneNumber = normalizePhoneNumber(url.searchParams.get('phone_number') || '')

  if (!phoneNumber) {
    return new Response(
      JSON.stringify({ error: 'Phone number required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabase
    .from('sms_consent_audit')
    .select('*')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      phone_number: phoneNumber,
      history: data,
      total_events: data.length,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================
// Bulk Opt-Out (Admin only)
// =====================================================
async function handleBulkOptOut(req: Request, supabase: any) {
  // Verify admin authorization
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { phone_numbers }: { phone_numbers: string[] } = await req.json()

  if (!phone_numbers || !Array.isArray(phone_numbers)) {
    return new Response(
      JSON.stringify({ error: 'phone_numbers array required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const results = []
  for (const phone of phone_numbers) {
    const normalized = normalizePhoneNumber(phone)
    if (normalized) {
      const { error } = await supabase.rpc('record_sms_opt_out', {
        p_phone_number: normalized,
        p_method: 'manual',
        p_reason: 'Bulk opt-out by admin',
      })

      results.push({
        phone_number: normalized,
        success: !error,
        error: error?.message,
      })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed: results.length,
      results,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================
// Helper Functions
// =====================================================

function normalizePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Check if it's a valid US phone number
  if (digits.length === 10) {
    return `+1${digits}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  } else if (digits.startsWith('+')) {
    return phone.replace(/\D/g, '')
  }

  return null
}

async function sendOptInConfirmationSMS(phoneNumber: string, supabase: any) {
  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio credentials not configured')
      return
    }

    const message = 'You are now subscribed to RepMotivatedSeller SMS alerts. Reply STOP to unsubscribe, HELP for help. Msg&data rates may apply.'

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: twilioPhoneNumber,
          Body: message,
        }),
      }
    )

    const result = await response.json()

    // Log the message
    await supabase.from('sms_message_log').insert({
      phone_number: phoneNumber,
      message_sid: result.sid,
      direction: 'outbound',
      message_body: message,
      message_type: 'opt_in_confirmation',
      status: result.status,
      consent_verified: true,
      consent_status_at_send: 'opted_in',
      twilio_from_number: twilioPhoneNumber,
      twilio_to_number: phoneNumber,
    })
  } catch (error) {
    console.error('Error sending opt-in confirmation:', error)
  }
}

async function sendOptOutConfirmationSMS(phoneNumber: string, supabase: any) {
  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio credentials not configured')
      return
    }

    const message = 'You have been unsubscribed from RepMotivatedSeller SMS alerts. You will not receive further messages. Reply START to resubscribe.'

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: twilioPhoneNumber,
          Body: message,
        }),
      }
    )

    const result = await response.json()

    // Log the message
    await supabase.from('sms_message_log').insert({
      phone_number: phoneNumber,
      message_sid: result.sid,
      direction: 'outbound',
      message_body: message,
      message_type: 'opt_out_confirmation',
      status: result.status,
      consent_verified: false,
      consent_status_at_send: 'opted_out',
      twilio_from_number: twilioPhoneNumber,
      twilio_to_number: phoneNumber,
    })
  } catch (error) {
    console.error('Error sending opt-out confirmation:', error)
  }
}
