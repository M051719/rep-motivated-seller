import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

console.log("🚀 Email sender function started")

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: '🎉 Welcome to RepMotivatedSeller!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏠 Welcome to RepMotivatedSeller!</h1>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333;">Hi {{name}},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for joining RepMotivatedSeller! We're here to help you navigate through any foreclosure challenges.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🎓 What's Next?</h3>
            <ul style="color: #555;">
              <li>Explore our educational resources</li>
              <li>Schedule a free consultation</li>
              <li>Join our supportive community</li>
              <li>Access foreclosure prevention tools</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🚀 Get Started
            </a>
          </div>
        </div>
      </div>
    `
  },
  
  payment_confirmation: {
    subject: '✅ Payment Confirmation - RepMotivatedSeller',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Confirmed!</h1>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333;">Payment Successful</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you! Your payment has been processed successfully.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">💰 Payment Details</h3>
            <p><strong>Amount:</strong> ${{amount}} {{currency}}</p>
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Transaction ID:</strong> {{transaction_id}}</p>
          </div>
        </div>
      </div>
    `
  },

  consultation_reminder: {
    subject: '⏰ Consultation Reminder - Tomorrow at {{time}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Consultation Reminder</h1>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333;">Hi {{name}},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            This is a friendly reminder about your upcoming consultation tomorrow.
          </p>
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fd7e14;">
            <h3 style="color: #333; margin-top: 0;">📅 Consultation Details</h3>
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Time:</strong> {{time}}</p>
            <p><strong>Duration:</strong> {{duration}}</p>
            <p><strong>Meeting Link:</strong> <a href="{{meeting_url}}">{{meeting_url}}</a></p>
          </div>
        </div>
      </div>
    `
  }
}

serve(async (req) => {
  console.log(`📥 Received ${req.method} request`)

  if (req.method === 'OPTIONS') {
    console.log("✅ Handling CORS preflight")
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log("❌ Method not allowed:", req.method)
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const requestData = await req.json()
    console.log("📄 Email request received:", {
      to: requestData.to,
      template: requestData.template,
      subject: requestData.subject
    })

    const { to, subject, template, data, html, text, from } = requestData

    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (!sendGridApiKey) {
      console.error("❌ SendGrid API key not configured")
      throw new Error('SendGrid API key not configured')
    }

    let emailHtml = html
    let emailSubject = subject
    let emailText = text

    // Use template if specified
    if (template && EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES]) {
      const templateData = EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES]
      emailHtml = templateData.html
      emailSubject = templateData.subject
      console.log(`📧 Using template: ${template}`)
      
      // Replace template variables
      if (data) {
        console.log("🔄 Replacing template variables")
        Object.keys(data).forEach(key => {
          const value = data[key]
          const regex = new RegExp(`{{${key}}}`, 'g')
          if (emailHtml) emailHtml = emailHtml.replace(regex, value)
          if (emailSubject) emailSubject = emailSubject.replace(regex, value)
          if (emailText) emailText = emailText.replace(regex, value)
        })
      }
    }

    // Prepare recipients
    const recipients = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }]
    console.log(`📬 Sending to ${recipients.length} recipient(s)`)

    const emailData = {
      personalizations: [
        {
          to: recipients,
          subject: emailSubject
        }
      ],
      from: {
        email: from || 'noreply@repmotivatedseller.org',
        name: 'RepMotivatedSeller'
      },
      content: [
        ...(emailText ? [{
          type: 'text/plain',
          value: emailText
        }] : []),
        ...(emailHtml ? [{
          type: 'text/html',
          value: emailHtml
        }] : [])
      ].filter(content => content.value),
      categories: ['repmotivatedseller'],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true },
        subscription_tracking: {
          enable: true,
          text: 'To unsubscribe, visit: <%unsubscribe%>',
          html: '<p>To unsubscribe, <a href="<%unsubscribe%>">click here</a></p>'
        }
      }
    }

    console.log("🚀 Sending email via SendGrid...")

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (response.ok) {
      const messageId = response.headers.get('x-message-id')
      console.log("✅ Email sent successfully, Message ID:", messageId)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          messageId,
          recipients: recipients.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      const errorData = await response.text()
      console.error("❌ SendGrid API error:", response.status, errorData)
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`)
    }

  } catch (error) {
    console.error('❌ Email sending error:', error)
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

console.log("🎯 Email sender function ready")