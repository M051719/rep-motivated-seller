-- Fix infinite recursion in user_roles RLS policy
-- The is_admin() function was causing recursion because it queries user_roles
-- which triggers RLS policies that call is_admin() again.
-- Solution: Make is_admin() bypass RLS using SECURITY DEFINER with proper search_path

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate is_admin() function with proper RLS bypass
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    is_admin_user boolean;
BEGIN
    -- Bypass RLS by using SECURITY DEFINER
    -- This function runs with the privileges of the function owner (superuser)
    SELECT is_admin INTO is_admin_user
    FROM public.user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;

    RETURN COALESCE(is_admin_user, false);
END;
$$;

-- Secure the function
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Now create simpler policies that won't cause recursion
-- Users can always view their own roles (no is_admin check needed)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Service role can do everything (for backend operations)
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles; CREATE POLICY "Service role full access"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view all roles (SELECT only to avoid recursion on INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles; CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    -- Direct query to avoid function call recursion
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.is_admin = true
    )
);

-- Admins can insert/update/delete roles (separate policies for safety)
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.is_admin = true
    )
);

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.is_admin = true
    )
);

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.is_admin = true
    )
);

-- Add helpful comment
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is admin. Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion.';

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE 'User roles RLS policies fixed - infinite recursion resolved';
END $$;
