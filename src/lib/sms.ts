import { ForeclosureResponse } from './supabase';

// Check if SMS notifications are enabled
function isSMSEnabled(): boolean {
  return import.meta.env.ENABLE_SMS_NOTIFICATIONS === 'true';
}

// Get Twilio configuration
function getTwilioConfig() {
  return {
    accountSid: import.meta.env.TWILIO_ACCOUNT_SID,
    authToken: import.meta.env.TWILIO_AUTH_TOKEN,
    phoneNumber: import.meta.env.TWILIO_PHONE_NUMBER,
  };
}

// Send SMS notification for urgent cases
export async function sendUrgentSMSNotification(response: ForeclosureResponse): Promise<boolean> {
  if (!isSMSEnabled() || response.urgency_level !== 'high') {
    return false;
  }
  
  const config = getTwilioConfig();
  
  if (!config.accountSid || !config.authToken || !config.phoneNumber) {
    console.warn('Twilio configuration incomplete');
    return false;
  }
  
  try {
    // Format message
    const message = `
      🚨 URGENT: New foreclosure assistance request
      Name: ${response.name}
      Phone: ${response.phone}
      Urgency: HIGH
      Missed Payments: ${response.missed_payments || 0}
      NOD Received: ${response.received_nod ? 'Yes' : 'No'}
    `.trim();
    
    // Get recipient phone numbers from environment variables
    const recipientPhones = import.meta.env.URGENT_SMS_RECIPIENTS?.split(',') || [];
    
    if (recipientPhones.length === 0) {
      console.warn('No SMS recipients configured');
      return false;
    }
    
    // Send SMS to each recipient
    const results = await Promise.all(
      recipientPhones.map(async (to: string) => {
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`),
            },
            body: new URLSearchParams({
              To: to.trim(),
              From: config.phoneNumber,
              Body: message,
            }).toString(),
          }
        );
        
        return twilioResponse.ok;
      })
    );
    
    return results.every(Boolean);
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
}

// Send status update SMS
export async function sendStatusUpdateSMS(foreclosureResponse: ForeclosureResponse): Promise<boolean> {
  if (!isSMSEnabled()) {
    return false;
  }
  
  const config = getTwilioConfig();
  
  if (!config.accountSid || !config.authToken || !config.phoneNumber) {
    console.warn('Twilio configuration incomplete');
    return false;
  }
  
  try {
    // Format message
    const message = `
      RepMotivatedSeller: Your foreclosure assistance request has been updated.
      Current Status: ${foreclosureResponse.status.toString().toUpperCase()}
      ${foreclosureResponse.notes ? `Notes: ${foreclosureResponse.notes}` : ''}
      
      Questions? Call us at 555-123-4567
    `.trim();
    
    // Send SMS to the client
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`),
        },
        body: new URLSearchParams({
          To: foreclosureResponse.phone,
          From: config.phoneNumber,
          Body: message,
        }).toString(),
      }
    );
    
    return twilioResponse.ok;
  } catch (error) {
    console.error('Error sending status update SMS:', error);
    return false;
  }
}