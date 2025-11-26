// AI Voice Handler with OpenAI Integration
// Handles incoming voice calls with real AI conversations

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { getAIResponse, shouldHandoffToHuman, hasExceededMaxTurns } from './openai-helper.ts'
import { checkBusinessHours, getAfterHoursGreeting } from './business-hours.ts'

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
    const url = new URL(req.url)
    const path = url.pathname

    console.log(`[AI VOICE] Request to: ${path}`)

    // Route requests
    if (path.endsWith('/menu')) {
      return handleMenuSelection(req)
    } else if (path.endsWith('/ai-conversation')) {
      return handleAIConversation(req)
    } else if (path.endsWith('/continue')) {
      return handleAIConversation(req) // Same as ai-conversation
    } else {
      return handleInitialCall(req)
    }
  } catch (error) {
    console.error('[AI VOICE ERROR]:', error)
    return errorResponse()
  }
})

/**
 * Handle initial call - present menu with AI option
 */
async function handleInitialCall(req: Request): Promise<Response> {
  const formData = await req.formData()
  const from = formData.get('From')?.toString() || ''
  const to = formData.get('To')?.toString() || ''
  const callSid = formData.get('CallSid')?.toString() || ''

  console.log(`[INITIAL CALL] From: ${from}, CallSid: ${callSid}`)

  // Log call to database
  await logCall(callSid, from, to, 'ringing')

  // Check business hours
  const businessHours = checkBusinessHours()
  console.log(`[BUSINESS HOURS] Open: ${businessHours.isOpen}, ${businessHours.dayOfWeek} at ${businessHours.currentTime.toLocaleTimeString()}`)

  let twiml = ''

  if (businessHours.isOpen) {
    // During business hours - full menu with live transfer option
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Thank you for calling RepMotivatedSeller, your foreclosure assistance partner.
        We are currently open and ready to help you.
    </Say>

    <Gather numDigits="1" action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/menu" method="POST" timeout="10">
        <Say voice="alice">
            Press 1 for foreclosure assistance information.
            Press 2 to schedule a consultation.
            Press 3 for general information.
            Press 4 to speak with our A I assistant.
            Press 5 to leave a voicemail.
            Or press 0 to speak with a live representative now.
        </Say>
    </Gather>

    <Say voice="alice">
        We didn't receive your selection. Transferring you to a representative.
    </Say>
    ${generateTransferTwiML()}
</Response>`
  } else {
    // After hours - limited menu, encourage voicemail or AI
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        ${getAfterHoursGreeting()}
    </Say>

    <Gather numDigits="1" action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/menu" method="POST" timeout="10">
        <Say voice="alice">
            Press 1 for foreclosure assistance information.
            Press 2 for our business hours and location.
            Press 3 for general information.
            Press 4 to speak with our A I assistant for immediate help.
            Press 5 to leave a detailed voicemail, and we will call you back when we open.
            Or press 9 for emergency foreclosure assistance.
        </Say>
    </Gather>

    <Say voice="alice">
        We didn't receive your selection. Redirecting you to voicemail.
    </Say>
    <Redirect method="POST">https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/voicemail-handler</Redirect>
</Response>`
  }

  return new Response(twiml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}

/**
 * Handle menu selection
 */
async function handleMenuSelection(req: Request): Promise<Response> {
  const formData = await req.formData()
  const digits = formData.get('Digits')?.toString() || ''
  const from = formData.get('From')?.toString() || ''
  const callSid = formData.get('CallSid')?.toString() || ''

  console.log(`[MENU] Selection: ${digits} from ${from}`)

  // Log menu selection
  if (callSid) {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      await supabase
        .from('call_log')
        .update({ menu_selection: digits })
        .eq('call_sid', callSid)
    } catch (error) {
      console.error('[MENU LOG ERROR]', error)
    }
  }

  let twiml = ''

  switch (digits) {
    case '0':
      // Transfer to human
      twiml = generateTransferTwiML()
      break

    case '1':
      // Foreclosure assistance
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        For foreclosure assistance, please visit repmotivatedseller dot com
        and fill out our assistance form. Our team will contact you within 24 hours.
        You can also email us at support at repmotivatedseller dot com.
    </Say>
    <Say voice="alice">Thank you for calling. Goodbye.</Say>
    <Hangup/>
</Response>`
      break

    case '2':
      // Schedule consultation (or business hours if after hours)
      const hours = checkBusinessHours()
      if (hours.isOpen) {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        To schedule a free consultation, visit repmotivatedseller dot com slash consultation.
        Or call us during business hours, Monday through Friday, 9 AM to 5 PM Pacific Time.
    </Say>
    <Say voice="alice">Thank you for calling. Goodbye.</Say>
    <Hangup/>
</Response>`
      } else {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Our business hours are Monday through Friday, 9 AM to 5 PM Pacific Time.
        We are located online at repmotivatedseller dot com.
        ${hours.message}
        To leave a voicemail, press 5 now, or simply hang up and we will see your missed call.
    </Say>
    <Gather numDigits="1" action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/menu" method="POST" timeout="5">
        <Say voice="alice">Press 5 for voicemail, or any other key to hear this message again.</Say>
    </Gather>
    <Say voice="alice">Thank you for calling. Goodbye.</Say>
    <Hangup/>
</Response>`
      }
      break

    case '3':
      // General information
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        RepMotivatedSeller specializes in helping homeowners facing foreclosure.
        We provide free consultations and guide you through all available options.
        Visit repmotivatedseller dot com for more information.
    </Say>
    <Say voice="alice">Thank you for calling. Goodbye.</Say>
    <Hangup/>
</Response>`
      break

    case '4':
      // AI conversation
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Great! I'm here to help. Please tell me about your situation, and I'll do my best to assist you.
    </Say>
    <Gather
        input="speech"
        action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/ai-conversation"
        method="POST"
        timeout="5"
        speechTimeout="auto"
        speechModel="phone_call"
        language="en-US"
    >
        <Say voice="alice">You can start speaking now.</Say>
    </Gather>
    <Say voice="alice">I didn't hear anything. Please call back if you need assistance.</Say>
    <Hangup/>
</Response>`
      break

    case '5':
      // Voicemail
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Redirect method="POST">https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/voicemail-handler</Redirect>
</Response>`
      break

    case '9':
      // Emergency assistance (after hours option)
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        For immediate emergency foreclosure assistance, please visit repmotivatedseller dot com slash emergency.
        You can also text the word URGENT to 1-877-806-4677 for priority callback.
        If your foreclosure sale is scheduled within 24 hours, press 5 to leave an urgent voicemail now,
        or visit our website for emergency contact information.
    </Say>
    <Gather numDigits="1" action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/menu" method="POST" timeout="5">
        <Say voice="alice">Press 5 to leave an urgent voicemail now.</Say>
    </Gather>
    <Say voice="alice">
        Please visit repmotivatedseller dot com for emergency assistance.
        Thank you for calling. Goodbye.
    </Say>
    <Hangup/>
</Response>`
      break

    default:
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Invalid selection. Please visit repmotivatedseller dot com or call back.
    </Say>
    <Hangup/>
</Response>`
  }

  return new Response(twiml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}

/**
 * Handle AI-powered conversation
 */
async function handleAIConversation(req: Request): Promise<Response> {
  const formData = await req.formData()
  const from = formData.get('From')?.toString() || ''
  const speechResult = formData.get('SpeechResult')?.toString() || ''
  const callSid = formData.get('CallSid')?.toString() || ''

  console.log(`[AI CONVERSATION] From: ${from}, Speech: "${speechResult}"`)

  if (!speechResult) {
    return noSpeechResponse()
  }

  // Check if they want to be transferred
  if (shouldHandoffToHuman(speechResult)) {
    console.log('[HANDOFF] Transferring to human')
    const history = await getConversationHistory(callSid, from)
    const turnNumber = Math.floor(history.length / 2) + 1
    await logConversation(callSid, from, speechResult, 'Transferring to human agent', true, turnNumber)
    return new Response(generateTransferTwiML(), {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
    })
  }

  // Get conversation history
  const history = await getConversationHistory(callSid, from)

  // Check if exceeded max turns
  const currentTurn = Math.floor(history.length / 2) + 1
  if (hasExceededMaxTurns(currentTurn)) {
    console.log('[MAX TURNS] Offering transfer')
    return maxTurnsResponse()
  }

  // Add user message to history
  history.push({
    role: 'user',
    content: speechResult
  })

  try {
    // Get AI response
    const aiResponse = await getAIResponse({
      phoneNumber: from,
      conversationHistory: history
    })

    // Log conversation with turn number
    await logConversation(callSid, from, speechResult, aiResponse, false, currentTurn)

    // Generate TwiML with AI response and continue gathering
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${escapeXml(aiResponse)}</Say>
    <Gather
        input="speech"
        action="https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler/continue"
        method="POST"
        timeout="5"
        speechTimeout="auto"
        speechModel="phone_call"
        language="en-US"
    >
        <Say voice="alice">Is there anything else I can help you with?</Say>
    </Gather>
    <Say voice="alice">
        Thank you for calling RepMotivatedSeller.
        Visit repmotivatedseller dot com for more information.
        Goodbye.
    </Say>
    <Hangup/>
</Response>`

    return new Response(twiml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
    })

  } catch (error) {
    console.error('[AI ERROR]', error)
    return aiErrorResponse()
  }
}

/**
 * Generate transfer to human TwiML
 */
function generateTransferTwiML(): string {
  const agentNumber = Deno.env.get('AGENT_PHONE_NUMBER') || '+18778064677'

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Let me transfer you to one of our foreclosure specialists. Please hold.
    </Say>
    <Dial timeout="30" callerId="${Deno.env.get('TWILIO_PHONE_NUMBER')}">
        <Number>${agentNumber}</Number>
    </Dial>
    <Say voice="alice">
        I'm sorry, all our specialists are currently busy.
        Please visit repmotivatedseller dot com or call back during business hours.
    </Say>
    <Hangup/>
</Response>`
}

/**
 * Helper: Log call to database
 */
async function logCall(callSid: string, from: string, to: string, status: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase.from('call_log').insert({
      call_sid: callSid,
      from_number: from,
      to_number: to,
      call_status: status,
      direction: 'inbound',
      ai_conversation: false,
      conversation_turns: 0,
      answered_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[LOG CALL ERROR]', error)
    } else {
      console.log(`[CALL LOGGED] ${callSid} from ${from}`)
    }
  } catch (error) {
    console.error('[LOG CALL EXCEPTION]', error)
  }
}

/**
 * Helper: Log AI conversation turn
 */
async function logConversation(
  callSid: string,
  from: string,
  userMessage: string,
  aiResponse: string,
  transferredToHuman: boolean,
  turnNumber: number,
  speechConfidence?: number
) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update call log
    const { error: updateError } = await supabase
      .from('call_log')
      .update({
        ai_conversation: true,
        transferred_to_human: transferredToHuman,
        transfer_reason: transferredToHuman ? 'User requested human agent' : null,
      })
      .eq('call_sid', callSid)

    if (updateError) {
      console.error('[UPDATE CALL LOG ERROR]', updateError)
    }

    // Store user message
    const { error: userError } = await supabase
      .from('conversation_history')
      .insert({
        call_sid: callSid,
        turn_number: turnNumber,
        role: 'user',
        content: userMessage,
        speech_confidence: speechConfidence || null,
        handoff_triggered: transferredToHuman,
        handoff_reason: transferredToHuman ? 'User requested transfer' : null,
      })

    if (userError) {
      console.error('[LOG USER MESSAGE ERROR]', userError)
    }

    // Store AI response
    const { error: aiError } = await supabase
      .from('conversation_history')
      .insert({
        call_sid: callSid,
        turn_number: turnNumber,
        role: 'assistant',
        content: aiResponse,
        ai_model: Deno.env.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      })

    if (aiError) {
      console.error('[LOG AI MESSAGE ERROR]', aiError)
    } else {
      console.log(`[CONVERSATION LOGGED] Turn ${turnNumber}: User: "${userMessage.substring(0, 50)}..." -> AI: "${aiResponse.substring(0, 50)}..."`)
    }

  } catch (error) {
    console.error('[LOG CONVERSATION EXCEPTION]', error)
  }
}

