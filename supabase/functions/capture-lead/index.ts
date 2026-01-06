import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { email, name, source, template, tags } = await req.json()

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Store lead in database
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        email,
        name: name || null,
        source: source || 'unknown',
        metadata: {
          template,
          tags: tags || [],
          captured_at: new Date().toISOString(),
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      .select()
      .single()

    if (leadError && leadError.code !== '23505') { // Ignore duplicate email errors
      throw leadError
    }

    // Add to MailerLite if configured
    const mailerliteApiKey = Deno.env.get('VITE_MAILERLITE_API_KEY')
    if (mailerliteApiKey) {
      try {
        const mailerliteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${mailerliteApiKey}`
          },
          body: JSON.stringify({
            email,
            fields: {
              name: name || '',
              source: source || 'hardship_letter_generator'
            },
            groups: [], // Add your MailerLite group IDs here
            tags: tags || ['hardship_letter', 'lead_magnet']
          })
        })

        if (!mailerliteResponse.ok) {
          console.error('MailerLite error:', await mailerliteResponse.text())
        }
      } catch (mailerliteError) {
        console.error('MailerLite integration failed:', mailerliteError)
        // Don't fail the request if MailerLite fails
      }
    }

    // Send welcome email
    try {
      await supabase.functions.invoke('send-mail', {
        body: {
          to: email,
          subject: 'Your Hardship Letter - Next Steps',
          html: `
            <h2>Thank you for using our Hardship Letter Generator!</h2>
            <p>Hi ${name || 'there'},</p>
            <p>Your hardship letter has been generated successfully. Here are your next steps:</p>
            <ol>
              <li><strong>Review and Sign:</strong> Print your letter and sign it in blue ink</li>
              <li><strong>Gather Documents:</strong> Collect all supporting documentation (pay stubs, medical bills, etc.)</li>
              <li><strong>Make Copies:</strong> Keep copies of everything for your records</li>
              <li><strong>Send via Certified Mail:</strong> Use certified mail with return receipt requested</li>
              <li><strong>Follow Up:</strong> Call your lender/creditor 7-10 days after mailing</li>
            </ol>
            <h3>Need More Help?</h3>
            <p>Create a free account at RepMotivatedSeller for:</p>
            <ul>
              <li>✓ One-on-one foreclosure prevention consultation</li>
              <li>✓ Personalized action plans</li>
              <li>✓ Direct connections to cash buyers and investors</li>
              <li>✓ Credit repair resources</li>
              <li>✓ Legal document templates</li>
            </ul>
            <p><a href="https://repmotivatedseller.shoprealestatespace.org/auth" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Create Free Account</a></p>
            <p>Best regards,<br>The RepMotivatedSeller Team</p>
            <hr>
            <p style="font-size: 12px; color: #666;">You received this email because you generated a hardship letter at RepMotivatedSeller.com. If you didn't request this, you can safely ignore this email.</p>
          `
        }
      })
    } catch (emailError) {
      console.error('Email send failed:', emailError)
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead captured successfully',
        lead_id: leadData?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
