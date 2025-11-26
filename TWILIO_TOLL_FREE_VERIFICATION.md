# Twilio Toll-Free SMS Verification Documentation

**RepMotivatedSeller - Foreclosure Assistance Platform**

**Toll-Free Number:** (877) 806-4677
**Company:** RepMotivatedSeller
**Use Case:** Foreclosure assistance, property consultation, appointment reminders
**Submission Date:** November 2025

---

## Table of Contents

1. [Business Information](#business-information)
2. [SMS Program Overview](#sms-program-overview)
3. [Opt-In Workflow](#opt-in-workflow)
4. [Message Types and Examples](#message-types-and-examples)
5. [Opt-Out Mechanism](#opt-out-mechanism)
6. [Compliance Features](#compliance-features)
7. [Technical Implementation](#technical-implementation)
8. [Privacy and Data Protection](#privacy-and-data-protection)

---

## Business Information

**Business Name:** RepMotivatedSeller
**Website:** https://repmotivatedseller.com
**Business Type:** Real Estate Services - Foreclosure Assistance
**Industry:** Real Estate / Financial Services

**Contact Information:**
- Business Email: support@repmotivatedseller.com
- Business Phone: (877) 806-4677
- Business Address: [Your Business Address]

**Tax ID/EIN:** [Your EIN]

---

## SMS Program Overview

### Purpose
RepMotivatedSeller provides SMS notifications to help homeowners facing foreclosure stay informed about their case status, appointments, and available assistance options.

### Target Audience
- Homeowners facing foreclosure
- Property owners seeking consultation
- Clients who have submitted foreclosure assistance requests

### Message Frequency
**Estimated Volume:** 2-4 messages per month per subscriber
- Initial confirmation: 1 message (immediate)
- Case updates: 1-2 messages per month
- Appointment reminders: As scheduled
- Occasional tips/resources: 1 message per month

### Service Availability
24/7 opt-in/opt-out capability via keyword responses

---

## Opt-In Workflow

### Method: Web Form with Optional Checkbox

**IMPORTANT:** SMS notifications are **OPTIONAL** and **NOT REQUIRED** to receive our foreclosure assistance services.

### Step-by-Step User Journey

#### 1. User Visits Website
User navigates to: https://repmotivatedseller.com/foreclosure

#### 2. User Fills Out Foreclosure Assistance Form
Required fields (for service):
- Full Name
- Email Address
- Phone Number
- Property information
- Situation details

#### 3. User Sees SMS Consent Checkbox (Optional)
The following consent checkbox appears **AFTER** the user enters their phone number:

```
┌─────────────────────────────────────────────────────────────────┐
│ ☐ Optional: Receive SMS updates about your case                │
│                                                                 │
│   By checking this box, you consent to receive SMS messages    │
│   from RepMotivatedSeller at (877) 806-4677 regarding:         │
│                                                                 │
│   • Case status updates and progress notifications             │
│   • Appointment reminders and confirmations                    │
│   • Important foreclosure assistance information               │
│   • Occasional tips and resources (2-4 messages per month)     │
│                                                                 │
│   Message frequency: Approximately 2-4 messages per month.     │
│   Message and data rates may apply.                            │
│                                                                 │
│   Opt-out anytime: Reply STOP to any message to unsubscribe.   │
│   Reply HELP for assistance.                                   │
│                                                                 │
│   Not required: This is optional. You can still receive our    │
│   full services without SMS notifications.                     │
│                                                                 │
│   For more information, see our Privacy Policy and Terms       │
│   of Service.                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. User Makes Conscious Decision
- User can **check** the box to opt-in (optional)
- User can **leave unchecked** to opt-out (no SMS)
- **Service is provided regardless of choice**

#### 5. User Submits Form
Upon submission:
- If checkbox is **checked**: Consent recorded in database with:
  - Phone number
  - Consent timestamp
  - Method: "web_form"
  - IP address (if available)
  - User agent (browser info)
  - Status: "opted_in"

- If checkbox is **unchecked**: No SMS consent recorded, no messages sent

#### 6. Confirmation (If Opted-In)
User receives immediate confirmation SMS:
```
RepMotivatedSeller: Thank you! You're subscribed to SMS updates about your
foreclosure case. We'll send 2-4 messages/month. Reply STOP to unsubscribe,
HELP for help. Msg&data rates may apply.
```

### Consent Language (Exact Text)

**Checkbox Label:**
"Optional: Receive SMS updates about your case"

**Full Disclosure Text:**
```
By checking this box, you consent to receive SMS messages from
RepMotivatedSeller at the phone number you provided ([PHONE NUMBER]) regarding:

- Case status updates and progress notifications
- Appointment reminders and confirmations
- Important foreclosure assistance information
- Occasional tips and resources (2-4 messages per month)

Message frequency: Approximately 2-4 messages per month.
Message and data rates may apply.

Opt-out anytime: Reply STOP to any message to unsubscribe.
Reply HELP for assistance.

Not required: This is optional. You can still receive our full services
without SMS notifications.

For more information, see our Privacy Policy and Terms of Service.
```

---

## Message Types and Examples

### 1. Opt-In Confirmation (Immediate)
**Frequency:** Once per subscriber
**Example:**
```
RepMotivatedSeller: Thank you! You're subscribed to SMS updates about your
foreclosure case. We'll send 2-4 messages/month. Reply STOP to unsubscribe,
HELP for help. Msg&data rates may apply.
```

### 2. Case Status Updates (1-2x per month)
**Frequency:** 1-2 times per month
**Examples:**
```
RepMotivatedSeller: Update on your case #12345: Our specialist has reviewed
your submission and will contact you within 24 hours. Questions? Call
(877) 806-4677.

RepMotivatedSeller: Great news! Your foreclosure assistance application has
been approved. Next steps will be emailed to you today. Reply STOP to opt-out.
```

### 3. Appointment Reminders (As Scheduled)
**Frequency:** Per scheduled consultation
**Examples:**
```
RepMotivatedSeller: Reminder: Your foreclosure consultation is scheduled for
tomorrow at 2:00 PM EST. Please call (877) 806-4677 if you need to reschedule.
Reply STOP to opt-out.

RepMotivatedSeller: Your consultation is in 1 hour (2:00 PM EST). We'll call
you at [PHONE]. Questions? Text back or call (877) 806-4677.
```

### 4. Important Notifications (As Needed)
**Frequency:** Rare, only for urgent matters
**Examples:**
```
RepMotivatedSeller: URGENT: Your foreclosure sale date has been rescheduled.
Please call us immediately at (877) 806-4677. Reply STOP to opt-out.

RepMotivatedSeller: Action Required: Please review and sign the documents
we emailed you within 48 hours. Call (877) 806-4677 with questions.
```

### 5. Helpful Tips (1x per month)
**Frequency:** Maximum 1 per month
**Examples:**
```
RepMotivatedSeller: Tip: Document all communications with your lender.
This can help your case. More tips at repmotivatedseller.com/resources.
Reply STOP to opt-out.

RepMotivatedSeller: Did you know? You have rights during foreclosure.
Learn more about your options at repmotivatedseller.com/rights or call
(877) 806-4677.
```

### 6. Keyword Auto-Responses

**STOP Keywords:**
```
User sends: STOP
System replies: You have been unsubscribed from RepMotivatedSeller SMS alerts.
You will not receive further messages. Reply START to resubscribe.
```

**HELP Keyword:**
```
User sends: HELP
System replies: RepMotivatedSeller: Foreclosure assistance & real estate
services. For support, call (877) 806-4677 or visit repmotivatedseller.com.
Msg&data rates may apply. Reply STOP to unsubscribe.
```

**START Keywords (Re-opt-in):**
```
User sends: START
System replies: You have been re-subscribed to RepMotivatedSeller SMS alerts.
Reply STOP to unsubscribe, HELP for help. Msg&data rates may apply.
```

---

## Opt-Out Mechanism

### Supported Keywords (All Case-Insensitive)
Our system recognizes and processes these opt-out keywords automatically:
- STOP
- STOPALL
- UNSUBSCRIBE
- CANCEL
- END
- QUIT

### Opt-Out Process

1. **User sends STOP keyword**
   ```
   User: STOP
   ```

2. **System processes immediately** (< 5 seconds)
   - Database updated: `consent_status` = 'opted_out'
   - Opt-out timestamp recorded
   - Method logged: 'sms_reply'
   - Audit trail created

3. **Confirmation sent**
   ```
   System: You have been unsubscribed from RepMotivatedSeller SMS alerts.
   You will not receive further messages. Reply START to resubscribe.
   ```

4. **No further messages sent** (except response to START to re-opt-in)

### Re-Opt-In Process
Users can re-subscribe anytime by texting:
- START
- YES
- UNSTOP

System will:
1. Update consent status to 'opted_in'
2. Send confirmation message
3. Resume sending messages

### Alternative Opt-Out Methods
Users can also opt-out via:
- **Web form:** Unsubscribe link in privacy policy
- **Phone:** Call (877) 806-4677 and request removal
- **Email:** Email support@repmotivatedseller.com

---

## Compliance Features

### TCPA Compliance
✅ **Prior Express Written Consent:** Obtained via web form checkbox
✅ **Clear Disclosure:** Full terms displayed before opt-in
✅ **Optional Participation:** NOT required for service
✅ **Opt-Out Instructions:** Displayed during opt-in and in every message
✅ **Immediate Opt-Out Processing:** < 5 seconds
✅ **Maintained Opt-Out List:** Permanent database records

### CTIA Best Practices
✅ **STOP/HELP Keywords:** All required keywords implemented
✅ **Message Frequency Disclosure:** "2-4 messages per month" clearly stated
✅ **Cost Disclosure:** "Msg&data rates may apply" in all confirmations
✅ **Company Identification:** "RepMotivatedSeller" in all messages
✅ **Customer Support Contact:** Phone number provided in HELP response

### Data Retention
- Consent records: Retained for **4 years** after opt-out
- Message logs: Retained for **2 years** minimum
- Audit trails: Immutable, retained indefinitely

### Privacy & Security
- Phone numbers encrypted at rest
- Access restricted to authorized personnel only
- No sharing with third parties without consent
- Compliant with GLBA (financial data protection)
- Full privacy policy: https://repmotivatedseller.com/privacy-policy

---

## Technical Implementation

### Database Schema
We maintain comprehensive tracking via PostgreSQL:

**sms_consent table:**
- phone_number (unique)
- consent_status ('opted_in' | 'opted_out' | 'pending')
- consent_date
- consent_method ('web_form' | 'sms_reply' | 'manual')
- opt_out_date
- opt_out_method

**sms_message_log table:**
- Complete audit trail of all messages
- Delivery status tracking
- Consent verification at send time

**sms_consent_audit table:**
- Immutable audit log of all consent changes
- Tracks who, what, when, why for compliance

### Keyword Processing
- Automated keyword detection (case-insensitive)
- Real-time database updates
- Immediate confirmation messages
- Logged in audit trail

### Pre-Send Consent Verification
Before every message:
```sql
-- Check consent status
SELECT consent_status FROM sms_consent
WHERE phone_number = ? AND consent_status = 'opted_in'
```
Message is **blocked** if:
- No consent record exists
- Status is 'opted_out' or 'pending'
- Opt-out was within last 48 hours

### Error Handling
- Failed messages logged with error codes
- Automatic retry for transient failures (max 3 attempts)
- Permanent failures trigger opt-out
- All errors visible in SMS Monitoring Dashboard

### Webhook Integration
- **Inbound messages:** https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-handler
- **Status callbacks:** Same endpoint with signature verification
- **Security:** Twilio signature validation on all requests

---

## Privacy and Data Protection

### Privacy Policy
Full privacy policy available at: https://repmotivatedseller.com/privacy-policy

**Key provisions:**
- Data collection transparency
- Usage limitations
- Opt-out rights
- Data retention policies
- Third-party sharing restrictions
- Security measures
- GLBA compliance for financial data

### Terms of Service
Full terms available at: https://repmotivatedseller.com/terms-of-service

**Key provisions:**
- Service description
- User responsibilities
- SMS program terms
- Liability limitations
- Dispute resolution

### Data Security Measures
- TLS/SSL encryption in transit
- Database encryption at rest
- Row-level security (RLS) policies
- Access logging and monitoring
- Regular security audits
- Incident response procedures

### User Rights
Users have the right to:
- ✅ Opt-out at any time
- ✅ Request data deletion
- ✅ Access their consent records
- ✅ Update preferences
- ✅ File complaints

---

## Verification Checklist

Use this checklist when submitting to Twilio:

- [ ] Business information completed
- [ ] Website URL provided and active
- [ ] Privacy policy live and linked
- [ ] Terms of service live and linked
- [ ] Opt-in workflow documented with screenshots
- [ ] Consent language provided (exact text)
- [ ] Message examples provided (all types)
- [ ] Message frequency specified (2-4/month)
- [ ] Opt-out mechanism documented (STOP keywords)
- [ ] Re-opt-in mechanism documented (START keywords)
- [ ] HELP keyword response provided
- [ ] Customer support contact provided
- [ ] Use case clearly stated (not marketing-only)
- [ ] Confirmation that SMS is OPTIONAL (not required)
- [ ] Database schema described
- [ ] Compliance features documented
- [ ] Data retention policy stated
- [ ] Security measures outlined

---

## Submission Information

**Submitted by:** [Your Name/Title]
**Submission Date:** [Date]
**Twilio Account SID:** [Your Account SID]
**Toll-Free Number:** +18778064677

**Expected Review Time:** 1-3 business days
**Follow-up Contact:** support@repmotivatedseller.com

---

## Appendix: Screenshots

Include these screenshots with your submission:

1. **Homepage with "Get Help" CTA**
   - Shows clear path to foreclosure form

2. **Foreclosure Assistance Form - Step 1**
   - Shows phone number field
   - Shows SMS consent checkbox (unchecked by default)
   - Shows full disclosure text

3. **SMS Consent Checkbox (Expanded View)**
   - Clear screenshot of entire consent language
   - Shows "Not required" statement
   - Shows frequency disclosure
   - Shows opt-out instructions

4. **Form Submission Success Page**
   - Confirms data submitted
   - Shows next steps

5. **Opt-In Confirmation SMS (Phone Screenshot)**
   - Shows confirmation message received
   - Shows sender: (877) 806-4677

6. **STOP Keyword Response (Phone Screenshot)**
   - Shows user sending "STOP"
   - Shows system confirmation

7. **HELP Keyword Response (Phone Screenshot)**
   - Shows user sending "HELP"
   - Shows system response with support info

8. **Privacy Policy Page**
   - Shows SMS program section
   - URL: https://repmotivatedseller.com/privacy-policy

9. **Terms of Service Page**
   - Shows SMS terms section
   - URL: https://repmotivatedseller.com/terms-of-service

---

## Contact for Questions

If Twilio reviewers have questions:

**Primary Contact:** [Your Name]
**Email:** support@repmotivatedseller.com
**Phone:** (877) 806-4677
**Best Time to Reach:** Monday-Friday, 9 AM - 5 PM EST

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Next Review:** As needed per Twilio feedback
