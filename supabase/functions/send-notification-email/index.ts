import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// MailerLite API configuration
const MAILERLITE_API_BASE = 'https://connect.mailerlite.com/api'
const MAILERLITE_HEADERS = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${apiKey}`
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { type, submission } = await req.json()
    
    // Get environment variables
    const apiKey = Deno.env.get('MAILERLITE_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@repmotivatedseller.org'
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    const urgentEmail = Deno.env.get('URGENT_EMAIL') || adminEmail
    
    if (!apiKey) {
      throw new Error('MAILERLITE_API_KEY environment variable is not set')
    }
    
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL environment variable is not set')
    }
    
    // Determine notification type and recipients
    let subject, recipients, templateId, groupId
    const isUrgent = submission?.urgency === 'high'
    
    switch (type) {
      case 'new_submission':
        subject = isUrgent 
          ? '🚨 URGENT: New Foreclosure Assistance Request' 
          : 'New Foreclosure Assistance Request'
        recipients = isUrgent ? [adminEmail, urgentEmail] : [adminEmail]
        break
      case 'status_update':
        subject = `Status Update: ${submission?.address || 'Property'}`
        recipients = [adminEmail]
        break
      case 'test':
        subject = 'Test Notification'
        recipients = [adminEmail]
        break
      default:
        subject = 'Foreclosure Assistance Notification'
        recipients = [adminEmail]
    }
    
    // Add subscriber to appropriate group
    if (submission?.email) {
      await addSubscriberToGroup(apiKey, submission, isUrgent)
    }
    
    // Send email notification
    const emailResult = await sendEmailNotification(
      apiKey, 
      fromEmail, 
      recipients, 
      subject, 
      submission
    )
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        data: emailResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Function to add subscriber to appropriate MailerLite group
async function addSubscriberToGroup(apiKey: string, submission: any, isUrgent: boolean) {
  // Determine which groups to add the subscriber to
  const groups = ['foreclosure_clients']
  if (isUrgent) {
    groups.push('urgent_cases')
  }
  groups.push('new_leads')
  
  // Add subscriber to MailerLite
  const subscriberData = {
    email: submission.email,
    fields: {
      name: submission.name || '',
      phone: submission.phone || '',
      address: submission.address || '',
      urgency: submission.urgency || 'medium',
      status: submission.status || 'new',
      submission_date: new Date().toISOString()
    }
  }
  
  // Create or update subscriber
  const response = await fetch(`${MAILERLITE_API_BASE}/subscribers`, {
    method: 'POST',
    headers: MAILERLITE_HEADERS(apiKey),
    body: JSON.stringify(subscriberData)
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to add subscriber: ${JSON.stringify(errorData)}`)
  }
  
  const subscriberResult = await response.json()
  
  // Add subscriber to each group
  for (const groupName of groups) {
    // First, find the group ID by name
    const groupsResponse = await fetch(`${MAILERLITE_API_BASE}/groups?filter[name]=${groupName}`, {
      headers: MAILERLITE_HEADERS(apiKey)
    })
    
    if (!groupsResponse.ok) {
      console.error(`Failed to find group ${groupName}`)
      continue
    }
    
    const groupsData = await groupsResponse.json()
    if (!groupsData.data || groupsData.data.length === 0) {
      // Group doesn't exist, create it
      const createGroupResponse = await fetch(`${MAILERLITE_API_BASE}/groups`, {
        method: 'POST',
        headers: MAILERLITE_HEADERS(apiKey),
        body: JSON.stringify({ name: groupName })
      })
      
      if (!createGroupResponse.ok) {
        console.error(`Failed to create group ${groupName}`)
        continue
      }
      
      const newGroup = await createGroupResponse.json()
      const groupId = newGroup.data.id
      
      // Add subscriber to the newly created group
      await fetch(`${MAILERLITE_API_BASE}/subscribers/${subscriberResult.data.id}/groups/${groupId}`, {
        method: 'POST',
        headers: MAILERLITE_HEADERS(apiKey)
      })
    } else {
      // Group exists, add subscriber to it
      const groupId = groupsData.data[0].id
      await fetch(`${MAILERLITE_API_BASE}/subscribers/${subscriberResult.data.id}/groups/${groupId}`, {
        method: 'POST',
        headers: MAILERLITE_HEADERS(apiKey)
      })
    }
  }
  
  return subscriberResult
}

// Function to send email notification
async function sendEmailNotification(
  apiKey: string, 
  fromEmail: string, 
  recipients: string[], 
  subject: string, 
  submission: any
) {
  // Create email content
  const htmlContent = createEmailContent(submission)
  
  // Send email using MailerLite campaigns API
  const campaignData = {
    name: `Notification: ${subject}`,
    type: 'regular',
    emails: [{
      subject: subject,
      from: fromEmail,
      from_name: 'RepMotivatedSeller',
      content: {
        html: htmlContent
      }
    }],
    groups: [],
    recipients: {
      type: 'email',
      emails: recipients
    }
  }
  
  const response = await fetch(`${MAILERLITE_API_BASE}/campaigns`, {
    method: 'POST',
    headers: MAILERLITE_HEADERS(apiKey),
    body: JSON.stringify(campaignData)
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`)
  }
  
  return await response.json()
}

// Function to create email content
function createEmailContent(submission: any) {
  if (!submission) {
    return `
      <h1>Test Notification</h1>
      <p>This is a test notification from the RepMotivatedSeller system.</p>
    `
  }
  
  const urgencyClass = submission.urgency === 'high' 
    ? 'urgency-high' 
    : (submission.urgency === 'medium' ? 'urgency-medium' : 'urgency-low')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0047AB; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
        .property-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .urgency-high { border-left: 5px solid #ff4d4d; }
        .urgency-medium { border-left: 5px solid #ffcc00; }
        .urgency-low { border-left: 5px solid #4da6ff; }
        .label { font-weight: bold; }
        .button { display: inline-block; background-color: #0047AB; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>RepMotivatedSeller Notification</h2>
        </div>
        <div class="content">
          <h3>New Foreclosure Assistance Request</h3>
          
          <div class="property-details ${urgencyClass}">
            <p><span class="label">Name:</span> ${submission.name || 'Not provided'}</p>
            <p><span class="label">Email:</span> ${submission.email || 'Not provided'}</p>
            <p><span class="label">Phone:</span> ${submission.phone || 'Not provided'}</p>
            <p><span class="label">Address:</span> ${submission.address || 'Not provided'}</p>
            <p><span class="label">Urgency:</span> ${submission.urgency?.toUpperCase() || 'MEDIUM'}</p>
            <p><span class="label">Status:</span> ${submission.status || 'New'}</p>
            ${submission.notes ? `<p><span class="label">Notes:</span> ${submission.notes}</p>` : ''}
          </div>
          
          <p>Please log in to the admin dashboard to view full details and take action.</p>
          
          <a href="${Deno.env.get('SITE_URL') || 'https://repmotivatedseller.shoprealestatespace.org'}/admin-dashboard.html" class="button">
            Open Admin Dashboard
          </a>
        </div>
        <div class="footer">
          <p>This is an automated notification from the RepMotivatedSeller system.</p>
          <p>© ${new Date().getFullYear()} RepMotivatedSeller. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}