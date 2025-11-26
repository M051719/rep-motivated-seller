// Voice Fallback Handler
// Simple TwiML response for voice calls when primary handler fails

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  console.log('[VOICE FALLBACK] Call received')

  // Simple TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Thank you for calling RepMotivatedSeller.
        We are currently experiencing technical difficulties with our automated system.
        Please visit our website at repmotivatedseller dot com,
        or call us back in a few minutes.
        Thank you for your patience.
    </Say>
    <Hangup/>
</Response>`

  return new Response(twiml, {
    headers: {
      'Content-Type': 'text/xml',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
