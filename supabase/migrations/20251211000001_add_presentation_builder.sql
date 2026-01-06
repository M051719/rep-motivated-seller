-- Add presentation builder fields to existing subscriptions table
-- Only add columns if they don't exist

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'subscriptions' 
                 AND column_name = 'presentations_used') THEN
    ALTER TABLE public.subscriptions ADD COLUMN presentations_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create presentation_exports table if not exists
CREATE TABLE IF NOT EXISTS public.presentation_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID,
  
  -- Property Data
  property_address TEXT NOT NULL,
  property_city TEXT NOT NULL,
  property_state TEXT NOT NULL,
  property_zip TEXT NOT NULL,
  property_data JSONB NOT NULL,
  
  -- Export Settings
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'pptx', 'email', 'directmail')),
  include_comparables BOOLEAN DEFAULT true,
  include_map BOOLEAN DEFAULT true,
  include_ai_content BOOLEAN DEFAULT true,
  include_calculations BOOLEAN DEFAULT true,
  
  -- Generated Content
  comparables_data JSONB,
  ai_content JSONB,
  calculator_results JSONB,
  
  -- Delivery Status
  status TEXT NOT NULL CHECK (status IN ('generating', 'completed', 'failed', 'sent')) DEFAULT 'generating',
  file_url TEXT,
  lob_letter_id TEXT,
  email_sent_at TIMESTAMPTZ,
  directmail_sent_at TIMESTAMPTZ,
  
  -- Metadata
  tier_at_creation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_presentation_exports_user_id') THEN
    CREATE INDEX idx_presentation_exports_user_id ON public.presentation_exports(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_presentation_exports_status') THEN
    CREATE INDEX idx_presentation_exports_status ON public.presentation_exports(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_presentation_exports_created_at') THEN
    CREATE INDEX idx_presentation_exports_created_at ON public.presentation_exports(created_at DESC);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.presentation_exports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own presentations" ON public.presentation_exports;
DROP POLICY IF EXISTS "Users can create own presentations" ON public.presentation_exports;
DROP POLICY IF EXISTS "Users can update own presentations" ON public.presentation_exports;

-- Create RLS Policies
CREATE POLICY "Users can view own presentations"
  ON public.presentation_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presentations"
  ON public.presentation_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations"
  ON public.presentation_exports FOR UPDATE
  USING (auth.uid() = user_id);

-- Create or replace functions
CREATE OR REPLACE FUNCTION increment_presentation_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    presentations_used = COALESCE(presentations_used, 0) + 1,
    updated_at = now()
  WHERE user_id = p_user_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_create_presentation(p_user_id UUID)
RETURNS TABLE (
  allowed BOOLEAN,
  tier TEXT,
  used INTEGER,
  monthly_limit INTEGER,
  reason TEXT
) AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  -- Get active subscription
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  LIMIT 1;

  -- No subscription = basic tier (1 free per month)
  IF v_subscription IS NULL THEN
    -- Check if user has used their free presentation this month
    DECLARE
      v_this_month_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO v_this_month_count
      FROM public.presentation_exports
      WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', now());
      
      IF v_this_month_count < 1 THEN
        RETURN QUERY SELECT 
          true,
          'basic'::TEXT,
          v_this_month_count,
          1,
          'Free basic tier'::TEXT;
      ELSE
        RETURN QUERY SELECT 
          false,
          'basic'::TEXT,
          v_this_month_count,
          1,
          'Monthly limit reached - upgrade to create more'::TEXT;
      END IF;
      RETURN;
    END;
  END IF;

  -- Check limits based on tier
  IF v_subscription.tier = 'premium' THEN
    RETURN QUERY SELECT 
      true,
      v_subscription.tier,
      COALESCE(v_subscription.presentations_used, 0),
      NULL::INTEGER, -- unlimited
      'Premium unlimited access'::TEXT;
  ELSIF v_subscription.tier = 'pro' THEN
    IF COALESCE(v_subscription.presentations_used, 0) < 50 THEN
      RETURN QUERY SELECT 
        true,
        v_subscription.tier,
        COALESCE(v_subscription.presentations_used, 0),
        50,
        'Pro tier access'::TEXT;
    ELSE
      RETURN QUERY SELECT 
        false,
        v_subscription.tier,
        COALESCE(v_subscription.presentations_used, 0),
        50,
        'Monthly limit reached - upgrade to Premium for unlimited'::TEXT;
    END IF;
  ELSE -- basic with subscription
    IF COALESCE(v_subscription.presentations_used, 0) < 1 THEN
      RETURN QUERY SELECT 
        true,
        v_subscription.tier,
        COALESCE(v_subscription.presentations_used, 0),
        1,
        'Basic tier access'::TEXT;
    ELSE
      RETURN QUERY SELECT 
        false,
        v_subscription.tier,
        COALESCE(v_subscription.presentations_used, 0),
        1,
        'Monthly limit reached - upgrade to Pro or Premium'::TEXT;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.presentation_exports TO authenticated;
GRANT EXECUTE ON FUNCTION increment_presentation_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_presentation(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE public.presentation_exports IS 'Tracks all generated property presentations';
COMMENT ON FUNCTION increment_presentation_count(UUID) IS 'Increments user presentation count';
COMMENT ON FUNCTION can_create_presentation(UUID) IS 'Checks if user can create a new presentation based on tier limits';
