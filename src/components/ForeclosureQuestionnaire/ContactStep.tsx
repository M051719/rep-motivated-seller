// SMS Compliance Fix Strategy for RepMotivatedSeller

// 1. UPDATE YOUR FORECLOSURE FORM TO INCLUDE SMS CONSENT
// File: src/components/ForeclosureQuestionnaire/ContactStep.tsx

const ContactStep = () => {
  const [smsConsent, setSmsConsent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="contact-step">
      <h3>Contact Information</h3>
      
      <div className="phone-field">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>

      {/* SMS CONSENT CHECKBOX - REQUIRED FOR COMPLIANCE */}
      <div className="sms-consent">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            required
          />
          <span className="checkmark"></span>
          <span className="consent-text">
            I consent to receive SMS text messages from RepMotivatedSeller 
            regarding my foreclosure assistance inquiry. Message and data 
            rates may apply. I can opt out at any time by replying STOP.
            <a href="/sms-terms" target="_blank"> View SMS Terms</a>
          </span>
        </label>
      </div>

      <div className="sms-disclaimer">
        <p className="text-sm text-gray-600">
          By providing your phone number and checking the box above, you agree to receive 
          text messages from RepMotivatedSeller. You may receive up to 3 messages per week. 
          Reply STOP to opt out or HELP for assistance.
        </p>
      </div>
    </div>
  );
};

// 2. CREATE SMS TERMS OF SERVICE PAGE
// File: src/components/Legal/SmsTerms.tsx

const SmsTerms = () => {
  return (
    <div className="sms-terms-container">
      <h1>SMS Terms of Service</h1>
      
      <section>
        <h2>RepMotivatedSeller SMS Program</h2>
        <p>
          By opting in to our SMS program, you agree to receive text messages 
          from RepMotivatedSeller regarding:
        </p>
        <ul>
          <li>Foreclosure assistance updates</li>
          <li>Appointment reminders</li>
          <li>Important deadline notifications</li>
          <li>Educational foreclosure prevention content</li>
        </ul>
      </section>

      <section>
        <h2>Message Frequency</h2>
        <p>
          You may receive up to 3 messages per week. Message frequency may vary 
          based on your case status and preferences.
        </p>
      </section>

      <section>
        <h2>Opt-Out Instructions</h2>
        <p>
          To stop receiving messages, text STOP to any message from us. 
          You will receive a confirmation message. For help, text HELP.
        </p>
      </section>

      <section>
        <h2>Message & Data Rates</h2>
        <p>
          Message and data rates may apply. Carriers are not liable for 
          delayed or undelivered messages.
        </p>
      </section>

      <section>
        <h2>Contact Information</h2>
        <p>
          For support, call (877) 806-4677 or email help@repmotivatedseller.org
        </p>
      </section>
    </div>
  );
};

// 3. IMPLEMENT STOP/START KEYWORD HANDLING
// File: supabase/functions/sms-compliance-handler/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const formData = await req.formData();
  const from = formData.get('From') as string;
  const body = formData.get('Body') as string;
  const messageBody = body?.toLowerCase().trim();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let responseMessage = '';

  // Handle STOP keywords
  if (['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit'].includes(messageBody)) {
    // Update user's SMS preference in database
    await supabase
      .from('property_submissions')
      .update({ sms_opted_out: true, sms_opt_out_date: new Date().toISOString() })
      .eq('phone', from);

    responseMessage = 'You have been unsubscribed from RepMotivatedSeller SMS. ' +
                     'You will no longer receive text messages from us. ' +
                     'Reply START to resubscribe or call (877) 806-4677 for assistance.';

  // Handle START keywords  
  } else if (['start', 'subscribe', 'yes'].includes(messageBody)) {
    await supabase
      .from('property_submissions')
      .update({ 
        sms_opted_out: false, 
        sms_opt_in_date: new Date().toISOString(),
        sms_opt_out_date: null 
      })
      .eq('phone', from);

    responseMessage = 'Welcome back! You are now subscribed to RepMotivatedSeller SMS updates. ' +
                     'Reply STOP to opt out. For help, call (877) 806-4677.';

  // Handle HELP keywords
  } else if (['help', 'info', 'support'].includes(messageBody)) {
    responseMessage = 'RepMotivatedSeller SMS Help:\n' +
                     '• Reply STOP to unsubscribe\n' +
                     '• Reply START to resubscribe\n' +
                     '• Call (877) 806-4677 for assistance\n' +
                     '• Visit repmotivatedseller.org';
  }

  // Return TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      ${responseMessage ? `<Message>${responseMessage}</Message>` : ''}
    </Response>`;

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  });
});

// 4. TOLL-FREE VERIFICATION RESUBMISSION CHECKLIST
const resubmissionChecklist = {
  businessDocuments: [
    '✅ EIN or business registration',
    '✅ Business license (if applicable)',
    '✅ Website with contact information',
    '✅ Privacy policy mentioning SMS'
  ],
  
  consentProcess: [
    '✅ Opt-in checkbox on forms',
    '✅ SMS terms of service page',
    '✅ Double opt-in confirmation',
    '✅ Clear opt-out instructions'
  ],
  
  messageExamples: [
    '✅ Welcome message template',
    '✅ Reminder message template', 
    '✅ Opt-out confirmation template',
    '✅ Help response template'
  ],
  
  technicalImplementation: [
    '✅ STOP keyword handling',
    '✅ START keyword handling',
    '✅ HELP keyword handling',
    '✅ Database tracking of opt-in/opt-out'
  ]
};