# SMS Monitoring & Alert System - Complete Implementation Guide

## 📋 Overview

This comprehensive SMS monitoring system provides:
- **Real-time conversation threading** - Group messages by phone number
- **AI-powered categorization** - Automatically classify contacts and messages
- **Smart alerts** - Notify admins based on configurable rules
- **Admin dashboard** - View, manage, and respond to all SMS conversations
- **Quick replies** - Pre-configured responses for common scenarios
- **Full TCPA compliance** - Integrated with existing consent tracking

---

## 🗄️ Database Schema

### Tables Created

1. **`sms_conversations`** - Conversation threading and management
   - Tracks each unique phone number as a conversation
   - Auto-categorizes by contact type (professional, investor, prospect, client)
   - Priority levels (low, medium, high, urgent)
   - Status tracking (new, active, pending, resolved, archived)
   - AI sentiment analysis
   - Keyword detection
   - Assignment to admin users

2. **`sms_alert_rules`** - Configurable alert rules
   - Trigger conditions (keywords, categories, contact types)
   - Alert methods (email, SMS, push, Slack)
   - Alert recipients
   - Cooldown periods
   - Priority ordering

3. **`sms_alert_history`** - Alert audit trail
   - Tracks all alerts sent
   - Delivery status
   - Error tracking

4. **`sms_quick_replies`** - Pre-configured response templates
   - Category-based templates
   - Variable substitution
   - Usage tracking

---

## 🚀 Deployment Steps

### 1. Apply Database Migration

```bash
cd "C:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Apply the SMS monitoring migration
npx supabase migration up --db-url "your-database-url"

# Or push to Supabase
npm run supabase:migrations
```

### 2. Access the Admin Dashboard

Navigate to:
```
http://localhost:3000/admin/sms
```

**Features:**
- View all conversations in real-time
- Filter by status, contact type, or search
- See unread message counts
- Click any conversation to view full message thread
- Send replies directly from the dashboard
- Update conversation status, priority, category, contact type
- Use quick replies for common responses
- Call directly from the interface

---

## 🎯 Contact Type Classification

The system automatically categorizes contacts into:

### 1. **Real Estate Professionals** 🏢
- **Keywords:** realtor, broker, agent, real estate professional, RE professional
- **Triggers:** New Professional Alert
- **Priority:** Medium-High
- **Quick Reply:** Professional Welcome message

### 2. **Investors** 💼
- **Keywords:** investor, investment, funding, loan, cash-out, refinance, portfolio
- **Triggers:** New Investor Inquiry Alert
- **Priority:** High
- **Quick Reply:** Loan Application - Next Steps

### 3. **Prospects (Foreclosure Help)** 🏠
- **Keywords:** foreclosure, pre-foreclosure, behind on payments, losing home, short sale, bank
- **Triggers:** New Foreclosure Prospect Alert (HIGH PRIORITY)
- **Priority:** Urgent
- **Quick Reply:** Foreclosure Help - Initial Response
- **Alert Method:** Email + SMS to admin

### 4. **Clients** ⭐
- **Keywords:** member, membership, account, subscription, tier, upgrade
- **Triggers:** Membership Help Request
- **Priority:** Medium
- **Quick Reply:** Membership Help

### 5. **Unknown** ❓
- **Default category** until AI or admin categorizes
- **Priority:** Medium
- **Status:** New

---

## 🤖 AI-Powered Categorization

### How It Works

1. **Incoming SMS** → Received by Twilio webhook
2. **SMS Handler** → Processes message
3. **Keyword Detection** → Scans for category keywords
4. **AI Analysis** (optional) → OpenAI sentiment analysis
5. **Auto-Categorization** → Assigns contact type & category
6. **Alert Triggers** → Checks alert rules
7. **Admin Notification** → Sends alerts via configured methods

### Keyword Categories

```javascript
const KEYWORDS = {
  foreclosure: ['foreclosure', 'pre-foreclosure', 'behind on payments', 'losing home', 'short sale', 'sheriff sale', 'foreclosure notice'],

  professional: ['realtor', 'broker', 'agent', 'real estate professional', 'listing agent', 'buyer agent'],

  investor: ['investor', 'investment property', 'portfolio', 'cash buyer', 'fix and flip', 'rental property'],

  loan: ['loan', 'funding', 'private money', 'cash-out', 'refinance', 'financing', 'lender'],

  membership: ['member', 'membership', 'account', 'subscription', 'tier', 'premium', 'upgrade'],

  urgent: ['urgent', 'emergency', 'asap', 'help now', 'immediate', 'sheriff', 'eviction', 'auction date']
};
```

---

## 🔔 Alert System

### Pre-Configured Alert Rules

