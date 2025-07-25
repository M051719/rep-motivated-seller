-- Create foreclosure_responses table
CREATE TABLE IF NOT EXISTS foreclosure_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Situation Assessment
  property_address TEXT,
  property_value NUMERIC,
  mortgage_balance NUMERIC,
  missed_payments INTEGER,
  received_nod BOOLEAN DEFAULT FALSE,
  
  -- Problem Identification
  challenges TEXT,
  difficulties TEXT,
  
  -- Impact Analysis
  family_impact TEXT,
  financial_impact TEXT,
  
  -- Solution Planning
  preferred_solution TEXT,
  openness_to_options TEXT,
  
  -- Status Tracking
  status TEXT DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  urgency_level TEXT DEFAULT 'low',
  crm_sync_status TEXT DEFAULT 'pending',
  crm_id TEXT
);

-- Create RLS policies
ALTER TABLE foreclosure_responses ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view responses
CREATE POLICY "Authenticated users can view responses"
  ON foreclosure_responses
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users with admin role can insert/update/delete
CREATE POLICY "Admins can insert responses"
  ON foreclosure_responses
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update responses"
  ON foreclosure_responses
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete responses"
  ON foreclosure_responses
  FOR DELETE
  USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  slack_notifications BOOLEAN DEFAULT FALSE,
  follow_up_days INTEGER[] DEFAULT '{1,3,7,14}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notification settings
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own notification settings
CREATE POLICY "Users can update their own notification settings"
  ON notification_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_foreclosure_responses_updated_at
BEFORE UPDATE ON foreclosure_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON notification_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create function to calculate urgency level
CREATE OR REPLACE FUNCTION calculate_urgency_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.received_nod = TRUE OR NEW.missed_payments >= 3 THEN
    NEW.urgency_level = 'high';
  ELSIF NEW.missed_payments BETWEEN 1 AND 2 THEN
    NEW.urgency_level = 'medium';
  ELSE
    NEW.urgency_level = 'low';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate urgency level
CREATE TRIGGER calculate_foreclosure_urgency
BEFORE INSERT OR UPDATE OF received_nod, missed_payments ON foreclosure_responses
FOR EACH ROW
EXECUTE FUNCTION calculate_urgency_level();