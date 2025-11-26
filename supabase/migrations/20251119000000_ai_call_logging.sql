-- AI Call Logging Database
-- Enhancement #2: Call Logging for AI Voice System
-- Tracks all inbound/outbound calls and conversation history

-- ============================================
-- 1. CALL LOG TABLE
-- ============================================
-- Stores metadata for every call
DROP TABLE IF EXISTS public.call_log CASCADE;

CREATE TABLE public.call_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Call identification
  call_sid TEXT UNIQUE NOT NULL,
  parent_call_sid TEXT, -- For transferred calls

  -- Call details
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  call_status TEXT NOT NULL DEFAULT 'ringing',

  -- AI conversation tracking
  ai_conversation BOOLEAN DEFAULT FALSE,
  conversation_turns INTEGER DEFAULT 0,
  transferred_to_human BOOLEAN DEFAULT FALSE,
  transfer_reason TEXT,

  -- Menu interaction
  menu_selection TEXT,

  -- Call duration
  call_duration INTEGER, -- seconds
  conversation_duration INTEGER, -- seconds spent in AI conversation

  -- Recording (if enabled)
  recording_url TEXT,
  recording_duration INTEGER,

  -- Metadata
  caller_city TEXT,
  caller_state TEXT,
  caller_zip TEXT,
  caller_country TEXT DEFAULT 'US',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for call_log
CREATE INDEX idx_call_log_call_sid ON public.call_log(call_sid);
CREATE INDEX idx_call_log_from_number ON public.call_log(from_number);
CREATE INDEX idx_call_log_created_at ON public.call_log(created_at DESC);
CREATE INDEX idx_call_log_ai_conversation ON public.call_log(ai_conversation) WHERE ai_conversation = TRUE;
CREATE INDEX idx_call_log_transferred ON public.call_log(transferred_to_human) WHERE transferred_to_human = TRUE;

-- ============================================
-- 2. CONVERSATION HISTORY TABLE
-- ============================================
-- Stores each turn in AI conversations
DROP TABLE IF EXISTS public.conversation_history CASCADE;

CREATE TABLE public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to call
  call_sid TEXT NOT NULL,
  turn_number INTEGER NOT NULL,

  -- Conversation content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Speech recognition (for user messages)
  speech_confidence NUMERIC(3,2), -- 0.00 to 1.00

  -- AI response metadata (for assistant messages)
  ai_model TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,

  -- Intent detection
  detected_intent TEXT,
  sentiment TEXT, -- positive, negative, neutral, distressed

  -- Handoff tracking
  handoff_triggered BOOLEAN DEFAULT FALSE,
  handoff_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Foreign key
  CONSTRAINT fk_call_log
    FOREIGN KEY (call_sid)
    REFERENCES public.call_log(call_sid)
    ON DELETE CASCADE
);

-- Indexes for conversation_history
CREATE INDEX idx_conversation_history_call_sid ON public.conversation_history(call_sid);
CREATE INDEX idx_conversation_history_turn ON public.conversation_history(call_sid, turn_number);
CREATE INDEX idx_conversation_history_created_at ON public.conversation_history(created_at DESC);
CREATE INDEX idx_conversation_history_handoff ON public.conversation_history(handoff_triggered) WHERE handoff_triggered = TRUE;

-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.call_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Admin read access to call_log
DROP POLICY IF EXISTS "Admins can read all calls" ON public.call_log;
CREATE POLICY "Admins can read all calls"
  ON public.call_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Service role full access to call_log
DROP POLICY IF EXISTS "Service role full access to call_log" ON public.call_log;
CREATE POLICY "Service role full access to call_log"
  ON public.call_log FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin read access to conversation_history
DROP POLICY IF EXISTS "Admins can read all conversations" ON public.conversation_history;
CREATE POLICY "Admins can read all conversations"
  ON public.conversation_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Service role full access to conversation_history
DROP POLICY IF EXISTS "Service role full access to conversation_history" ON public.conversation_history;
CREATE POLICY "Service role full access to conversation_history"
  ON public.conversation_history FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to get conversation summary
