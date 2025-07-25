import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const from = formData.get('From')?.toString() || ''
    const body = formData.get('Body')?.toString() || ''
    const to = formData.get('To')?.toString() || ''

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log SMS interaction
    await supabaseClient.from('sms_interactions').insert({
      from_number: from,
      to_number: to,
      message_body: body,
      created_at: new Date().toISOString()
    })

    // Generate response based on message content
    let responseMessage = ''
    const lowerBody = body.toLowerCase()

    if (lowerBody.includes('foreclosure') || lowerBody.includes('help')) {
      responseMessage = `Hi! We're here to help with your foreclosure situation. Visit https://repmotivatedseller.shoprealestatespace.org to fill out our assistance form, or call us for immediate help. Reply STOP to opt out.`
    } else if (lowerBody.includes('stop')) {
      responseMessage = `You've been unsubscribed from RepMotivatedSeller SMS updates. Thank you.`
    } else {
      responseMessage = `Thank you for contacting RepMotivatedSeller. For foreclosure assistance, visit our website or call us. Reply HELP for more info, STOP to opt out.`
    }

    // Create TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${responseMessage}</Message>
</Response>`

    return new Response(twimlResponse, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      }
    })

  } catch (error) {
    console.error('SMS Handler Error:', error)
    
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>We're experiencing technical difficulties. Please visit our website or call us directly for assistance.</Message>
</Response>`

    return new Response(errorResponse, {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      }
    })
  }
})