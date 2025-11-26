// Twilio Error Logger
// Receives and logs Twilio debugger events (errors/warnings)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  try {
    // Parse Twilio debugger event
    const formData = await req.formData()

    const eventData = {
      account_sid: formData.get('AccountSid')?.toString(),
      sid: formData.get('Sid')?.toString(),
      parent_account_sid: formData.get('ParentAccountSid')?.toString(),
      timestamp: formData.get('Timestamp')?.toString(),
      level: formData.get('Level')?.toString(),
      error_code: formData.get('ErrorCode')?.toString(),
      error_message: formData.get('ErrorMessage')?.toString(),
      resource_sid: formData.get('ResourceSid')?.toString(),
      url: formData.get('Url')?.toString(),
    }

    console.log('[TWILIO ERROR]', eventData)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log to database (optional - only if you want to store errors)
    // You'd need to create a twilio_error_log table first
    /*
    await supabase.from('twilio_error_log').insert({
      account_sid: eventData.account_sid,
      event_sid: eventData.sid,
      error_code: eventData.error_code,
      error_message: eventData.error_message,
      resource_sid: eventData.resource_sid,
      level: eventData.level,
      url: eventData.url,
      timestamp: eventData.timestamp,
      created_at: new Date().toISOString(),
    })
    */

    // Return 200 OK to acknowledge receipt
    return new Response(JSON.stringify({ status: 'logged' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error logging Twilio event:', error)

    return new Response(JSON.stringify({ error: 'Failed to log event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
