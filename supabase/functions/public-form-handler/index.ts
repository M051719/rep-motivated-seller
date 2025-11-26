// supabase/functions/public-form-handler/index.ts
// Public endpoint for foreclosure form submissions (no auth required)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Create Supabase client with service role for database writes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.json()
    console.log('Public form submission received:', formData)

    // Validate required fields
    const requiredFields = ['propertyAddress', 'fullName', 'phone', 'email']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing: missingFields 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate urgency level based on loan status
    let urgencyLevel = 'LOW'
    const loanStatus = formData.currentLoanStatus?.toLowerCase() || ''
    
    if (loanStatus.includes('foreclosure') || loanStatus.includes('default') || loanStatus.includes('behind')) {
      urgencyLevel = 'HIGH'
    } else if (loanStatus.includes('struggling') || loanStatus.includes('difficulty')) {
      urgencyLevel = 'MEDIUM'
    }

    // Prepare submission data
    const submissionData = {
      // Contact Information
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      
      // Property Information
      property_address: formData.propertyAddress,
      current_loan_status: formData.currentLoanStatus,
      
      // Metadata
      submission_date: new Date().toISOString(),
      status: 'new',
      urgency_level: urgencyLevel,
      source: 'website_form',
      
      // Additional fields if provided
      property_value: formData.propertyValue || null,
      mortgage_balance: formData.mortgageBalance || null,
      monthly_payment: formData.monthlyPayment || null,
      behind_payments: formData.behindPayments || null,
      
      // Form responses (JSON field)
      responses: {
        propertyAddress: formData.propertyAddress,
        currentLoanStatus: formData.currentLoanStatus,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        submissionTime: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from('foreclosure_responses')
      .insert([submissionData])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save submission', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Submission saved successfully:', data.id)

    // Trigger notification email (call another function)
    try {
      const emailResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'new_submission',
            submissionId: data.id,
            submissionData: data
          })
        }
      )
      
      if (emailResponse.ok) {
        console.log('Notification email triggered successfully')
      } else {
        console.log('Notification email failed, but submission saved')
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // Don't fail the whole request if email fails
    }

    // Trigger CRM integration (if configured)
    try {
      const crmResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/external-api-integration`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'new_lead',
            leadData: data
          })
        }
      )
      
      if (crmResponse.ok) {
        console.log('CRM integration triggered successfully')
      }
    } catch (crmError) {
      console.error('CRM integration error:', crmError)
      // Don't fail the whole request if CRM fails
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you! Your information has been submitted successfully. A specialist will contact you within 24 hours.',
        submissionId: data.id,
        urgencyLevel: urgencyLevel,
        nextSteps: urgencyLevel === 'HIGH' 
          ? 'Due to the urgency of your situation, expect a call within 2-4 hours.'
          : 'We will review your information and contact you within 24 hours with your options.'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Public form handler error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'Please try again later or call us directly.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})