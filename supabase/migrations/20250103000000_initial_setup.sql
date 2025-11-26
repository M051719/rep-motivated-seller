-- Initial setup for RepMotivatedSeller
-- This creates the basic schema we need

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom schema for API (following security best practices)
CREATE SCHEMA IF NOT EXISTS api;

-- Grant permissions to roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;

-- Create core tables in the API schema (not public for security)
CREATE TABLE IF NOT EXISTS api.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.consultation_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('basic', 'premium', 'enterprise')),
  invitee_name TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_address TEXT,
  lead_source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE api.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Payments policies
CREATE POLICY "Users can view their own payments" 
ON api.payments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" 
ON api.payments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Consultation bookings policies
CREATE POLICY "Users can manage their own consultations" 
ON api.consultation_bookings FOR ALL 
USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can manage their own leads" 
ON api.leads FOR ALL 
USING (auth.uid() = user_id);

-- Grant table permissions
GRANT SELECT ON api.payments TO authenticated;
GRANT INSERT ON api.payments TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.consultation_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.leads TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON api.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON api.payments(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON api.consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON api.consultation_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON api.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON api.leads(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON api.payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON api.consultation_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON api.leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();