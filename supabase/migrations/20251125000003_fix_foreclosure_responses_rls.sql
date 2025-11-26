-- Fix foreclosure_responses RLS policies to allow anonymous form submissions

-- Drop restrictive policies that block anonymous submissions
DROP POLICY IF EXISTS "Admins can insert responses" ON public.foreclosure_responses;
DROP POLICY IF EXISTS "Authenticated users can view responses" ON public.foreclosure_responses;
DROP POLICY IF EXISTS "Admins can update responses" ON public.foreclosure_responses;
DROP POLICY IF EXISTS "Admins can delete responses" ON public.foreclosure_responses;

-- Create new policies that allow anonymous form submissions

-- Policy 1: Anyone (including anonymous) can submit the form
CREATE POLICY "foreclosure_responses_insert_anon"
  ON public.foreclosure_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Authenticated users can view their own submissions (if user_id matches)
CREATE POLICY "foreclosure_responses_select_own"
  ON public.foreclosure_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 3: Admins can view all submissions (using security definer function)
CREATE POLICY "foreclosure_responses_select_admin"
  ON public.foreclosure_responses
  FOR SELECT
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE);

-- Policy 4: Admins can update submissions
CREATE POLICY "foreclosure_responses_update_admin"
  ON public.foreclosure_responses
  FOR UPDATE
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE)
  WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Policy 5: Admins can delete submissions
CREATE POLICY "foreclosure_responses_delete_admin"
  ON public.foreclosure_responses
  FOR DELETE
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE);

-- Policy 6: Service role has full access
CREATE POLICY "foreclosure_responses_service_role"
  ON public.foreclosure_responses
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Ensure permissions are granted
GRANT SELECT, INSERT ON public.foreclosure_responses TO anon;
GRANT ALL ON public.foreclosure_responses TO authenticated;
GRANT ALL ON public.foreclosure_responses TO service_role;

COMMENT ON TABLE public.foreclosure_responses IS 'Stores foreclosure assistance form submissions. Anonymous submissions allowed for public form.';
