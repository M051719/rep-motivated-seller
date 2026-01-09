import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get notification settings for follow-up days
    const { data: settings } = await supabaseClient
      .from('notification_settings')
      .select('*')
      .limit(1)
      .single()

    const followUpDays = settings?.follow_up_days || [1, 3, 7, 14]
    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? ''
    const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@repmotivatedseller.org'
    
    // Get responses that need follow-up
    const now = new Date()
    const results = []

    for (const days of followUpDays) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() - days)
      
      // Format date for PostgreSQL
      const formattedDate = targetDate.toISOString().split('T')[0]
      
      const { data: responses, error } = await supabaseClient
        .from('foreclosure_responses')
        .select('*')
        .eq('status', 'new')
        .gte('created_at', `${formattedDate}T00:00:00`)
        .lt('created_at', `${formattedDate}T23:59:59`)
      
      if (error) throw error
      
      if (responses && responses.length > 0) {
        // Send follow-up emails for each response
        for (const response of responses) {
          // Send email via MailerLite API
          const mailerliteApiKey = Deno.env.get('MAILERLITE_API_KEY') ?? ''
          
          const emailPayload = {
            to: adminEmail,
            subject: `Follow-up Reminder: ${response.name}'s Foreclosure Request (${days} days)`,
            html: generateFollowUpTemplate({
              name: response.name,
              email: response.email,
              phone: response.phone,
              days: days,
              urgencyLevel: response.urgency_level,
              id: response.id,
            }),
            from: fromEmail,
          }
          
          const emailResponse = await fetch('https://api.mailerlite.com/api/v2/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-MailerLite-ApiKey': mailerliteApiKey,
            },
            body: JSON.stringify(emailPayload),
          })
          
          const result = await emailResponse.json()
          results.push({ id: response.id, days, result })
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

function generateFollowUpTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        .urgency-high { color: #dc3545; font-weight: bold; }
        .urgency-medium { color: #fd7e14; font-weight: bold; }
        .urgency-low { color: #28a745; font-weight: bold; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Follow-up Reminder: ${data.days} Days</h2>
        </div>
        <div class="content">
          <p>This is a reminder to follow up on a foreclosure assistance request that was submitted ${data.days} days ago:</p>
          
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          
          <h3>Request Details</h3>
          <p><strong>Urgency Level:</strong> <span class="urgency-${data.urgencyLevel}">${data.urgencyLevel.toUpperCase()}</span></p>
          <p><strong>Days Since Submission:</strong> ${data.days}</p>
          
          <p>This request has not been updated since it was submitted. Please take appropriate action.</p>
          
          <p>
            <a href="${Deno.env.get('SITE_URL')}/admin/dashboard/response/${data.id}" class="button">View Request Details</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from RepMotivatedSeller Foreclosure Assistance Platform.</p>
        </div>
      </div>
    </body>
    </html>
  `
}