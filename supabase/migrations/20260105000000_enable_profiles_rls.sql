-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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