CREATE OR REPLACE FUNCTION get_conversation_summary(p_call_sid TEXT)
RETURNS TABLE (
  total_turns INTEGER,
  user_messages INTEGER,
  ai_responses INTEGER,
  handoff_triggered BOOLEAN,
  avg_confidence NUMERIC,
  conversation_topics TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_turns,
    COUNT(*) FILTER (WHERE role = 'user')::INTEGER as user_messages,
    COUNT(*) FILTER (WHERE role = 'assistant')::INTEGER as ai_responses,
    BOOL_OR(handoff_triggered) as handoff_triggered,
    AVG(speech_confidence) as avg_confidence,
    STRING_AGG(DISTINCT detected_intent, ', ') as conversation_topics
  FROM public.conversation_history
  WHERE call_sid = p_call_sid;
END;
$$;

-- Function to update call log after conversation
CREATE OR REPLACE FUNCTION update_call_log_from_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update call_log with conversation metadata
  UPDATE public.call_log
  SET
    conversation_turns = (
      SELECT COUNT(*)
      FROM public.conversation_history
      WHERE call_sid = NEW.call_sid AND role = 'user'
    ),
    transferred_to_human = CASE
      WHEN NEW.handoff_triggered THEN TRUE
      ELSE transferred_to_human
    END,
    transfer_reason = CASE
      WHEN NEW.handoff_triggered THEN NEW.handoff_reason
      ELSE transfer_reason
    END,
    updated_at = NOW()
  WHERE call_sid = NEW.call_sid;

  RETURN NEW;
END;
$$;

-- Trigger to auto-update call_log when conversation is added
DROP TRIGGER IF EXISTS trg_update_call_log ON public.conversation_history;
CREATE TRIGGER trg_update_call_log
  AFTER INSERT ON public.conversation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_call_log_from_conversation();

-- ============================================
-- 5. DASHBOARD VIEWS
-- ============================================

-- View for recent AI calls
CREATE OR REPLACE VIEW v_recent_ai_calls AS
SELECT
  cl.id,
  cl.call_sid,
  cl.from_number,
  cl.to_number,
  cl.call_status,
  cl.conversation_turns,
  cl.transferred_to_human,
  cl.transfer_reason,
  cl.call_duration,
  cl.conversation_duration,
  cl.caller_city,
  cl.caller_state,
  cl.created_at,
  cl.ended_at,
  (
    SELECT COUNT(*)
    FROM public.conversation_history ch
    WHERE ch.call_sid = cl.call_sid
  ) as total_messages,
  (
    SELECT content
    FROM public.conversation_history ch
    WHERE ch.call_sid = cl.call_sid AND ch.role = 'user'
    ORDER BY ch.turn_number ASC
    LIMIT 1
  ) as first_user_message
FROM public.call_log cl
WHERE cl.ai_conversation = TRUE
ORDER BY cl.created_at DESC
LIMIT 100;

-- View for call analytics
CREATE OR REPLACE VIEW v_call_analytics AS
SELECT
  DATE(created_at) as call_date,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE ai_conversation = TRUE) as ai_calls,
  COUNT(*) FILTER (WHERE transferred_to_human = TRUE) as transferred_calls,
  AVG(conversation_turns) as avg_turns,
  AVG(call_duration) as avg_duration,
  COUNT(DISTINCT from_number) as unique_callers
FROM public.call_log
GROUP BY DATE(created_at)
ORDER BY call_date DESC;

-- Grant access to views
GRANT SELECT ON v_recent_ai_calls TO authenticated;
GRANT SELECT ON v_call_analytics TO authenticated;

-- ============================================
-- 6. COMMENTS
-- ============================================

COMMENT ON TABLE public.call_log IS 'Tracks all inbound and outbound calls through Twilio';
COMMENT ON TABLE public.conversation_history IS 'Stores AI conversation turns for call analysis';
COMMENT ON COLUMN public.call_log.call_sid IS 'Twilio Call SID (unique identifier)';
COMMENT ON COLUMN public.conversation_history.speech_confidence IS 'Confidence score from Twilio speech recognition (0-1)';
COMMENT ON FUNCTION get_conversation_summary IS 'Returns summary statistics for a conversation';
COMMENT ON VIEW v_recent_ai_calls IS 'Shows recent AI-handled calls with basic metadata';
COMMENT ON VIEW v_call_analytics IS 'Daily analytics for call volume and AI performance';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'AI Call Logging tables created successfully!';
  RAISE NOTICE 'Tables: call_log, conversation_history';
  RAISE NOTICE 'Views: v_recent_ai_calls, v_call_analytics';
  RAISE NOTICE 'Functions: get_conversation_summary, update_call_log_from_conversation';
END $$;
