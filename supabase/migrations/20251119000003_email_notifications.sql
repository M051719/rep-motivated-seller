-- Email Notifications Table
-- Tracks all email notifications sent through MailerLite

DROP TABLE IF EXISTS public.email_notifications CASCADE;

CREATE TABLE public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('new_submission', 'urgent_case', 'status_change', 'follow_up', 'test')),
  submission_id UUID, -- Reference to submission (if applicable)
  recipient_email TEXT NOT NULL,

  -- Email content
  subject TEXT NOT NULL,
  sender_email TEXT NOT NULL DEFAULT 'noreply@repmotivatedseller.com',
  sender_name TEXT NOT NULL DEFAULT 'RepMotivatedSeller',

  -- MailerLite integration
  mailerlite_subscriber_id TEXT,
  mailerlite_campaign_id TEXT,
  mailerlite_groups TEXT[], -- Array of group names subscriber was added to

  -- Status tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_notifications_type ON public.email_notifications(type);
CREATE INDEX idx_email_notifications_submission_id ON public.email_notifications(submission_id);
CREATE INDEX idx_email_notifications_recipient_email ON public.email_notifications(recipient_email);
CREATE INDEX idx_email_notifications_sent_at ON public.email_notifications(sent_at DESC);
CREATE INDEX idx_email_notifications_subscriber_id ON public.email_notifications(mailerlite_subscriber_id);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin users can view all email notifications"
  ON public.email_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

CREATE POLICY "Service role can insert email notifications"
  ON public.email_notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update email notifications"
  ON public.email_notifications
  FOR UPDATE
  TO service_role
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_email_notifications_updated_at ON public.email_notifications;
CREATE TRIGGER update_email_notifications_updated_at
  BEFORE UPDATE ON public.email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_notification_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.email_notifications IS 'Tracks all email notifications sent through MailerLite';
COMMENT ON COLUMN public.email_notifications.type IS 'Type of notification: new_submission, urgent_case, status_change, follow_up, test';
COMMENT ON COLUMN public.email_notifications.submission_id IS 'Optional reference to the foreclosure submission';
COMMENT ON COLUMN public.email_notifications.mailerlite_subscriber_id IS 'MailerLite subscriber ID for tracking';
COMMENT ON COLUMN public.email_notifications.mailerlite_campaign_id IS 'MailerLite campaign ID for the sent email';
COMMENT ON COLUMN public.email_notifications.mailerlite_groups IS 'Array of MailerLite groups the subscriber was added to';
COMMENT ON COLUMN public.email_notifications.metadata IS 'Additional metadata for the notification in JSON format';
