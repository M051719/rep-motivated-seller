-- Voicemail System for AI Voice Handler
-- Enhancement #3: Voicemail Recording and Transcription
-- Allows callers to leave voicemail messages

-- ============================================
-- 1. VOICEMAIL TABLE
-- ============================================
DROP TABLE IF EXISTS public.voicemails CASCADE;

CREATE TABLE public.voicemails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Call association
  call_sid TEXT NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,

  -- Recording details
  recording_sid TEXT UNIQUE,
  recording_url TEXT,
  recording_duration INTEGER, -- seconds
  recording_status TEXT DEFAULT 'pending', -- pending, completed, failed, deleted

  -- Transcription
  transcription_sid TEXT,
  transcription_text TEXT,
  transcription_status TEXT DEFAULT 'pending', -- pending, completed, failed, unavailable
  transcription_confidence NUMERIC(3,2), -- 0.00 to 1.00

  -- Caller info
  caller_name TEXT,
  caller_city TEXT,
  caller_state TEXT,
  caller_country TEXT DEFAULT 'US',

  -- Message categorization
  message_type TEXT, -- general, urgent, callback_request, property_inquiry
  urgency_level TEXT DEFAULT 'normal', -- low, normal, high, urgent
  detected_keywords TEXT[], -- Array of keywords found in transcription

  -- Follow-up tracking
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  responded BOOLEAN DEFAULT FALSE,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  response_notes TEXT,

  -- Notification tracking
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key to call log
  CONSTRAINT fk_call_log
    FOREIGN KEY (call_sid)
    REFERENCES public.call_log(call_sid)
    ON DELETE CASCADE
);

-- Indexes for voicemails
CREATE INDEX idx_voicemails_call_sid ON public.voicemails(call_sid);
CREATE INDEX idx_voicemails_from_number ON public.voicemails(from_number);
CREATE INDEX idx_voicemails_created_at ON public.voicemails(created_at DESC);
CREATE INDEX idx_voicemails_reviewed ON public.voicemails(reviewed) WHERE reviewed = FALSE;
CREATE INDEX idx_voicemails_responded ON public.voicemails(responded) WHERE responded = FALSE;
CREATE INDEX idx_voicemails_urgent ON public.voicemails(urgency_level) WHERE urgency_level IN ('high', 'urgent');
CREATE INDEX idx_voicemails_recording_sid ON public.voicemails(recording_sid);

-- GIN index for keyword search
CREATE INDEX idx_voicemails_keywords ON public.voicemails USING GIN(detected_keywords);

-- Full-text search index on transcription
CREATE INDEX idx_voicemails_transcription_fts ON public.voicemails
  USING GIN(to_tsvector('english', COALESCE(transcription_text, '')));

-- ============================================
-- 2. VOICEMAIL NOTIFICATIONS TABLE
-- ============================================
DROP TABLE IF EXISTS public.voicemail_notifications CASCADE;

CREATE TABLE public.voicemail_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  voicemail_id UUID NOT NULL REFERENCES public.voicemails(id) ON DELETE CASCADE,

  -- Notification details
  notification_type TEXT NOT NULL, -- email, sms, dashboard
  recipient TEXT NOT NULL, -- email address or phone number
  status TEXT DEFAULT 'pending', -- pending, sent, failed

  -- Notification content
  subject TEXT,
  message TEXT,

  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voicemail_notifications_voicemail_id ON public.voicemail_notifications(voicemail_id);
CREATE INDEX idx_voicemail_notifications_status ON public.voicemail_notifications(status);
CREATE INDEX idx_voicemail_notifications_created_at ON public.voicemail_notifications(created_at DESC);

-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.voicemails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voicemail_notifications ENABLE ROW LEVEL SECURITY;

-- Admin read/update access to voicemails
DROP POLICY IF EXISTS "Admins can manage voicemails" ON public.voicemails;
CREATE POLICY "Admins can manage voicemails"
  ON public.voicemails FOR ALL TO authenticated
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

