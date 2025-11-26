// Voicemail Handler
// Enhancement #3: Voicemail Recording and Transcription
// Handles voicemail recording, transcription, and notifications

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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

    console.log(`[VOICEMAIL] Request to: ${path}`)

    // Route requests
    if (path.endsWith('/record')) {
      return handleVoicemailPrompt(req)
    } else if (path.endsWith('/recording-status')) {
      return handleRecordingStatus(req)
    } else if (path.endsWith('/transcription')) {
      return handleTranscription(req)
    } else {
      return handleVoicemailPrompt(req)
    }
  } catch (error) {
    console.error('[VOICEMAIL ERROR]:', error)
    return errorResponse()
  }
})

/**
 * Handle voicemail prompt and start recording
 */
async function handleVoicemailPrompt(req: Request): Promise<Response> {
  const formData = await req.formData()
  const from = formData.get('From')?.toString() || ''
  const to = formData.get('To')?.toString() || ''
  const callSid = formData.get('CallSid')?.toString() || ''

  console.log(`[VOICEMAIL PROMPT] From: ${from}, CallSid: ${callSid}`)

  // Create voicemail record
  await createVoicemailRecord(callSid, from, to)

  const callbackUrl = `https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/voicemail-handler/recording-status`

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        You have reached the voicemail for RepMotivatedSeller.
        Please leave a detailed message after the beep, and we'll get back to you as soon as possible.
        Press the pound key when you're finished.
    </Say>
    <Record
        action="${callbackUrl}"
        method="POST"
        maxLength="180"
        timeout="5"
        finishOnKey="#"
        transcribe="true"
        transcribeCallback="${callbackUrl.replace('/recording-status', '/transcription')}"
        playBeep="true"
    />
    <Say voice="alice">
        We did not receive your message. Please call back if you need assistance.
    </Say>
    <Hangup/>
</Response>`

  return new Response(twiml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}

/**
 * Handle recording status callback
 */
async function handleRecordingStatus(req: Request): Promise<Response> {
  const formData = await req.formData()
  const callSid = formData.get('CallSid')?.toString() || ''
  const recordingSid = formData.get('RecordingSid')?.toString() || ''
  const recordingUrl = formData.get('RecordingUrl')?.toString() || ''
  const recordingDuration = parseInt(formData.get('RecordingDuration')?.toString() || '0')
  const recordingStatus = formData.get('RecordingStatus')?.toString() || 'completed'

  console.log(`[RECORDING STATUS] CallSid: ${callSid}, RecordingSid: ${recordingSid}, Duration: ${recordingDuration}s`)

  // Update voicemail with recording details
  await updateVoicemailRecording(callSid, recordingSid, recordingUrl, recordingDuration, recordingStatus)

  // Send notification about new voicemail
  await sendVoicemailNotification(callSid, recordingUrl, recordingDuration)

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Thank you for your message. We will review it and get back to you soon.
        Visit repmotivatedseller dot com for immediate assistance.
        Goodbye.
    </Say>
    <Hangup/>
</Response>`

  return new Response(twiml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}

/**
 * Handle transcription callback
 */
async function handleTranscription(req: Request): Promise<Response> {
  const formData = await req.formData()
  const callSid = formData.get('CallSid')?.toString() || ''
  const transcriptionSid = formData.get('TranscriptionSid')?.toString() || ''
  const transcriptionText = formData.get('TranscriptionText')?.toString() || ''
  const transcriptionStatus = formData.get('TranscriptionStatus')?.toString() || 'completed'

  console.log(`[TRANSCRIPTION] CallSid: ${callSid}, Status: ${transcriptionStatus}`)
  console.log(`[TRANSCRIPTION TEXT] "${transcriptionText.substring(0, 100)}..."`)

  // Update voicemail with transcription
  await updateVoicemailTranscription(callSid, transcriptionSid, transcriptionText, transcriptionStatus)

  // Send urgent notification if needed
  if (transcriptionText.toLowerCase().includes('urgent') || transcriptionText.toLowerCase().includes('emergency')) {
    console.log('[URGENT VOICEMAIL] Sending priority notification')
    await sendUrgentVoicemailNotification(callSid, transcriptionText)
  }

  return new Response('OK', {
    headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
  })
}

/**
 * Create initial voicemail record
 */
async function createVoicemailRecord(callSid: string, from: string, to: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase.from('voicemails').insert({
      call_sid: callSid,
      from_number: from,
      to_number: to,
      recording_status: 'pending',
      transcription_status: 'pending',
    })

    if (error) {
      console.error('[CREATE VOICEMAIL ERROR]', error)
    } else {
      console.log(`[VOICEMAIL CREATED] ${callSid}`)
    }
  } catch (error) {
    console.error('[CREATE VOICEMAIL EXCEPTION]', error)
  }
}

