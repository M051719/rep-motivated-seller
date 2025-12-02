-- Final fix for user_roles infinite recursion
-- The key insight: Don't use user_roles table in policies AT ALL
-- Instead, use the profiles.is_admin column which doesn't have recursive policies

-- Drop all existing policies
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_service_role" ON public.user_roles;

-- Drop the old check_is_admin function
DROP FUNCTION IF EXISTS public.check_is_admin(UUID);

-- Create NEW check_is_admin that uses profiles table instead
CREATE OR REPLACE FUNCTION public.check_is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  admin_status BOOLEAN;
  target_user_id UUID;
BEGIN
  -- Use provided user_id or current user
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  -- Query profiles table instead of user_roles (no recursion)
  SELECT is_admin INTO admin_status
  FROM public.profiles
  WHERE id = target_user_id
  LIMIT 1;

  RETURN COALESCE(admin_status, FALSE);
END;
$$;

-- Secure the function
REVOKE ALL ON FUNCTION public.check_is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_is_admin(UUID) TO authenticated, anon, service_role;

-- Create simple, non-recursive policies for user_roles

-- Policy 1: Users can view their own role
CREATE POLICY "user_roles_select_own"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admins can view all roles (uses profiles.is_admin)
CREATE POLICY "user_roles_select_admin"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy 3: Admins can insert roles
CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy 4: Admins can update roles
CREATE POLICY "user_roles_update_admin"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy 5: Admins can delete roles
CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy 6: Service role has full access
CREATE POLICY "user_roles_service_role"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Add helpful comments
COMMENT ON FUNCTION public.check_is_admin(UUID) IS 'Checks if user is admin using profiles table to avoid recursion with user_roles RLS policies.';
COMMENT ON TABLE public.user_roles IS 'User roles table. Policies use profiles.is_admin to avoid infinite recursion.';