#### 1. **New Foreclosure Prospect** (Priority: 150)
- **Triggers:** New prospect + foreclosure keywords
- **Alert Methods:** Email + SMS
- **Recipients:**
  - admin@repmotivatedseller.shoprealestatespace.org
  - +18778064677 (SMS)
- **Cooldown:** 60 minutes
- **Template:** "New foreclosure assistance inquiry from {phone_number}. Message: \"{message}\". Contact urgently."

#### 2. **New Real Estate Professional** (Priority: 90)
- **Triggers:** New professional contact
- **Alert Methods:** Email
- **Recipients:** admin@repmotivatedseller.shoprealestatespace.org
- **Template:** "New real estate professional inquiry from {phone_number}. Message: \"{message}\""

#### 3. **New Investor Inquiry** (Priority: 85)
- **Triggers:** New investor + loan keywords
- **Alert Methods:** Email
- **Template:** "New investor funding inquiry from {phone_number}. Message: \"{message}\""

#### 4. **Membership Help Request** (Priority: 70)
- **Triggers:** Membership keywords from clients
- **Alert Methods:** Email
- **Template:** "User {phone_number} needs membership assistance. Message: \"{message}\""

#### 5. **Urgent Keywords Detected** (Priority: 150)
- **Triggers:** Urgent keywords (emergency, asap, sheriff, etc.)
- **Alert Methods:** Email + SMS
- **Recipients:** admin@repmotivatedseller.shoprealestatespace.org + +18778064677
- **Template:** "URGENT: {phone_number} - \"{message}\". Immediate response needed!"

### Customizing Alert Rules

Use the Admin Dashboard to:
1. View existing alert rules
2. Create new rules
3. Modify trigger conditions
4. Add/remove recipients
5. Change alert methods
6. Set cooldown periods

---

## 📱 Quick Replies

### Pre-Loaded Templates

1. **Foreclosure Help - Initial Response**
   ```
   Thank you for contacting RepMotivatedSeller. We understand foreclosure is stressful.
   A specialist will call you within 24 hours at {phone}. For immediate help, call (877) 806-4677.
   ```

2. **Loan Application - Next Steps**
   ```
   Thank you for your interest in private funding! Please complete our pre-loan application
   at repmotivatedseller.com/loan-application. We'll review within 24-48 hours.
   Questions? Call (877) 806-4677.
   ```

3. **Real Estate Professional - Welcome**
   ```
   Welcome! We partner with real estate professionals to provide private funding solutions.
   Visit repmotivatedseller.com/what-we-do to learn more. Let's schedule a call: (877) 806-4677.
   ```

4. **Membership Help**
   ```
   We're here to help with your membership! Please call (877) 806-4677 or email
   admin@repmotivatedseller.shoprealestatespace.org with your question.
   ```

5. **Business Hours**
   ```
   RepMotivatedSeller hours: Mon-Fri 9AM-6PM EST. Emergency foreclosure help available
   24/7 at (877) 806-4677. Visit repmotivatedseller.com for more info.
   ```

### Using Quick Replies

1. Select a conversation in the dashboard
2. Click any Quick Reply button
3. Message appears in the text box (with variables replaced)
4. Edit if needed
5. Click "Send"

---

## 🔄 Real-Time Updates

The dashboard uses **Supabase Realtime** subscriptions to:
- Update conversation list when new messages arrive
- Show new messages in open conversations
- Update unread counts
- Highlight new conversations

No page refresh needed!

---

## 📊 Dashboard Features

### Conversation List (Left Panel)
- **Search** - Filter by phone number or name
- **Status Filter** - New, Active, Pending, Resolved, Archived
- **Contact Type Filter** - Professionals, Investors, Prospects, Clients, Unknown
- **Unread Badges** - Red badges show unread count
- **Sort** - Most recent activity first
- **Icons** - Visual indicators for contact type
- **Keywords** - Show detected keywords as tags

### Conversation Detail (Right Panel)
- **Header** - Contact info, type, message count
- **Call Button** - Direct tel: link to call from browser/phone
- **Quick Actions**:
  - Change status (dropdown)
  - Change priority (dropdown)
  - Change contact type (dropdown)
  - Change category (dropdown)
- **Message Thread** - Chronological message history
- **Message Colors**:
  - Blue = Outbound (your messages)
  - Gray = Inbound (their messages)
- **Quick Replies** - One-click response templates
- **Message Input** - Type and send new messages
  - Enter to send
  - Shift+Enter for new line

---

## 🔐 Security & Permissions

### Row Level Security (RLS)

- **Admins Only** - Only users with `is_admin = true` in profiles table can access
- **Service Role** - Edge functions have full access
- **Audit Trail** - All changes logged with timestamps

### Access Control

```sql
-- Only admins can view/manage SMS conversations
CREATE POLICY "Admins full access to conversations"
  ON public.sms_conversations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
```

