import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DirectMailRequest {
  to_address: {
    name: string;
    address_line1: string;
    address_line2?: string;
    address_city: string;
    address_state: string;
    address_zip: string;
  };
  template_type: 'foreclosure_prevention' | 'cash_offer' | 'land_acquisition' | 'loan_modification';
  property_data?: {
    address: string;
    estimated_value?: number;
    loan_amount?: number;
    equity?: number;
  };
  campaign_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const mailData: DirectMailRequest = await req.json()

    // Validate required fields
    if (!mailData.to_address || !mailData.template_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Use test secret key for development (change to LOB_LIVE_SECRET for production)
    const lobApiKey = Deno.env.get('LOB_TEST_SECRET')
    if (!lobApiKey) {
      throw new Error('Lob API key not configured')
    }

    // Template HTML based on type
    const templates = {
      foreclosure_prevention: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; line-height: 1.6; }
              .highlight { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
              .cta { background: #3b82f6; color: white; padding: 15px 30px; text-align: center; font-size: 18px; font-weight: bold; margin: 30px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏠 URGENT: Foreclosure Prevention Assistance</h1>
              <p>We Can Help You Keep Your Home</p>
            </div>
            <div class="content">
              <p>Dear {{to_name}},</p>
              <p>We understand you may be facing financial hardship with your property at <strong>{{property_address}}</strong>.</p>
              <div class="highlight">
                <h3>🛡️ FREE Foreclosure Prevention Services:</h3>
                <ul>
                  <li>✓ Loan Modification Assistance</li>
                  <li>✓ Hardship Letter Preparation</li>
                  <li>✓ Cash Offer Evaluation (if needed)</li>
                  <li>✓ Credit Repair Guidance</li>
                </ul>
              </div>
              <p><strong>IMPORTANT:</strong> All financing and loan services must be processed through RepMotivatedSeller's in-house lending department to ensure your protection and best rates.</p>
              <div class="cta">
                Call Now: (877) 806-4677<br>
                Or Visit: RepMotivatedSeller.com
              </div>
              <p>Time-sensitive: Federal programs may expire. Act now to protect your rights.</p>
            </div>
            <div class="footer">
              <p>RepMotivatedSeller | 14603 Gilmore St #7, Van Nuys, CA 91411</p>
              <p>This is a solicitation. All loans processed in-house. Licensed in CA.</p>
              <p>© 2025 RepMotivatedSeller. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      cash_offer: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; line-height: 1.6; }
              .offer-box { background: #d1fae5; border: 3px solid #10b981; padding: 25px; text-align: center; margin: 20px 0; }
              .benefits { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
              .benefit { background: #f3f4f6; padding: 15px; border-radius: 8px; }
              .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>💰 CASH OFFER for Your Property</h1>
              <p>Fast, Fair, No Fees</p>
            </div>
            <div class="content">
              <p>Dear {{to_name}},</p>
              <p>We're interested in making a <strong>CASH OFFER</strong> on your property at:</p>
              <p style="font-size: 18px; font-weight: bold; text-align: center; color: #059669;">{{property_address}}</p>
              <div class="offer-box">
                <h2 style="margin: 0; color: #059669;">Get Your Offer in 24 Hours</h2>
                <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">No Obligation • No Fees</p>
              </div>
              <div class="benefits">
                <div class="benefit">✓ Close in as little as 7 days</div>
                <div class="benefit">✓ No repairs needed</div>
                <div class="benefit">✓ No realtor commissions</div>
                <div class="benefit">✓ No closing costs</div>
              </div>
              <p><strong>FINANCING DISCLOSURE:</strong> If you choose seller financing or lease-to-own options, all loan applications must be processed through RepMotivatedSeller's in-house lending services.</p>
              <p style="text-align: center; font-size: 20px; margin: 30px 0;">
                <strong>📞 Call: (877) 806-4677</strong><br>
                <span style="font-size: 16px;">RepMotivatedSeller.com</span>
              </p>
            </div>
            <div class="footer">
              <p>RepMotivatedSeller | 14603 Gilmore St #7, Van Nuys, CA 91411</p>
              <p>We buy houses in any condition. All loans processed in-house.</p>
              <p>Licensed Real Estate Broker. DRE #XXXXX</p>
            </div>
          </body>
        </html>
      `,
      land_acquisition: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; line-height: 1.6; }
              .acquisition-box { background: #fef3c7; border: 3px solid #f59e0b; padding: 25px; margin: 20px 0; }
              .value-props { margin: 20px 0; }
              .value-prop { padding: 15px; margin: 10px 0; border-left: 4px solid #f59e0b; background: #fffbeb; }
              .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏞️ LAND ACQUISITION OPPORTUNITY</h1>
              <p>Maximize Your Land Value</p>
            </div>
            <div class="content">
              <p>Dear {{to_name}},</p>
              <p>We specialize in land acquisitions and development opportunities. Your property at <strong>{{property_address}}</strong> may qualify for our acquisition program.</p>
              <div class="acquisition-box">
                <h3>Why Work With RepMotivatedSeller?</h3>
                <div class="value-props">
                  <div class="value-prop">
                    <strong>🏗️ Development Partnerships:</strong> We can develop your land with you as a partner
                  </div>
                  <div class="value-prop">
                    <strong>💵 Multiple Exit Strategies:</strong> Cash sale, joint venture, or seller financing options
                  </div>
                  <div class="value-prop">
                    <strong>📊 Professional Valuation:</strong> Free market analysis and highest-use determination
                  </div>
                  <div class="value-prop">
                    <strong>⚖️ Legal Protection:</strong> Full contract review and title insurance included
                  </div>
                </div>
              </div>
              <p><strong>🔒 EXCLUSIVE IN-HOUSE PROCESSING:</strong> All financing, development loans, and acquisition contracts are processed exclusively through RepMotivatedSeller to ensure optimal terms and legal compliance.</p>
              <p style="background: #fee2e2; border: 2px solid #dc2626; padding: 15px; margin: 20px 0;">
                <strong>⚠️ NOTICE:</strong> This property and all related opportunities identified through our marketing are subject to RepMotivatedSeller's exclusive acquisition rights. Unauthorized third-party solicitation is prohibited by law.
              </p>
              <p style="text-align: center; font-size: 20px; margin: 30px 0;">
                <strong>Schedule Consultation: (877) 806-4677</strong>
              </p>
            </div>
            <div class="footer">
              <p>RepMotivatedSeller - Land Acquisition Division</p>
              <p>14603 Gilmore St #7, Van Nuys, CA 91411</p>
              <p>All acquisition contracts processed in-house. Licensed CA Real Estate Broker.</p>
            </div>
          </body>
        </html>
      `,
      loan_modification: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; line-height: 1.6; }
              .urgency { background: #fef2f2; border: 3px solid #dc2626; padding: 20px; margin: 20px 0; text-align: center; }
              .services { background: #ede9fe; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>⏰ URGENT: Loan Modification Assistance</h1>
              <p>Lower Your Monthly Payment Now</p>
            </div>
            <div class="content">
              <p>Dear {{to_name}},</p>
              <div class="urgency">
                <h2 style="color: #dc2626; margin: 0 0 10px 0;">Don't Let Your Home Go Into Foreclosure!</h2>
                <p style="font-size: 18px; margin: 0;">We can help modify your loan and reduce your payment</p>
              </div>
              <p>Your property at <strong>{{property_address}}</strong> may qualify for federal and state loan modification programs that can:</p>
              <div class="services">
                <h3 style="color: #6d28d9;">✨ Available Relief Options:</h3>
                <ul style="line-height: 2;">
                  <li><strong>Reduce Interest Rate</strong> - Lower your APR to affordable levels</li>
                  <li><strong>Extend Loan Term</strong> - Spread payments over more years</li>
                  <li><strong>Principal Forbearance</strong> - Defer part of your balance</li>
                  <li><strong>Forgiveness Programs</strong> - Qualify for partial loan forgiveness</li>
                </ul>
              </div>
              <p><strong>🔐 PROTECTED PROCESSING:</strong> All loan modifications, refinancing, and hardship applications MUST be submitted through RepMotivatedSeller's certified in-house loan processing department. We ensure compliance with federal guidelines and protect your rights.</p>
              <p style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <strong>📞 FREE Consultation:</strong> Our HUD-certified counselors will review your situation at no cost and prepare all paperwork including hardship letters, financial statements, and modification applications.
              </p>
              <p style="text-align: center; font-size: 22px; font-weight: bold; margin: 30px 0; color: #6d28d9;">
                Call 24/7: (877) 806-4677
              </p>
            </div>
            <div class="footer">
              <p>RepMotivatedSeller - Loan Modification Services</p>
              <p>14603 Gilmore St #7, Van Nuys, CA 91411</p>
              <p>HUD-Approved Housing Counseling. All loans processed in-house.</p>
              <p>NMLS #XXXXX | Licensed Mortgage Lender</p>
            </div>
          </body>
        </html>
      `
    };

    // Get template HTML
    const htmlTemplate = templates[mailData.template_type];
    let finalHtml = htmlTemplate;

    // Replace placeholders
    finalHtml = finalHtml.replace(/{{to_name}}/g, mailData.to_address.name);
    if (mailData.property_data?.address) {
      finalHtml = finalHtml.replace(/{{property_address}}/g, mailData.property_data.address);
    }

    // Send via Lob API
    const lobResponse = await fetch('https://api.lob.com/v1/letters', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(lobApiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `${mailData.template_type} - ${mailData.campaign_id || 'general'}`,
        to: mailData.to_address,
        from: {
          name: 'RepMotivatedSeller',
          address_line1: '14603 Gilmore St #7',
          address_city: 'Van Nuys',
          address_state: 'CA',
          address_zip: '91411'
        },
        file: finalHtml,
        color: true,
        double_sided: false,
        mail_type: 'usps_first_class',
        metadata: {
          campaign_id: mailData.campaign_id || 'direct_mail',
          template_type: mailData.template_type,
          processed_via: 'repmotivatedseller'
        }
      })
    });

    if (!lobResponse.ok) {
      const error = await lobResponse.text();
      throw new Error(`Lob API error: ${error}`);
    }

    const lobData = await lobResponse.json();

    // Log to database
    const { error: dbError } = await supabase
      .from('direct_mail_campaigns')
      .insert({
        lob_letter_id: lobData.id,
        recipient_name: mailData.to_address.name,
        recipient_address: `${mailData.to_address.address_line1}, ${mailData.to_address.address_city}, ${mailData.to_address.address_state} ${mailData.to_address.address_zip}`,
        template_type: mailData.template_type,
        campaign_id: mailData.campaign_id,
        property_address: mailData.property_data?.address,
        status: 'sent',
        lob_tracking_url: lobData.url,
        expected_delivery: lobData.expected_delivery_date,
        metadata: {
          lob_response: lobData,
          property_data: mailData.property_data
        }
      });

    if (dbError) {
      console.error('Database logging error:', dbError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        letter_id: lobData.id,
        tracking_url: lobData.url,
        expected_delivery: lobData.expected_delivery_date
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
