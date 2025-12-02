-- Complete fix for ALL infinite recursion issues across all tables
-- This updates policies in profiles, blog_posts, and other tables that reference user_roles

-- Step 1: Update profiles table policies to use check_is_admin function

-- Drop existing profiles policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate profiles policies with non-recursive checks
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE)
  WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Step 2: Update blog_posts table policies to use check_is_admin function

-- Drop existing blog_posts policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;

-- Recreate blog_posts policies with non-recursive checks
CREATE POLICY "Admins can manage all blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE)
  WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Step 3: Update email_notifications table policies (if exists)

DROP POLICY IF EXISTS "Admins can manage email notifications" ON public.email_notifications;

CREATE POLICY "Admins can manage email notifications"
  ON public.email_notifications
  FOR ALL
  TO authenticated
  USING (public.check_is_admin(auth.uid()) = TRUE)
  WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Step 4: Verify the check_is_admin function is properly set up
-- (This should already exist from the previous migration)

-- Add helpful comment
COMMENT ON FUNCTION public.check_is_admin(UUID) IS 'Checks if user is admin. Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion. Used by all admin-related policies across all tables.';
