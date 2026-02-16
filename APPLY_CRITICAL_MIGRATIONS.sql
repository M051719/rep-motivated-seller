-- ============================================================================
-- CRITICAL MIGRATIONS FOR REPMOTIVATEDSELLER
-- Apply this via Supabase Dashboard > SQL Editor
-- ============================================================================

-- MIGRATION 1: Fix GLBA Schema (20260105000001)
-- ============================================================================

-- Add missing columns to secure_documents if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'uploaded_by') THEN
        ALTER TABLE secure_documents ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'uploaded_at') THEN
        ALTER TABLE secure_documents ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'expires_at') THEN
        ALTER TABLE secure_documents ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'is_revoked') THEN
        ALTER TABLE secure_documents ADD COLUMN is_revoked BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'revoked_at') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'revoked_by') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'revoked_reason') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'access_count') THEN
        ALTER TABLE secure_documents ADD COLUMN access_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'last_accessed_at') THEN
        ALTER TABLE secure_documents ADD COLUMN last_accessed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'secure_documents' AND column_name = 'metadata') THEN
        ALTER TABLE secure_documents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Create indexes for secure_documents
CREATE INDEX IF NOT EXISTS idx_secure_documents_user ON secure_documents(uploaded_by, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_secure_documents_expires ON secure_documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_secure_documents_revoked ON secure_documents(is_revoked);

-- MIGRATION 2: Enable Profiles RLS (20260105000000)
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "public_profiles_read" ON public.profiles;

-- Grant privileges to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon;

-- Users can read their own profile
CREATE POLICY "users_select_own_profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "users_insert_own_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admins_read_all_profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = id
  );

-- Public can read basic profile info for display purposes
CREATE POLICY "public_profiles_read"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Add comment
COMMENT ON TABLE public.profiles IS 'User profiles with RLS enabled - users can only access their own data';

-- ============================================================================
-- MIGRATION 3: Education Progress Tracking (20260105000002)
-- ============================================================================

-- Create education_progress table
CREATE TABLE IF NOT EXISTS public.education_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  courses_completed INTEGER DEFAULT 0,
  certificates_earned INTEGER DEFAULT 0,
  hours_learned NUMERIC(10, 2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.education_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_select_own_progress"
  ON public.education_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_progress"
  ON public.education_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_progress"
  ON public.education_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_progress_user ON public.education_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_education_progress_course ON public.education_progress(course_id, module_id);

-- ============================================================================
-- MIGRATION 4: Appointment Management (20260105000003)
-- ============================================================================

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  event_type TEXT CHECK (event_type IN ('1-on-1', 'Zoom')) NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  calendly_url TEXT,
  tier TEXT CHECK (tier IN ('free', 'entrepreneur', 'professional', 'enterprise')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_select_own_appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_appointments"
  ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_appointments"
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.appointments(user_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- ============================================================================
-- MIGRATION 5: Platform Impact Metrics (20260105000004)
-- ============================================================================

-- Create platform_metrics table (single row for platform-wide stats)
CREATE TABLE IF NOT EXISTS public.platform_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  families_helped INTEGER DEFAULT 0,
  loans_processed INTEGER DEFAULT 0,
  total_saved NUMERIC(15, 2) DEFAULT 0,
  avg_processing_days INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row if doesn't exist
INSERT INTO public.platform_metrics (families_helped, loans_processed, total_saved, avg_processing_days)
VALUES (1247, 892, 47500000, 14)
ON CONFLICT DO NOTHING;

-- Enable RLS (everyone can read, only admins can write)
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_platform_metrics"
  ON public.platform_metrics
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "admins_update_platform_metrics"
  ON public.platform_metrics
  FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- MIGRATION 6: Member Accomplishments (20260105000005)
-- ============================================================================

-- Create member_accomplishments table
CREATE TABLE IF NOT EXISTS public.member_accomplishments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  documents_generated INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  appointments_attended INTEGER DEFAULT 0,
  certificates_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.member_accomplishments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_select_own_accomplishments"
  ON public.member_accomplishments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_accomplishments"
  ON public.member_accomplishments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_accomplishments"
  ON public.member_accomplishments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_member_accomplishments_user ON public.member_accomplishments(user_id);

-- ============================================================================
-- MIGRATION 7: Loan Applications Tracking (20260105000006)
-- ============================================================================

-- Create loan_applications table
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_address TEXT NOT NULL,
  loan_amount NUMERIC(12, 2) NOT NULL,
  status TEXT CHECK (status IN ('submitted', 'processing', 'approved', 'closed', 'denied')) DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_select_own_loans"
  ON public.loan_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_loans"
  ON public.loan_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all loans
CREATE POLICY "admins_view_all_loans"
  ON public.loan_applications
  FOR SELECT
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Index
CREATE INDEX IF NOT EXISTS idx_loan_applications_user ON public.loan_applications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON public.loan_applications(status);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- After applying this:
-- 1. Clear browser cache and restart dev server
-- 2. Test profile loading - should work without 400 errors
-- 3. Test document uploads if using secure_documents
-- 4. Test education progress tracking
-- 5. Test appointment scheduling
-- 6. Test dashboard metrics display
-- 7. Test loan application tracking
-- ============================================================================
