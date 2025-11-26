-- SMS Opt-In/Opt-Out Compliance Migration
-- TCPA (Telephone Consumer Protection Act) Compliance
-- Created: 2025-11-18

-- =====================================================
-- 0. Drop Existing Tables (if any) to Ensure Clean Schema
-- =====================================================
-- This ensures no column conflicts with any previous partial migrations
DROP TABLE IF EXISTS public.sms_consent_audit CASCADE;
DROP TABLE IF EXISTS public.sms_message_log CASCADE;
DROP TABLE IF EXISTS public.sms_keywords CASCADE;
DROP TABLE IF EXISTS public.sms_consent CASCADE;

-- =====================================================
-- 1. SMS Consent Tracking Table
-- =====================================================
CREATE TABLE public.sms_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  consent_status TEXT NOT NULL CHECK (consent_status IN ('opted_in', 'opted_out', 'pending')),
  consent_date TIMESTAMPTZ,
  opt_out_date TIMESTAMPTZ,
  consent_method TEXT CHECK (consent_method IN ('web_form', 'sms_reply', 'voice_call', 'manual', 'api')),
  opt_out_method TEXT CHECK (opt_out_method IN ('sms_reply', 'web_request', 'voice_call', 'manual', 'api')),

  -- Marketing preferences
  marketing_consent BOOLEAN DEFAULT false,
  transactional_consent BOOLEAN DEFAULT true, -- For appointment reminders, confirmations

  -- Metadata
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_ip_address INET,
  consent_user_agent TEXT,
  opt_out_reason TEXT,
  notes TEXT,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Ensure one record per phone number
  CONSTRAINT unique_phone_number UNIQUE (phone_number)
);

-- =====================================================
-- 2. SMS Message Log Table
-- =====================================================
CREATE TABLE public.sms_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  message_sid TEXT, -- Twilio Message SID
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_body TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('marketing', 'transactional', 'opt_in_confirmation', 'opt_out_confirmation')),

  -- Status tracking
  status TEXT CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'received', 'blocked_no_consent')),
  error_code TEXT,
  error_message TEXT,

  -- Consent verification
  consent_verified BOOLEAN DEFAULT false,
  consent_status_at_send TEXT,

  -- Relationships
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_submission_id UUID,

  -- Metadata
  twilio_account_sid TEXT,
  twilio_from_number TEXT,
  twilio_to_number TEXT,
  num_segments INTEGER,
  price DECIMAL(10, 4),
  price_unit TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Index for phone number lookups
  FOREIGN KEY (phone_number) REFERENCES public.sms_consent(phone_number) ON DELETE CASCADE
);

-- =====================================================
-- 3. SMS Opt-In/Opt-Out Audit Log
-- =====================================================
CREATE TABLE public.sms_consent_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('opt_in', 'opt_out', 'status_change', 'consent_update')),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  method TEXT,

  -- Context
  triggered_by TEXT, -- 'user', 'admin', 'system', 'sms_keyword'
  keyword_received TEXT, -- 'START', 'STOP', 'UNSTOP', etc.
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  user_id UUID REFERENCES auth.users(id),
  admin_id UUID REFERENCES auth.users(id),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SMS Keywords Configuration
