-- Complete fix for infinite recursion in user_roles RLS policies
-- This migration safely drops all dependencies before recreating

-- Step 1: Drop all policies that depend on check_is_admin
DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_service_role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Step 2: Drop and recreate the check_is_admin function with CASCADE
DROP FUNCTION IF EXISTS public.check_is_admin(UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.check_is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- This runs as the function owner (bypasses RLS completely)
  SELECT is_admin INTO admin_status
  FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;

  RETURN COALESCE(admin_status, FALSE);
END;
$$;

-- Secure the function
REVOKE ALL ON FUNCTION public.check_is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_is_admin(UUID) TO authenticated, anon, service_role;

-- Step 3: Create simple, non-recursive policies

-- Policy 1: Users can always view their own role (no admin check needed)
CREATE POLICY "user_roles_select_own"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admins can view all roles (uses security definer function that bypasses RLS)
CREATE POLICY "user_roles_select_admin"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE);

-- Policy 3: Admins can insert roles
CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Policy 4: Admins can update roles
CREATE POLICY "user_roles_update_admin"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE)
  WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Policy 5: Admins can delete roles
CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE);

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "user_roles_service_role"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Add helpful comments
COMMENT ON FUNCTION public.check_is_admin(UUID) IS 'Checks if user is admin. Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion.';
COMMENT ON TABLE public.user_roles IS 'User roles table with non-recursive RLS policies using security definer functions.';
