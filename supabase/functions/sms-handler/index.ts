// Enhanced SMS Handler with TCPA Compliance
// Handles inbound SMS messages with opt-in/opt-out keyword processing
// Twilio Webhook Handler

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// TCPA-required opt-out keywords
const OPT_OUT_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']
const OPT_IN_KEYWORDS = ['START', 'YES', 'UNSTOP']
const HELP_KEYWORDS = ['HELP', 'INFO']

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse Twilio webhook data
    const formData = await req.formData()
    const from = formData.get('From')?.toString() || ''
    const body = formData.get('Body')?.toString().trim() || ''
    const to = formData.get('To')?.toString() || ''
    const messageSid = formData.get('MessageSid')?.toString() || ''
    const accountSid = formData.get('AccountSid')?.toString() || ''

    console.log(`[SMS RECEIVED] From: ${from}, Body: ${body}`)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Normalize phone number
    const phoneNumber = normalizePhoneNumber(from)

    // Log incoming message
    await logIncomingMessage(supabaseClient, {
      phone_number: phoneNumber,
      message_sid: messageSid,
      message_body: body,
      twilio_account_sid: accountSid,
      twilio_from_number: from,
      twilio_to_number: to,
    })

    // Check for keyword commands (case-insensitive)
    const upperBody = body.toUpperCase().trim()
    const keyword = await checkKeyword(supabaseClient, upperBody)

    let responseMessage = ''

    if (keyword) {
      // Handle keyword-based actions
      switch (keyword.action) {
        case 'opt_out':
          await handleOptOut(supabaseClient, phoneNumber, upperBody)
          responseMessage = keyword.response_message
          break

        case 'opt_in':
          await handleOptIn(supabaseClient, phoneNumber, upperBody)
          responseMessage = keyword.response_message
          break

        case 'help':
        case 'info':
          responseMessage = keyword.response_message
          break

        default:
          responseMessage = getDefaultResponse()
      }
    } else {
      // Check consent status for non-keyword messages
      const hasConsent = await checkConsent(supabaseClient, phoneNumber)

      if (!hasConsent) {
        // No consent - send opt-in prompt
        responseMessage = `Thank you for contacting RepMotivatedSeller. To receive updates, reply START. For help, reply HELP. Msg&data rates may apply.`
      } else {
        // Has consent - process message normally
        responseMessage = await processMessage(supabaseClient, phoneNumber, body)
      }
    }

    // Log outgoing response
    await logOutgoingMessage(supabaseClient, {
      phone_number: phoneNumber,
      message_body: responseMessage,
      twilio_from_number: to,
      twilio_to_number: from,
    })

    // Create TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${escapeXml(responseMessage)}</Message>
</Response>`

    return new Response(twimlResponse, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('SMS Handler Error:', error)

    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>We're experiencing technical difficulties. Please visit repmotivatedseller.com or call us directly for assistance.</Message>
</Response>`

    return new Response(errorResponse, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
    })
  }
})

// =====================================================
// Helper Functions
// =====================================================

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Ensure it starts with +1 for US numbers
  if (digits.length === 10) {
    return `+1${digits}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  return phone // Return original if can't normalize
}

async function checkKeyword(supabase: any, messageBody: string): Promise<any | null> {
  const upperBody = messageBody.toUpperCase().trim()

  // Check for exact keyword matches
  const { data, error } = await supabase
    .from('sms_keywords')
    .select('*')
    .eq('is_active', true)
    .eq('keyword', upperBody)
    .order('priority', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking keyword:', error)
    return null
  }

  return data
}

async function checkConsent(supabase: any, phoneNumber: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_sms_consent', {
    p_phone_number: phoneNumber,
  })

  if (error) {
    console.error('Error checking consent:', error)
    return false
  }

  return data === true
}

async function handleOptIn(supabase: any, phoneNumber: string, keyword: string) {
  console.log(`[OPT-IN] ${phoneNumber} via keyword: ${keyword}`)

  const { error } = await supabase.rpc('record_sms_opt_in', {
    p_phone_number: phoneNumber,
    p_method: 'sms_reply',
    p_user_id: null,
    p_ip_address: null,
    p_user_agent: `SMS Keyword: ${keyword}`,
  })

  if (error) {
    console.error('Error recording opt-in:', error)
  }
}

async function handleOptOut(supabase: any, phoneNumber: string, keyword: string) {
  console.log(`[OPT-OUT] ${phoneNumber} via keyword: ${keyword}`)

  const { error } = await supabase.rpc('record_sms_opt_out', {
    p_phone_number: phoneNumber,
    p_method: 'sms_reply',
    p_reason: `User sent keyword: ${keyword}`,
  })

  if (error) {
    console.error('Error recording opt-out:', error)
  }
}

async function processMessage(supabase: any, phoneNumber: string, messageBody: string): Promise<string> {
  const lowerBody = messageBody.toLowerCase()

  // Check for foreclosure-related keywords
  if (lowerBody.includes('foreclosure') || lowerBody.includes('help') || lowerBody.includes('assistance')) {
    return `Hi! We're here to help with your foreclosure situation. Visit https://repmotivatedseller.shoprealestatespace.org to fill out our assistance form, or call us at 1-800-XXX-XXXX for immediate help. Reply STOP to opt out.`
  }

  // Check for consultation request
  if (lowerBody.includes('consultation') || lowerBody.includes('appointment') || lowerBody.includes('meeting')) {
    return `To book a free consultation, visit https://repmotivatedseller.shoprealestatespace.org/consultation or call us at 1-800-XXX-XXXX. We're ready to help! Reply STOP to opt out.`
  }

  // Check for property-related queries
  if (lowerBody.includes('property') || lowerBody.includes('house') || lowerBody.includes('home')) {
    return `Thank you for reaching out about property assistance. Our team specializes in helping homeowners facing foreclosure. Visit our website at repmotivatedseller.com or call 1-800-XXX-XXXX. Reply STOP to opt out.`
  }

  // Default response
  return `Thank you for contacting RepMotivatedSeller. For foreclosure assistance, visit repmotivatedseller.com or call us at 1-800-XXX-XXXX. Reply HELP for more info, STOP to opt out. Msg&data rates may apply.`
}

function getDefaultResponse(): string {
  return `Thank you for contacting RepMotivatedSeller. For foreclosure assistance, visit our website or call us. Reply HELP for more info, STOP to opt out.`
}

async function logIncomingMessage(supabase: any, data: any) {
  try {
    await supabase.from('sms_message_log').insert({
      phone_number: data.phone_number,
      message_sid: data.message_sid,
      direction: 'inbound',
      message_body: data.message_body,
      status: 'received',
      twilio_account_sid: data.twilio_account_sid,
      twilio_from_number: data.twilio_from_number,
      twilio_to_number: data.twilio_to_number,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error logging incoming message:', error)
  }
}

async function logOutgoingMessage(supabase: any, data: any) {
  try {
    await supabase.from('sms_message_log').insert({
      phone_number: data.phone_number,
      direction: 'outbound',
      message_body: data.message_body,
      message_type: 'transactional',
      status: 'sent',
      consent_verified: true,
      twilio_from_number: data.twilio_from_number,
      twilio_to_number: data.twilio_to_number,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error logging outgoing message:', error)
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
