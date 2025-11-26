-- SMS Monitoring & Categorization System
-- Created: 2025-11-19
-- Purpose: Add conversation threading, categorization, and alert system for SMS monitoring

-- =====================================================
-- 1. SMS Conversations Table (Thread Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,

  -- Contact Information
  contact_name TEXT,
  contact_email TEXT,
  contact_type TEXT CHECK (contact_type IN (
    'real_estate_professional', -- Realtors, brokers, agents
    'investor', -- Real estate investors
    'prospect', -- Homeowners seeking foreclosure help
    'client', -- Existing clients
    'unknown' -- Not yet categorized
  )) DEFAULT 'unknown',

  -- Conversation Status
  status TEXT CHECK (status IN (
    'new', -- New conversation, needs review
    'active', -- Actively communicating
    'pending', -- Waiting for response
    'resolved', -- Issue resolved
    'archived' -- Conversation archived
  )) DEFAULT 'new',

  -- Priority & Categorization
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  category TEXT CHECK (category IN (
    'foreclosure_assistance', -- Pre-foreclosure help
    'loan_application', -- Private money loan inquiry
    'membership_question', -- Membership tier help
    'general_inquiry', -- General questions
    'complaint', -- Issues/complaints
    'support' -- Technical support
  )),

  -- AI-Powered Classification
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  ai_confidence DECIMAL(5, 2), -- 0.00 to 100.00
  ai_suggested_response TEXT,
  keywords TEXT[], -- Array of detected keywords

  -- Assignment & Tracking
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Metrics
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_message_direction TEXT CHECK (last_message_direction IN ('inbound', 'outbound')),
  last_message_preview TEXT, -- Last 100 chars of last message

  -- Alert Tracking
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMPTZ,
  alert_recipients TEXT[], -- Array of admin emails/phones

  -- Metadata
  tags TEXT[], -- Custom tags
  notes TEXT, -- Admin notes
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Linked user account if exists

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT fk_phone_consent FOREIGN KEY (phone_number)
    REFERENCES public.sms_consent(phone_number) ON DELETE CASCADE
);