/**
 * Update voicemail with recording details
 */
async function updateVoicemailRecording(
  callSid: string,
  recordingSid: string,
  recordingUrl: string,
  duration: number,
  status: string
) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase
      .from('voicemails')
      .update({
        recording_sid: recordingSid,
        recording_url: recordingUrl,
        recording_duration: duration,
        recording_status: status,
      })
      .eq('call_sid', callSid)

    if (error) {
      console.error('[UPDATE RECORDING ERROR]', error)
    } else {
      console.log(`[RECORDING UPDATED] ${callSid}`)
    }
  } catch (error) {
    console.error('[UPDATE RECORDING EXCEPTION]', error)
  }
}

/**
 * Update voicemail with transcription
 */
async function updateVoicemailTranscription(
  callSid: string,
  transcriptionSid: string,
  transcriptionText: string,
  status: string
) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase
      .from('voicemails')
      .update({
        transcription_sid: transcriptionSid,
        transcription_text: transcriptionText,
        transcription_status: status,
      })
      .eq('call_sid', callSid)

    if (error) {
      console.error('[UPDATE TRANSCRIPTION ERROR]', error)
    } else {
      console.log(`[TRANSCRIPTION UPDATED] ${callSid}`)
    }
  } catch (error) {
    console.error('[UPDATE TRANSCRIPTION EXCEPTION]', error)
  }
}

/**
 * Send notification about new voicemail
 */
async function sendVoicemailNotification(callSid: string, recordingUrl: string, duration: number) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get voicemail details
    const { data: voicemail } = await supabase
      .from('voicemails')
      .select('*')
      .eq('call_sid', callSid)
      .single()

    if (!voicemail) return

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || ''
    const managerEmail = Deno.env.get('MANAGER_EMAIL') || ''

    // Create notification record
    const { error } = await supabase.from('voicemail_notifications').insert([
      {
        voicemail_id: voicemail.id,
        notification_type: 'email',
        recipient: adminEmail,
        subject: `New Voicemail from ${voicemail.from_number}`,
        message: `New voicemail received (${duration}s). Listen at: ${recordingUrl}`,
        status: 'pending',
      },
      {
        voicemail_id: voicemail.id,
        notification_type: 'email',
        recipient: managerEmail,
        subject: `New Voicemail from ${voicemail.from_number}`,
        message: `New voicemail received (${duration}s). Listen at: ${recordingUrl}`,
        status: 'pending',
      },
    ])

    if (error) {
      console.error('[NOTIFICATION ERROR]', error)
    } else {
      console.log(`[NOTIFICATIONS CREATED] ${callSid}`)

      // Mark voicemail as notification sent
      await supabase
        .from('voicemails')
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq('call_sid', callSid)
    }
  } catch (error) {
    console.error('[NOTIFICATION EXCEPTION]', error)
  }
}

/**
 * Send urgent notification for high-priority voicemails
 */
async function sendUrgentVoicemailNotification(callSid: string, transcriptionText: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: voicemail } = await supabase
      .from('voicemails')
      .select('*')
      .eq('call_sid', callSid)
      .single()

    if (!voicemail) return

    const urgentEmail = Deno.env.get('URGENT_EMAIL') || Deno.env.get('ADMIN_EMAIL') || ''

    // Create urgent notification
    const { error } = await supabase.from('voicemail_notifications').insert({
      voicemail_id: voicemail.id,
      notification_type: 'email',
      recipient: urgentEmail,
      subject: `🚨 URGENT Voicemail from ${voicemail.from_number}`,
      message: `Urgent voicemail detected!\n\nFrom: ${voicemail.from_number}\nTranscription: ${transcriptionText.substring(0, 200)}...\n\nListen now: ${voicemail.recording_url}`,
      status: 'pending',
    })

    if (error) {
      console.error('[URGENT NOTIFICATION ERROR]', error)
    } else {
      console.log(`[URGENT NOTIFICATION CREATED] ${callSid}`)
    }
  } catch (error) {
    console.error('[URGENT NOTIFICATION EXCEPTION]', error)
  }
}

/**
 * Error response
 */
function errorResponse(): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        We're experiencing technical difficulties with our voicemail system.
        Please try calling back later or visit repmotivatedseller dot com.
    </Say>
    <Hangup/>
</Response>`

  return new Response(twiml, {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  })
}
