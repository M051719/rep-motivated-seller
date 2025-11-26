-- Supabase User Roles and Permissions
-- This migration creates the necessary tables and functions for role-based access control.

-- 1. Create the user_roles table
-- This table links users from auth.users to their roles.
CREATE TABLE IF NOT EXISTS public.user_roles (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_admin boolean DEFAULT false NOT NULL
);

-- 2. Enable RLS on the user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create a helper function to check admin status
-- This simplifies RLS policies in other tables.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND is_admin = true
    );
$$;

-- 4. Create RLS policies for user_roles (after is_admin() is defined)
-- Admins can manage all roles.
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view their own roles.
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 5. Create RLS policies for security_audit_logs (moved from 010000 migration)
CREATE POLICY "Admins can manage all logs"
ON public.security_audit_logs
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their own logs"
ON public.security_audit_logs
FOR SELECT
TO authenticated
USING (executed_by = auth.uid());

-- 6. Create RLS policies for edge_function_security_scans (moved from 010300 migration)
CREATE POLICY "Admins can manage all scans"
ON public.edge_function_security_scans
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can see scans they initiated"
ON public.edge_function_security_scans
FOR SELECT
TO authenticated
USING (scanned_by = auth.uid());

COMMENT ON TABLE public.user_roles IS 'Stores role information (e.g., admin status) for users.';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user is an admin, false otherwise.';

-- Example: Grant admin privileges to a user
-- INSERT INTO public.user_roles (user_id, is_admin)
-- VALUES ('YOUR_USER_ID_HERE', true)
-- ON CONFLICT (user_id) DO UPDATE SET is_admin = true;