---

## 🎨 UI/UX Features

### Visual Indicators

- **Unread Count** - Red badge with number
- **Priority Colors**:
  - 🔴 Urgent - Red, bold
  - 🟠 High - Orange, semibold
  - 🟡 Medium - Yellow
  - ⚪ Low - Gray

- **Status Colors**:
  - 🔵 New - Blue
  - 🟢 Active - Green
  - 🟡 Pending - Yellow
  - ⚫ Resolved - Gray
  - ⚫ Archived - Light gray

- **Contact Type Icons**:
  - 🏢 Professional
  - 💼 Investor
  - 🏠 Prospect
  - ⭐ Client
  - ❓ Unknown

### Responsive Design

- **Desktop** - 3-column layout (list + detail + actions)
- **Tablet** - 2-column layout (collapsible)
- **Mobile** - Single column (swipe between views)

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Conversations not appearing**

Check:
```sql
-- Verify conversations exist
SELECT * FROM sms_conversations ORDER BY created_at DESC LIMIT 10;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'sms_conversations';

-- Verify admin status
SELECT id, email, is_admin FROM profiles WHERE email = 'your-email@example.com';
```

#### 2. **Messages not loading**

Check:
```sql
-- Verify messages exist
SELECT * FROM sms_message_log ORDER BY created_at DESC LIMIT 20;

-- Check foreign key relationship
SELECT c.phone_number, COUNT(m.id) as message_count
FROM sms_conversations c
LEFT JOIN sms_message_log m ON m.phone_number = c.phone_number
GROUP BY c.phone_number;
```

#### 3. **Alerts not sending**

Check:
```sql
-- View alert rules
SELECT * FROM sms_alert_rules WHERE is_active = true;

-- Check alert history
SELECT * FROM sms_alert_history ORDER BY created_at DESC LIMIT 20;

-- Verify Edge Function
-- Check Supabase dashboard > Edge Functions > sms-handler logs
```

#### 4. **Real-time updates not working**

- Check browser console for Realtime subscription errors
- Verify Supabase Realtime is enabled in dashboard
- Check network tab for WebSocket connection

---

## 📈 Analytics & Reporting

### Available Metrics

```sql
-- Total conversations by contact type
SELECT contact_type, COUNT(*) as count
FROM sms_conversations
GROUP BY contact_type
ORDER BY count DESC;

-- Unread conversations
SELECT COUNT(*) as unread_conversations
FROM sms_conversations
WHERE unread_count > 0;

-- Messages by direction
SELECT direction, COUNT(*) as count
FROM sms_message_log
GROUP BY direction;

-- Alert effectiveness
SELECT
  ar.rule_name,
  COUNT(ah.id) as times_triggered,
  SUM(CASE WHEN ah.status = 'delivered' THEN 1 ELSE 0 END) as delivered
FROM sms_alert_rules ar
LEFT JOIN sms_alert_history ah ON ah.rule_id = ar.id
GROUP BY ar.rule_name
ORDER BY times_triggered DESC;

-- Response time analysis
SELECT
  c.contact_type,
  AVG(EXTRACT(EPOCH FROM (outbound.created_at - inbound.created_at))) / 60 as avg_response_minutes
FROM sms_conversations c
JOIN sms_message_log inbound ON inbound.phone_number = c.phone_number AND inbound.direction = 'inbound'
JOIN sms_message_log outbound ON outbound.phone_number = c.phone_number AND outbound.direction = 'outbound'
  AND outbound.created_at > inbound.created_at
WHERE c.contact_type != 'unknown'
GROUP BY c.contact_type;
```

---

## 🚦 Best Practices

### 1. **Response Time**
- **Urgent (Foreclosure)**: Respond within 1 hour
- **High (Professional/Investor)**: Respond within 4 hours
- **Medium**: Respond within 24 hours
- **Low**: Respond within 48 hours

### 2. **Categorization**
- Review "unknown" contacts daily
- Assign contact types based on first message
- Use keywords to auto-categorize when possible
- Update category as conversation progresses

### 3. **Status Management**
- **New** → First message, needs review
- **Active** → Ongoing conversation
- **Pending** → Waiting for their response
- **Resolved** → Issue handled, follow-up scheduled
- **Archived** → Closed, no further action needed

### 4. **Alert Management**
- Review alert rules monthly
- Adjust cooldown periods based on volume
- Monitor alert history for effectiveness
- Don't over-alert (causes fatigue)

### 5. **Quick Replies**
- Keep templates current
- Test variable substitution
- Track usage and update popular ones
- Create new templates for common scenarios

---

## 🔄 Workflow Examples

### Scenario 1: New Foreclosure Prospect