-- Service role full access
DROP POLICY IF EXISTS "Service role full access to voicemails" ON public.voicemails;
CREATE POLICY "Service role full access to voicemails"
  ON public.voicemails FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin access to notifications
DROP POLICY IF EXISTS "Admins can view voicemail notifications" ON public.voicemail_notifications;
CREATE POLICY "Admins can view voicemail notifications"
  ON public.voicemail_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Service role full access to notifications
DROP POLICY IF EXISTS "Service role full access to voicemail_notifications" ON public.voicemail_notifications;
CREATE POLICY "Service role full access to voicemail_notifications"
  ON public.voicemail_notifications FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to detect urgency from transcription
CREATE OR REPLACE FUNCTION detect_voicemail_urgency(transcription TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  urgent_keywords TEXT[] := ARRAY['urgent', 'emergency', 'foreclosure', 'eviction', 'immediately', 'asap', 'help'];
  high_keywords TEXT[] := ARRAY['soon', 'today', 'quickly', 'important', 'need'];
  keyword TEXT;
  lower_transcription TEXT;
BEGIN
  IF transcription IS NULL OR transcription = '' THEN
    RETURN 'normal';
  END IF;

  lower_transcription := LOWER(transcription);

  -- Check for urgent keywords
  FOREACH keyword IN ARRAY urgent_keywords LOOP
    IF lower_transcription LIKE '%' || keyword || '%' THEN
      RETURN 'urgent';
    END IF;
  END LOOP;

  -- Check for high priority keywords
  FOREACH keyword IN ARRAY high_keywords LOOP
    IF lower_transcription LIKE '%' || keyword || '%' THEN
      RETURN 'high';
    END IF;
  END LOOP;

  RETURN 'normal';
END;
$$;

-- Function to extract keywords from transcription
CREATE OR REPLACE FUNCTION extract_voicemail_keywords(transcription TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  important_keywords TEXT[] := ARRAY[
    'foreclosure', 'eviction', 'mortgage', 'payment', 'bank',
    'lender', 'attorney', 'lawyer', 'court', 'deadline',
    'property', 'home', 'house', 'sale', 'auction',
    'help', 'assistance', 'consultation', 'advice'
  ];
  found_keywords TEXT[] := ARRAY[]::TEXT[];
  keyword TEXT;
  lower_transcription TEXT;
BEGIN
  IF transcription IS NULL OR transcription = '' THEN
    RETURN found_keywords;
  END IF;

  lower_transcription := LOWER(transcription);

  -- Find all matching keywords
  FOREACH keyword IN ARRAY important_keywords LOOP
    IF lower_transcription LIKE '%' || keyword || '%' THEN
      found_keywords := array_append(found_keywords, keyword);
    END IF;
  END LOOP;

  RETURN found_keywords;
END;
$$;

-- Trigger function to auto-analyze voicemail when transcription is added
CREATE OR REPLACE FUNCTION analyze_voicemail_transcription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.transcription_text IS NOT NULL AND NEW.transcription_text != '' THEN
    -- Auto-detect urgency
    NEW.urgency_level := detect_voicemail_urgency(NEW.transcription_text);

    -- Extract keywords
    NEW.detected_keywords := extract_voicemail_keywords(NEW.transcription_text);

    -- Auto-categorize message type
    IF NEW.transcription_text ~* 'property|house|home|real estate' THEN
      NEW.message_type := 'property_inquiry';
    ELSIF NEW.transcription_text ~* 'call back|return.*call|contact me' THEN
      NEW.message_type := 'callback_request';
    ELSIF NEW.urgency_level IN ('urgent', 'high') THEN
      NEW.message_type := 'urgent';
    ELSE
      NEW.message_type := 'general';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Trigger to analyze transcription
DROP TRIGGER IF EXISTS trg_analyze_voicemail ON public.voicemails;
CREATE TRIGGER trg_analyze_voicemail
  BEFORE INSERT OR UPDATE OF transcription_text ON public.voicemails
  FOR EACH ROW
  WHEN (NEW.transcription_text IS NOT NULL)
  EXECUTE FUNCTION analyze_voicemail_transcription();

-- ============================================
-- 5. DASHBOARD VIEWS
-- ============================================

-- View for pending voicemails (not reviewed)
CREATE OR REPLACE VIEW v_pending_voicemails AS
SELECT
  v.id,
  v.call_sid,
  v.from_number,
  v.recording_url,
  v.recording_duration,
  v.transcription_text,
  v.urgency_level,
  v.message_type,
  v.detected_keywords,
  v.caller_city,
  v.caller_state,
  v.created_at,
  cl.caller_city as call_log_city,
  cl.caller_state as call_log_state
FROM public.voicemails v
LEFT JOIN public.call_log cl ON v.call_sid = cl.call_sid
WHERE v.reviewed = FALSE
ORDER BY
  CASE v.urgency_level
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    ELSE 4
  END,
  v.created_at DESC;

-- View for voicemail analytics
CREATE OR REPLACE VIEW v_voicemail_analytics AS
SELECT
  DATE(created_at) as voicemail_date,
  COUNT(*) as total_voicemails,
  COUNT(*) FILTER (WHERE reviewed = TRUE) as reviewed_count,
  COUNT(*) FILTER (WHERE responded = TRUE) as responded_count,
  COUNT(*) FILTER (WHERE urgency_level = 'urgent') as urgent_count,
  COUNT(*) FILTER (WHERE urgency_level = 'high') as high_priority_count,
  AVG(recording_duration) as avg_duration,
  COUNT(DISTINCT from_number) as unique_callers
FROM public.voicemails
GROUP BY DATE(created_at)
ORDER BY voicemail_date DESC;

-- View for urgent voicemails
CREATE OR REPLACE VIEW v_urgent_voicemails AS
SELECT
  v.id,
  v.from_number,
  v.transcription_text,
  v.detected_keywords,
  v.urgency_level,
  v.created_at,
  (NOW() - v.created_at) as age,
  v.reviewed,
  v.responded
FROM public.voicemails v
WHERE v.urgency_level IN ('urgent', 'high')
  AND v.reviewed = FALSE
ORDER BY
  CASE v.urgency_level
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
  END,
  v.created_at ASC;

-- Grant access to views
GRANT SELECT ON v_pending_voicemails TO authenticated;
GRANT SELECT ON v_voicemail_analytics TO authenticated;
GRANT SELECT ON v_urgent_voicemails TO authenticated;

-- ============================================
-- 6. COMMENTS
-- ============================================

COMMENT ON TABLE public.voicemails IS 'Stores voicemail recordings and transcriptions';
COMMENT ON TABLE public.voicemail_notifications IS 'Tracks notifications sent for voicemails';
COMMENT ON COLUMN public.voicemails.urgency_level IS 'Auto-detected urgency based on transcription content';
COMMENT ON COLUMN public.voicemails.detected_keywords IS 'Array of important keywords found in transcription';
COMMENT ON FUNCTION detect_voicemail_urgency IS 'Analyzes transcription to determine urgency level';
COMMENT ON FUNCTION extract_voicemail_keywords IS 'Extracts important keywords from voicemail transcription';
COMMENT ON VIEW v_pending_voicemails IS 'Shows unreviewed voicemails sorted by urgency';
COMMENT ON VIEW v_urgent_voicemails IS 'Shows urgent/high priority voicemails needing immediate attention';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Voicemail System tables created successfully!';
  RAISE NOTICE 'Tables: voicemails, voicemail_notifications';
  RAISE NOTICE 'Views: v_pending_voicemails, v_voicemail_analytics, v_urgent_voicemails';
  RAISE NOTICE 'Functions: detect_voicemail_urgency, extract_voicemail_keywords';
END $$;
