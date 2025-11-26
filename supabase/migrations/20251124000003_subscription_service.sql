-- Subscription Service Database Schema
-- Create professional_members and api_usage tables with proper indexes and RLS

-- Create professional_members table
CREATE TABLE IF NOT EXISTS professional_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'professional', 'enterprise')),
  api_credits INTEGER DEFAULT 10,
  expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_professional_members_user_id ON professional_members(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_members_tier ON professional_members(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_professional_members_expires ON professional_members(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON api_usage(api_name);

-- Enable Row Level Security
ALTER TABLE professional_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription" ON professional_members;
DROP POLICY IF EXISTS "Users can update own subscription" ON professional_members;
DROP POLICY IF EXISTS "Users can insert own subscription" ON professional_members;
DROP POLICY IF EXISTS "Users can view own API usage" ON api_usage;
DROP POLICY IF EXISTS "Users can insert own API usage" ON api_usage;
DROP POLICY IF EXISTS "Service role full access to subscriptions" ON professional_members;
DROP POLICY IF EXISTS "Service role full access to api usage" ON api_usage;

-- Create RLS policies for professional_members
CREATE POLICY "Users can view own subscription" ON professional_members
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON professional_members
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON professional_members
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to subscriptions" ON professional_members
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for api_usage
CREATE POLICY "Users can view own API usage" ON api_usage
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API usage" ON api_usage
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to api usage" ON api_usage
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_professional_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS professional_members_updated_at ON professional_members;
CREATE TRIGGER professional_members_updated_at
  BEFORE UPDATE ON professional_members
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_members_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON professional_members TO authenticated;
GRANT SELECT, INSERT ON api_usage TO authenticated;
GRANT ALL ON professional_members TO service_role;
GRANT ALL ON api_usage TO service_role;

COMMENT ON TABLE professional_members IS 'Stores user subscription information and API credits';
COMMENT ON TABLE api_usage IS 'Tracks API usage and credit consumption per user';
