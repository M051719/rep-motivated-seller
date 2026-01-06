-- Create direct_mail_campaigns table for tracking Lob mailings
CREATE TABLE IF NOT EXISTS public.direct_mail_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lob_letter_id TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('foreclosure_prevention', 'cash_offer', 'land_acquisition', 'loan_modification')),
  campaign_id TEXT,
  property_address TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'in_transit', 'delivered', 'returned', 'cancelled')),
  lob_tracking_url TEXT,
  expected_delivery DATE,
  actual_delivery DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS direct_mail_campaigns_lob_letter_id_idx ON public.direct_mail_campaigns(lob_letter_id);
CREATE INDEX IF NOT EXISTS direct_mail_campaigns_template_type_idx ON public.direct_mail_campaigns(template_type);
CREATE INDEX IF NOT EXISTS direct_mail_campaigns_campaign_id_idx ON public.direct_mail_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS direct_mail_campaigns_status_idx ON public.direct_mail_campaigns(status);
CREATE INDEX IF NOT EXISTS direct_mail_campaigns_created_at_idx ON public.direct_mail_campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE public.direct_mail_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage all campaigns"
  ON public.direct_mail_campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can view campaigns"
  ON public.direct_mail_campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Comments
COMMENT ON TABLE public.direct_mail_campaigns IS 'Tracks direct mail campaigns sent via Lob API for land acquisition and foreclosure prevention marketing';
COMMENT ON COLUMN public.direct_mail_campaigns.lob_letter_id IS 'Unique identifier from Lob API';
COMMENT ON COLUMN public.direct_mail_campaigns.template_type IS 'Type of letter template used';
COMMENT ON COLUMN public.direct_mail_campaigns.property_address IS 'Property address being marketed';
COMMENT ON COLUMN public.direct_mail_campaigns.status IS 'Current delivery status from Lob webhooks';

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.direct_mail_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create legal_acceptances table to track user agreement
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  acceptance_type TEXT NOT NULL DEFAULT 'terms_of_service',
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  acceptance_version TEXT NOT NULL DEFAULT '1.0',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS legal_acceptances_user_id_idx ON public.legal_acceptances(user_id);
CREATE INDEX IF NOT EXISTS legal_acceptances_acceptance_type_idx ON public.legal_acceptances(acceptance_type);

-- Enable RLS
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage all acceptances"
  ON public.legal_acceptances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own acceptances"
  ON public.legal_acceptances
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON TABLE public.legal_acceptances IS 'Tracks user acceptance of legal terms, notices, and agreements';
