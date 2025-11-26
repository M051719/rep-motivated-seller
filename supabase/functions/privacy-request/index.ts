import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

console.log("🔐 Privacy request function started")

interface PrivacyRequest {
  type: 'access' | 'deletion' | 'portability' | 'correction' | 'opt_out'
  email: string
  full_name?: string
  phone?: string
  request_details: string
  verification_method?: 'email' | 'phone' | 'address'
  regulation: 'GLBA' | 'GDPR' | 'CCPA' | 'PIPEDA'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Handle new privacy request
      return await handlePrivacyRequest(req, supabaseClient)
    } else if (req.method === 'GET') {
      // Handle privacy request status check
      return await checkRequestStatus(req, supabaseClient)
    }

    throw new Error('Method not allowed')

  } catch (error) {
    console.error('❌ Privacy request error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

async function handlePrivacyRequest(req: Request, supabase: any) {
  const privacyRequest: PrivacyRequest = await req.json()

  console.log(`📋 Processing ${privacyRequest.type} request for ${privacyRequest.email}`)

  // Validate required fields
  if (!privacyRequest.type || !privacyRequest.email || !privacyRequest.regulation) {
    throw new Error('Missing required fields: type, email, regulation')
  }

  // Create privacy request record
  const { data: requestRecord, error: requestError } = await supabase
    .from('privacy_requests')
    .insert([{
      request_type: privacyRequest.type,
      email: privacyRequest.email,
      full_name: privacyRequest.full_name,
      phone: privacyRequest.phone,
      request_details: privacyRequest.request_details,
      verification_method: privacyRequest.verification_method || 'email',
      regulation: privacyRequest.regulation,
      status: 'pending_verification',
      created_at: new Date().toISOString(),
      due_date: getDueDate(privacyRequest.regulation)
    }])
    .select()
    .single()

  if (requestError) {
    console.error('❌ Error creating privacy request:', requestError)
    throw requestError
  }

  console.log(`✅ Privacy request created: ${requestRecord.id}`)

  // Send verification email
  await sendVerificationEmail(privacyRequest.email, requestRecord.id, privacyRequest.type)

  // Log compliance event
  await logComplianceEvent({
    event_type: 'privacy_request',
    resource_type: 'user_data',
    action: `${privacyRequest.type}_request_submitted`,
    metadata: {
      request_id: requestRecord.id,
      regulation: privacyRequest.regulation
    },
    glba_relevant: privacyRequest.regulation === 'GLBA',
    pci_dss_relevant: false
  })

  return new Response(
    JSON.stringify({
      success: true,
      request_id: requestRecord.id,
      status: 'pending_verification',
      due_date: requestRecord.due_date,
      message: `Privacy request received. Check your email for verification instructions.`,
      regulation_info: getRegulationInfo(privacyRequest.regulation)
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
}

async function checkRequestStatus(req: Request, supabase: any) {
  const url = new URL(req.url)
  const requestId = url.searchParams.get('request_id')
  const email = url.searchParams.get('email')

  if (!requestId || !email) {
    throw new Error('Missing required parameters: request_id and email')
  }

  const { data: request, error } = await supabase
    .from('privacy_requests')
    .select('*')
    .eq('id', requestId)
    .eq('email', email)
    .single()

  if (error) {
    throw new Error('Request not found or access denied')
  }

  return new Response(
    JSON.stringify({
      success: true,
      request: {
        id: request.id,
        type: request.request_type,
        status: request.status,
        created_at: request.created_at,
        due_date: request.due_date,
        completed_at: request.completed_at,
        regulation: request.regulation
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
}

function getDueDate(regulation: string): string {
  const now = new Date()
  let daysToAdd = 30 // Default

  switch (regulation) {
    case 'GLBA':
      daysToAdd = 30 // GLBA doesn't specify, using 30 days
      break
    case 'GDPR':
      daysToAdd = 30 // GDPR: 1 month
      break
    case 'CCPA':
      daysToAdd = 45 // CCPA: 45 days
      break
    case 'PIPEDA':
      daysToAdd = 30 // PIPEDA: 30 days
      break
  }

  now.setDate(now.getDate() + daysToAdd)
  return now.toISOString()
}

function getRegulationInfo(regulation: string): any {
  const info = {
    GLBA: {
      name: 'Gramm-Leach-Bliley Act',
      scope: 'Financial institutions and their customers',
      rights: ['Access to privacy notices', 'Opt-out of information sharing']
    },
    GDPR: {
      name: 'General Data Protection Regulation',
      scope: 'EU residents and their personal data',
      rights: ['Access', 'Rectification', 'Erasure', 'Portability', 'Restriction']
    },
    CCPA: {
      name: 'California Consumer Privacy Act',
      scope: 'California residents and their personal information',
      rights: ['Know', 'Delete', 'Opt-out of sale', 'Non-discrimination']
    },
    PIPEDA: {
      name: 'Personal Information Protection and Electronic Documents Act',
      scope: 'Canadian residents and their personal information',
      rights: ['Access', 'Correction', 'Complaint filing']
    }
  }

  return info[regulation as keyof typeof info] || {}
}

async function sendVerificationEmail(email: string, requestId: string, requestType: string) {
  try {
    console.log(`📧 Sending verification email for privacy request: ${requestId}`)
    
    const emailFunctionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/email-sender`
    
    const verificationUrl = `${Deno.env.get('SITE_URL') || 'https://repmotivatedseller.org'}/privacy/verify?request_id=${requestId}&email=${encodeURIComponent(email)}`
    
    const response = await fetch(emailFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        subject: `Verify Your Privacy Rights Request - ${requestType.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🔐 Privacy Rights Request Verification</h2>
            <p>We received a request to ${requestType} your personal information.</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <p><strong>To proceed with your request, please verify your identity by clicking the link below:</strong></p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Request
                </a>
              </div>
              <p style="font-size: 12px; color: #666;">
                This link will expire in 24 hours. If you did not make this request, please ignore this email.
              </p>
            </div>
            <p>For questions, contact: privacy@repmotivatedseller.org</p>
          </div>
        `
      })
    })

    if (response.ok) {
      console.log('✅ Verification email sent successfully')
    } else {
      console.error('❌ Failed to send verification email')
    }
  } catch (error) {
    console.error('❌ Email sending error:', error)
  }
}

async function logComplianceEvent(eventData: any) {
  try {
    const loggerUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/compliance-logger`
    
    await fetch(loggerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })
  } catch (error) {
    console.error('❌ Failed to log compliance event:', error)
  }
}

console.log("🎯 Privacy request function ready")