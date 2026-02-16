-- Harden and Verify Audit System
-- This migration adds final production-ready touches.

-- 1. Harden the admin_operation_logs table
-- The user_id should not be nullable to ensure every action is attributable.
ALTER TABLE public.admin_operation_logs    ALTER COLUMN user_id SET NOT NULL;

-- Drop the old policy and re-create it to only allow admins to view.
-- Inserting logs is now handled by SECURITY DEFINER functions.
DROP POLICY IF EXISTS "Admins can view all operation logs" ON public.admin_operation_logs;
CREATE POLICY "Admins can read all operation logs"
ON public.admin_operation_logs
FOR SELECT
USING (public.is_admin());

-- 2. Create a system health check function
-- This function verifies that all necessary components of the audit suite are installed.
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS TABLE (
    component_type text,
    component_name text,
    status text,
    details text
)
LANGUAGE plpgsql
AS $$
DECLARE
    component record;
    expected_tables text[] := ARRAY['security_audit_logs', 'user_roles', 'edge_function_security_scans', 'admin_operation_logs'];
    expected_functions text[] := ARRAY['run_security_audit', 'check_rls_enabled', 'check_weak_rls_policies', 'check_missing_primary_keys', 'check_sensitive_data_exposure', 'check_missing_foreign_key_indexes', 'create_missing_fk_indexes', 'check_multiple_permissive_policies', 'is_admin', 'get_edge_function_source'];
BEGIN
    -- Check for tables
    FOREACH component_name IN ARRAY expected_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = component_name) THEN
            status := 'OK';
            details := 'Exists';
        ELSE
            status := 'MISSING';
            details := 'Table not found.';
        END IF;
        RETURN QUERY SELECT 'Table', component_name, status, details;
    END LOOP;

    -- Check for functions
    FOREACH component_name IN ARRAY expected_functions
    LOOP
        IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = component_name) THEN
            status := 'OK';
            details := 'Exists';
        ELSE
            status := 'MISSING';
            details := 'Function not found.';
        END IF;
        RETURN QUERY SELECT 'Function', component_name, status, details;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION public.system_health_check() IS 'Verifies the installation of all tables and functions for the security audit suite.';