/**
 * Helper: Get conversation history
 */
async function getConversationHistory(callSid: string, phoneNumber: string): Promise<any[]> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('conversation_history')
      .select('role, content, turn_number')
      .eq('call_sid', callSid)
      .order('turn_number', { ascending: true })

    if (error) {
      console.error('[GET HISTORY ERROR]', error)
      return []
    }

    if (!data || data.length === 0) {
      console.log(`[HISTORY] No existing conversation for ${callSid}`)
      return []
    }

    console.log(`[HISTORY] Retrieved ${data.length} messages for ${callSid}`)

    // Convert to OpenAI format
    return data.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

  } catch (error) {
    console.error('[GET HISTORY EXCEPTION]', error)
    return []
  }
}

/**
 * Helper: Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Response helpers
 */
function noSpeechResponse(): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        I didn't hear anything. Please call back if you need assistance.
    </Say>
    <Hangup/>
</Response>`

  return new Response(twiml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}

function maxTurnsResponse(): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        I want to make sure you get the best help possible.
        Let me transfer you to one of our specialists who can assist you further.
    </Say>
    ${generateTransferTwiML()}
</Response>`

  return new Response(twiml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}

function aiErrorResponse(): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        I'm having trouble processing your request.
        Let me transfer you to a specialist who can help you.
    </Say>
    ${generateTransferTwiML()}
</Response>`

  return new Response(twiml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}

function errorResponse(): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        We're experiencing technical difficulties.
        Please visit repmotivatedseller dot com or call back later.
    </Say>
    <Hangup/>
</Response>`

  return new Response(twiml, {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}
