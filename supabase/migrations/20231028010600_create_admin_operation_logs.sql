-- Supabase Admin Operation Logging
-- This migration creates a table to log significant administrative actions.

-- 1. Create the admin_operation_logs table
CREATE TABLE IF NOT EXISTS public.admin_operation_logs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    operation_type text NOT NULL,
    details jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.admin_operation_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Admins can view all operation logs.
CREATE POLICY "Admins can view all operation logs"
ON public.admin_operation_logs
FOR SELECT
USING (public.is_admin());

COMMENT ON TABLE public.admin_operation_logs IS 'Logs significant administrative actions, such as running remediation functions.';