-- =====================================================
-- 2. SMS Alerts Configuration Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sms_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Trigger Conditions
  trigger_on TEXT[] NOT NULL, -- e.g., ['new_prospect', 'foreclosure_keyword', 'high_priority']
  contact_types TEXT[], -- Filter by contact type
  categories TEXT[], -- Filter by category
  keywords TEXT[], -- Specific keywords to trigger on

  -- Alert Configuration
  alert_method TEXT[] NOT NULL CHECK (
    alert_method <@ ARRAY['email', 'sms', 'push', 'slack']::TEXT[]
  ),
  alert_recipients TEXT[] NOT NULL, -- Email addresses, phone numbers, etc.

  -- Alert Message
  alert_subject TEXT,
  alert_template TEXT, -- Template with placeholders: {phone_number}, {message}, {category}

  -- Settings
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher = checked first
  cooldown_minutes INTEGER DEFAULT 60, -- Minimum minutes between alerts for same conversation

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 3. SMS Alert History Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sms_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.sms_conversations(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.sms_alert_rules(id) ON DELETE SET NULL,

  -- Alert Details
  alert_method TEXT NOT NULL,
  alert_recipient TEXT NOT NULL,
  alert_subject TEXT,
  alert_body TEXT,

  -- Status
  status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
  error_message TEXT,

  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SMS Quick Replies Template Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sms_quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT, -- foreclosure, loan, membership, etc.
  message_template TEXT NOT NULL,

  -- Variables that can be used: {name}, {phone}, {property_address}, etc.
  variables TEXT[],

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 5. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON public.sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.sms_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_type ON public.sms_conversations(contact_type);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON public.sms_conversations(category);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON public.sms_conversations(priority);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON public.sms_conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.sms_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_unread ON public.sms_conversations(unread_count) WHERE unread_count > 0;
CREATE INDEX IF NOT EXISTS idx_alert_history_conversation ON public.sms_alert_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_created ON public.sms_alert_history(created_at DESC);

-- =====================================================
-- 6. Triggers for Auto-Updates
-- =====================================================

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS trigger_conversation_updated_at ON public.sms_conversations;
DROP TRIGGER IF EXISTS trigger_ensure_conversation ON public.sms_message_log;
DROP FUNCTION IF EXISTS update_conversation_timestamp();
DROP FUNCTION IF EXISTS ensure_conversation_exists();

-- Update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversation_updated_at
  BEFORE UPDATE ON public.sms_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Auto-create conversation when new message arrives
CREATE OR REPLACE FUNCTION ensure_conversation_exists()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation_exists BOOLEAN;
BEGIN
  -- Check if conversation exists
  SELECT EXISTS(
    SELECT 1 FROM public.sms_conversations
    WHERE phone_number = NEW.phone_number
  ) INTO v_conversation_exists;

  -- Create conversation if doesn't exist
  IF NOT v_conversation_exists THEN
    INSERT INTO public.sms_conversations (phone_number, status)
    VALUES (NEW.phone_number, 'new')
    ON CONFLICT (phone_number) DO NOTHING;
  END IF;

  -- Update conversation stats
  UPDATE public.sms_conversations
  SET
    message_count = message_count + 1,
    unread_count = CASE
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END,
    last_message_at = NEW.created_at,
    last_message_direction = NEW.direction,
    last_message_preview = LEFT(NEW.message_body, 100),
    updated_at = NOW()
  WHERE phone_number = NEW.phone_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_conversation
  AFTER INSERT ON public.sms_message_log
  FOR EACH ROW
  EXECUTE FUNCTION ensure_conversation_exists();

-- =====================================================
-- 7. Row Level Security Policies
-- =====================================================
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_quick_replies ENABLE ROW LEVEL SECURITY;

-- Admins can see everything
CREATE POLICY "Admins full access to conversations"
  ON public.sms_conversations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Admins full access to alert rules"
  ON public.sms_alert_rules FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Admins full access to alert history"
  ON public.sms_alert_history FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Admins full access to quick replies"
  ON public.sms_quick_replies FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Service role full access (for Edge Functions)
CREATE POLICY "Service role full access to conversations"
  ON public.sms_conversations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to alert rules"
  ON public.sms_alert_rules FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to alert history"
  ON public.sms_alert_history FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- 8. Helper Functions
-- =====================================================

-- Drop existing functions if they exist (to allow return type changes)
DROP FUNCTION IF EXISTS get_conversation_summary(TEXT);
DROP FUNCTION IF EXISTS mark_conversation_read(UUID);

-- Function to get conversation with message count
CREATE OR REPLACE FUNCTION get_conversation_summary(p_phone_number TEXT)
RETURNS TABLE (
  conversation_id UUID,
  phone_number TEXT,
  contact_name TEXT,
  contact_type TEXT,
  status TEXT,
  priority TEXT,
  category TEXT,
  message_count INTEGER,
  unread_count INTEGER,
  last_message TEXT,
  last_message_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.phone_number,
    c.contact_name,
    c.contact_type,
    c.status,
    c.priority,
    c.category,
    c.message_count,
    c.unread_count,
    c.last_message_preview,
    c.last_message_at
  FROM public.sms_conversations c
  WHERE c.phone_number = p_phone_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sms_conversations
  SET unread_count = 0, updated_at = NOW()
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. Insert Default Alert Rules
-- =====================================================
INSERT INTO public.sms_alert_rules (
  rule_name,
  description,
  trigger_on,
  contact_types,
  alert_method,
  alert_recipients,
  alert_subject,
  alert_template,
  priority
) VALUES
  (
    'New Foreclosure Prospect',
    'Alert when someone texts about foreclosure help',
    ARRAY['new_prospect', 'foreclosure_keyword'],
    ARRAY['prospect'],
    ARRAY['email', 'sms'],
    ARRAY['admin@repmotivatedseller.shoprealestatespace.org', '+18778064677'],
    'New Foreclosure Lead: {phone_number}',
    'New foreclosure assistance inquiry from {phone_number}. Message: "{message}". Contact urgently.',
    100
  ),
  (
    'New Real Estate Professional',
    'Alert when a realtor/broker reaches out',
    ARRAY['new_client'],
    ARRAY['real_estate_professional'],
    ARRAY['email'],
    ARRAY['admin@repmotivatedseller.shoprealestatespace.org'],
    'New Real Estate Professional Contact: {phone_number}',
    'New real estate professional inquiry from {phone_number}. Message: "{message}"',
    90
  ),
  (
    'New Investor Inquiry',
    'Alert when an investor reaches out for funding',
    ARRAY['new_client', 'loan_keyword'],
    ARRAY['investor'],
    ARRAY['email'],
    ARRAY['admin@repmotivatedseller.shoprealestatespace.org'],
    'New Investor Loan Inquiry: {phone_number}',
    'New investor funding inquiry from {phone_number}. Message: "{message}"',
    85
  ),
  (
    'Membership Help Request',
    'Alert when user needs membership tier assistance',
    ARRAY['membership_keyword'],
    ARRAY['client'],
    ARRAY['email'],
    ARRAY['admin@repmotivatedseller.shoprealestatespace.org'],
    'Membership Help Request: {phone_number}',
    'User {phone_number} needs membership assistance. Message: "{message}"',
    70
  ),
  (
    'Urgent Keywords Detected',
    'Alert on urgent/emergency keywords',
    ARRAY['urgent_keyword'],
    ARRAY['prospect', 'client'],
    ARRAY['email', 'sms'],
    ARRAY['admin@repmotivatedseller.shoprealestatespace.org', '+18778064677'],
    'URGENT: {phone_number}',
    'Urgent message detected from {phone_number}: "{message}". Immediate response needed!',
    150
  )
ON CONFLICT (rule_name) DO NOTHING;

-- =====================================================
-- 10. Insert Default Quick Replies
-- =====================================================
INSERT INTO public.sms_quick_replies (title, category, message_template, variables, sort_order) VALUES
  (
    'Foreclosure Help - Initial Response',
    'foreclosure',
    'Thank you for contacting RepMotivatedSeller. We understand foreclosure is stressful. A specialist will call you within 24 hours at {phone}. For immediate help, call (877) 806-4677.',
    ARRAY['phone'],
    1
  ),
  (
    'Loan Application - Next Steps',
    'loan',
    'Thank you for your interest in private funding! Please complete our pre-loan application at repmotivatedseller.com/loan-application. We''ll review within 24-48 hours. Questions? Call (877) 806-4677.',
    ARRAY[]::TEXT[],
    2
  ),
  (
    'Real Estate Professional - Welcome',
    'professional',
    'Welcome! We partner with real estate professionals to provide private funding solutions. Visit repmotivatedseller.com/what-we-do to learn more. Let''s schedule a call: (877) 806-4677.',
    ARRAY[]::TEXT[],
    3
  ),
  (
    'Membership Help',
    'membership',
    'We''re here to help with your membership! Please call (877) 806-4677 or email admin@repmotivatedseller.shoprealestatespace.org with your question.',
    ARRAY[]::TEXT[],
    4
  ),
  (
    'Business Hours',
    'general',
    'RepMotivatedSeller hours: Mon-Fri 9AM-6PM EST. Emergency foreclosure help available 24/7 at (877) 806-4677. Visit repmotivatedseller.com for more info.',
    ARRAY[]::TEXT[],
    5
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE public.sms_conversations IS 'SMS conversation threading and management';
COMMENT ON TABLE public.sms_alert_rules IS 'Configurable alert rules for SMS monitoring';
COMMENT ON TABLE public.sms_alert_history IS 'History of all alerts sent';
COMMENT ON TABLE public.sms_quick_replies IS 'Quick reply templates for common scenarios';

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'SMS Monitoring System created successfully';
  RAISE NOTICE 'Created tables: conversations, alert_rules, alert_history, quick_replies';
  RAISE NOTICE 'Configured default alert rules for: foreclosure prospects, professionals, investors';
  RAISE NOTICE 'Ready for admin dashboard integration';
END $$;