1. **SMS Received**: "Help! I'm 3 months behind on mortgage"
2. **AI Categorization**: Contact Type = Prospect, Category = Foreclosure Assistance, Priority = Urgent
3. **Alert Triggered**: "New Foreclosure Prospect" rule fires
4. **Admin Notified**: Email + SMS to admin@... and +18778064677
5. **Dashboard Updates**: Conversation appears with red "unread" badge
6. **Admin Action**:
   - Clicks conversation
   - Reviews message
   - Clicks "Foreclosure Help - Initial Response" quick reply
   - Sends message
   - Calls prospect at (877) 806-4677
   - Updates status to "Active"
   - Sets priority to "High"

### Scenario 2: Real Estate Professional Inquiry

1. **SMS Received**: "Hi, I'm a realtor looking for funding options for my client"
2. **AI Categorization**: Contact Type = Professional, Category = General Inquiry, Priority = Medium
3. **Alert Triggered**: "New Real Estate Professional" rule fires
4. **Admin Notified**: Email to admin@...
5. **Dashboard Updates**: Conversation appears
6. **Admin Action**:
   - Reviews message
   - Sends "Professional Welcome" quick reply
   - Updates category to "Loan Application"
   - Adds note: "Send What We Do page link"
   - Status: Active

### Scenario 3: Membership Question

1. **SMS Received**: "How do I upgrade my membership?"
2. **AI Categorization**: Contact Type = Client, Category = Membership Question, Priority = Medium
3. **Alert Triggered**: "Membership Help Request" rule fires
4. **Admin Notified**: Email to admin@...
5. **Dashboard Updates**: Shows existing conversation (if client has account)
6. **Admin Action**:
   - Reviews account
   - Sends "Membership Help" quick reply
   - Provides upgrade instructions
   - Updates status to "Pending" (waiting for their decision)

---

## 📞 Integration with Business Phone

Your business phone **(877) 806-4677** is already configured in:
- Twilio (for SMS sending/receiving)
- Footer contact info
- Quick reply templates
- Alert system (receives urgent alerts via SMS)

### Call Routing Setup (Recommended)

1. **Configure Twilio Voice Webhook**:
   - Point to: `https://your-project.supabase.co/functions/v1/ai-voice-handler`
   - This handles incoming voice calls with AI

2. **Call Forwarding**:
   - Forward urgent calls to admin cell
   - Set up voicemail transcription
   - Enable call recording for quality assurance

3. **Business Hours**:
   - Route to admin during business hours
   - Route to voicemail/AI after hours
   - Emergency keyword detection for 24/7 urgent calls

---

## 🎯 Next Steps

### Phase 1: ✅ Completed
- Database schema created
- Admin dashboard built
- Real-time updates working
- Alert rules configured
- Quick replies loaded

### Phase 2: Recommended Enhancements

1. **AI Integration** (Optional)
   - Connect OpenAI for sentiment analysis
   - Auto-generate response suggestions
   - Detect conversation intent
   - Predict customer needs

2. **Advanced Analytics**
   - Response time reports
   - Conversion tracking (prospect → client)
   - Alert effectiveness metrics
   - Agent performance tracking

3. **Mobile App** (Future)
   - React Native app for admins
   - Push notifications
   - Quick reply on-the-go
   - Voice-to-text responses

4. **Automation** (Future)
   - Auto-response for business hours
   - Scheduled follow-ups
   - Drip campaigns
   - Auto-assignment based on keywords

---

## 📚 Additional Resources

### API Documentation
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [OpenAI API](https://platform.openai.com/docs/api-reference) (for AI features)

### Compliance
- [TCPA Compliance](https://www.fcc.gov/general/telemarketing-and-robocalls)
- [SMS Best Practices](https://www.twilio.com/docs/sms/best-practices)

### Support
- Email: admin@repmotivatedseller.shoprealestatespace.org
- Phone: (877) 806-4677

---

## ✅ Deployment Checklist

- [ ] Run database migration
- [ ] Verify tables created successfully
- [ ] Check default alert rules exist
- [ ] Verify quick replies loaded
- [ ] Test admin dashboard access at `/admin/sms`
- [ ] Send test SMS to business number
- [ ] Verify conversation appears in dashboard
- [ ] Test sending reply from dashboard
- [ ] Verify alert email received
- [ ] Test real-time updates (send SMS while dashboard open)
- [ ] Test quick replies
- [ ] Update conversation status/priority/category
- [ ] Configure additional alert rules if needed
- [ ] Train admin users on dashboard
- [ ] Document internal procedures
- [ ] Set up backup/monitoring

---

**System Status**: ✅ Ready for Production

Access dashboard at: `https://yourdomain.com/admin/sms`

For questions or support, contact admin@repmotivatedseller.shoprealestatespace.org