-- =====================================================
CREATE TABLE public.sms_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL CHECK (action IN ('opt_in', 'opt_out', 'help', 'info', 'custom')),
  response_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority keywords checked first

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sms_consent_phone ON public.sms_consent(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_consent_status ON public.sms_consent(consent_status);
CREATE INDEX IF NOT EXISTS idx_sms_consent_user_id ON public.sms_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_message_log_phone ON public.sms_message_log(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_message_log_created ON public.sms_message_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_message_log_status ON public.sms_message_log(status);
CREATE INDEX IF NOT EXISTS idx_sms_consent_audit_phone ON public.sms_consent_audit(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_consent_audit_created ON public.sms_consent_audit(created_at DESC);

-- Index for admin policy checks (improves RLS performance)
CREATE INDEX IF NOT EXISTS idx_profiles_id_is_admin ON public.profiles(id, is_admin) WHERE is_admin = true;

-- =====================================================
-- 6. Automatic Updated_At Trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_sms_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sms_consent_updated_at
  BEFORE UPDATE ON public.sms_consent
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_consent_updated_at();

-- =====================================================
-- 7. Row Level Security Policies
-- =====================================================
ALTER TABLE public.sms_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_consent_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_keywords ENABLE ROW LEVEL SECURITY;

-- Users can view their own SMS consent
CREATE POLICY "Users can view own SMS consent"
  ON public.sms_consent FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own SMS consent
CREATE POLICY "Users can update own SMS consent"
  ON public.sms_consent FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role full access to sms_consent"
  ON public.sms_consent FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to sms_message_log"
  ON public.sms_message_log FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to sms_consent_audit"
  ON public.sms_consent_audit FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Public can read SMS keywords (for help responses)
CREATE POLICY "Anyone can read SMS keywords"
  ON public.sms_keywords FOR SELECT
  USING (is_active = true);

-- Admin full access (with explicit DROP and WITH CHECK)
DROP POLICY IF EXISTS "Admins full access to sms_keywords" ON public.sms_keywords;
CREATE POLICY "Admins full access to sms_keywords"
  ON public.sms_keywords FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- =====================================================
-- 8. Insert Default SMS Keywords (TCPA Required)
-- =====================================================
INSERT INTO public.sms_keywords (keyword, action, response_message, priority) VALUES
  ('START', 'opt_in', 'You are now subscribed to RepMotivatedSeller SMS alerts. Reply STOP to unsubscribe, HELP for help. Msg&data rates may apply.', 100),
  ('YES', 'opt_in', 'You are now subscribed to RepMotivatedSeller SMS alerts. Reply STOP to unsubscribe, HELP for help. Msg&data rates may apply.', 100),
  ('UNSTOP', 'opt_in', 'You have been re-subscribed to RepMotivatedSeller SMS alerts. Reply STOP to unsubscribe, HELP for help. Msg&data rates may apply.', 100),

  ('STOP', 'opt_out', 'You have been unsubscribed from RepMotivatedSeller SMS alerts. You will not receive further messages. Reply START to resubscribe.', 100),
  ('STOPALL', 'opt_out', 'You have been unsubscribed from all RepMotivatedSeller SMS alerts. Reply START to resubscribe.', 100),
  ('UNSUBSCRIBE', 'opt_out', 'You have been unsubscribed from RepMotivatedSeller SMS alerts. Reply START to resubscribe.', 100),
  ('CANCEL', 'opt_out', 'You have been unsubscribed from RepMotivatedSeller SMS alerts. Reply START to resubscribe.', 100),
  ('END', 'opt_out', 'You have been unsubscribed from RepMotivatedSeller SMS alerts. Reply START to resubscribe.', 100),
  ('QUIT', 'opt_out', 'You have been unsubscribed from RepMotivatedSeller SMS alerts. Reply START to resubscribe.', 100),

  ('HELP', 'help', 'RepMotivatedSeller: Foreclosure assistance & real estate services. For support, call 1-800-XXX-XXXX or visit repmotivatedseller.com. Msg&data rates may apply. Reply STOP to unsubscribe.', 90),
  ('INFO', 'info', 'RepMotivatedSeller provides foreclosure assistance and real estate investment services. Visit repmotivatedseller.com for more info. Reply STOP to opt-out.', 90)
ON CONFLICT (keyword) DO NOTHING;

-- =====================================================
-- 9. Helper Functions
-- =====================================================

-- Drop existing functions if any
DROP FUNCTION IF EXISTS public.has_sms_consent(TEXT);
DROP FUNCTION IF EXISTS public.record_sms_opt_in(TEXT, TEXT, UUID, INET, TEXT);
DROP FUNCTION IF EXISTS public.record_sms_opt_out(TEXT, TEXT, TEXT);

-- Function to check if phone number has consent
CREATE OR REPLACE FUNCTION public.has_sms_consent(p_phone_number TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_consent_status TEXT;
BEGIN
  SELECT consent_status INTO v_consent_status
  FROM public.sms_consent
  WHERE phone_number = p_phone_number;

  RETURN v_consent_status = 'opted_in';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record opt-in
CREATE OR REPLACE FUNCTION public.record_sms_opt_in(
  p_phone_number TEXT,
  p_method TEXT DEFAULT 'sms_reply',
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  INSERT INTO public.sms_consent (
    phone_number,
    consent_status,
    consent_date,
    consent_method,
    marketing_consent,
    transactional_consent,
    user_id,
    consent_ip_address,
    consent_user_agent
  ) VALUES (
    p_phone_number,
    'opted_in',
    NOW(),
    p_method,
    true,
    true,
    p_user_id,
    p_ip_address,
    p_user_agent
  )
  ON CONFLICT (phone_number) DO UPDATE SET
    consent_status = 'opted_in',
    consent_date = NOW(),
    consent_method = p_method,
    marketing_consent = true,
    opt_out_date = NULL,
    opt_out_method = NULL,
    updated_at = NOW()
  RETURNING id INTO v_consent_id;

  -- Log the action
  INSERT INTO public.sms_consent_audit (phone_number, action, new_status, method, triggered_by)
  VALUES (p_phone_number, 'opt_in', 'opted_in', p_method, 'user');

  RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record opt-out
CREATE OR REPLACE FUNCTION public.record_sms_opt_out(
  p_phone_number TEXT,
  p_method TEXT DEFAULT 'sms_reply',
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_consent_id UUID;
  v_previous_status TEXT;
BEGIN
  -- Get previous status
  SELECT consent_status INTO v_previous_status
  FROM public.sms_consent
  WHERE phone_number = p_phone_number;

  INSERT INTO public.sms_consent (
    phone_number,
    consent_status,
    opt_out_date,
    opt_out_method,
    opt_out_reason,
    marketing_consent,
    transactional_consent
  ) VALUES (
    p_phone_number,
    'opted_out',
    NOW(),
    p_method,
    p_reason,
    false,
    false
  )
  ON CONFLICT (phone_number) DO UPDATE SET
    consent_status = 'opted_out',
    opt_out_date = NOW(),
    opt_out_method = p_method,
    opt_out_reason = p_reason,
    marketing_consent = false,
    updated_at = NOW()
  RETURNING id INTO v_consent_id;

  -- Log the action
  INSERT INTO public.sms_consent_audit (
    phone_number,
    action,
    previous_status,
    new_status,
    method,
    triggered_by
  ) VALUES (
    p_phone_number,
    'opt_out',
    v_previous_status,
    'opted_out',
    p_method,
    'user'
  );

  RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. Compliance Comments
-- =====================================================
COMMENT ON TABLE public.sms_consent IS 'TCPA compliance: Tracks SMS opt-in/opt-out consent';
COMMENT ON TABLE public.sms_message_log IS 'Complete audit trail of all SMS messages sent/received';
COMMENT ON TABLE public.sms_consent_audit IS 'Immutable audit log of all consent changes';
COMMENT ON TABLE public.sms_keywords IS 'TCPA-required keywords: STOP, START, HELP, INFO, etc.';

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'SMS Opt-In/Opt-Out compliance schema created successfully';
  RAISE NOTICE 'TCPA compliance: STOP, START, HELP keywords configured';
  RAISE NOTICE 'Ready for Twilio integration';
END $$;
