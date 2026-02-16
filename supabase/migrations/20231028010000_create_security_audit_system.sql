-- Supabase Security Audit System
-- This migration creates the core functions and tables for the security audit.

-- Drop existing objects to ensure a clean installation
DROP FUNCTION IF EXISTS public.run_security_audit();
DROP FUNCTION IF EXISTS public.check_rls_enabled();
DROP FUNCTION IF EXISTS public.check_weak_rls_policies();
DROP FUNCTION IF EXISTS public.check_missing_primary_keys();
DROP FUNCTION IF EXISTS public.check_missing_foreign_key_indexes();
DROP FUNCTION IF EXISTS public.check_sensitive_data_exposure();
DROP TYPE IF EXISTS public.security_audit_result;-- 1. Define a custom type to standardize the output of all security checks.
CREATE TYPE public.security_audit_result AS (
    check_name TEXT,
    status TEXT, -- 'PASS', 'FAIL', or 'WARN'
    details TEXT,
    recommendation TEXT
);

-- 2. Helper Function: Check for tables in the 'public' schema without RLS enabled.
CREATE OR REPLACE FUNCTION public.check_rls_enabled()
RETURNS SETOF public.security_audit_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        'RLS Enforcement' AS check_name,
        'FAIL' AS status,
        'Table "' || t.tablename || '" does not have Row Level Security enabled.' AS details,
        'Enable RLS using: ALTER TABLE public.' || t.tablename || ' ENABLE ROW LEVEL SECURITY;' AS recommendation
    FROM
        pg_tables t
    JOIN
        pg_class c ON t.tablename = c.relname AND t.schemaname = c.relnamespace::regnamespace::text
    WHERE
        t.schemaname = 'public'
        AND c.relrowsecurity = false
        -- Exclude common managed tables that don't typically use RLS
        AND t.tablename NOT IN ('pg_stat_statements', 'pg_stat_statements_info');

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'RLS Enforcement'::TEXT, 'PASS'::TEXT, 'All relevant tables in the public schema have RLS enabled.'::TEXT, ''::TEXT;    END IF;
END;
$$;

-- 3. Helper Function: Check for potentially weak RLS policies.
CREATE OR REPLACE FUNCTION public.check_weak_rls_policies()
RETURNS SETOF public.security_audit_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$BEGIN
    RETURN QUERY
    SELECT
        'Weak RLS Policies' AS check_name,
        'WARN' AS status,
        'Table: ' || p.tablename || ', Policy: ' || p.policyname || ' - Issue: ' ||
        CASE
            WHEN p.qual = 'true' OR p.with_check = 'true' THEN 'Policy uses a permissive "true" expression, potentially allowing broad access.'
            WHEN p.cmd = 'ALL' THEN 'Policy applies to ALL commands. Consider creating specific policies for SELECT, INSERT, UPDATE, DELETE.'
            WHEN p.roles = '{public}' THEN 'Policy applies to the "public" role, granting access to all users, including unauthenticated ones.'
            WHEN p.cmd = 'UPDATE' AND p.with_check IS NULL THEN 'UPDATE policy is missing a WITH CHECK clause, which could allow data to be updated in a way that it is no longer visible to the user.'
            ELSE 'Unknown issue.'        END AS details,
        'Review the policy logic to ensure it enforces the principle of least privilege. Avoid overly permissive rules.' AS recommendation
    FROM
        pg_policies p
    WHERE
        p.schemaname = 'public'
        AND (
            p.qual = 'true' OR
            p.with_check = 'true' OR
            p.cmd = 'ALL' OR
            p.roles = '{public}' OR
            (p.cmd = 'UPDATE' AND p.with_check IS NULL)
        );

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'Weak RLS Policies'::TEXT, 'PASS'::TEXT, 'No obviously weak RLS policies were found.'::TEXT, ''::TEXT;
    END IF;
END;
$$;

-- 4. Helper Function: Check for tables without primary keys.
CREATE OR REPLACE FUNCTION public.check_missing_primary_keys()
RETURNS SETOF public.security_audit_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        'Primary Key Presence' AS check_name,
        'FAIL' AS status,
        'Table "' || t.tablename || '" is missing a primary key.' AS details,
        'Add a primary key to ensure data integrity and proper relationships. Example: ALTER TABLE public.' || t.tablename || ' ADD PRIMARY KEY (id);' AS recommendation
    FROM
        pg_tables t
    WHERE
        t.schemaname = 'public'
        AND NOT EXISTS (
            SELECT 1             FROM pg_constraint c
            JOIN pg_class cl ON c.conrelid = cl.oid
            JOIN pg_namespace n ON cl.relnamespace = n.oid
            WHERE c.contype = 'p'
            AND cl.relname = t.tablename
            AND n.nspname = t.schemaname
        );

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'Primary Key Presence'::TEXT, 'PASS'::TEXT, 'All tables in the public schema have primary keys.'::TEXT, ''::TEXT;
    END IF;
END;
$$;

-- 5. Helper Function: Check for columns that might contain sensitive data.
CREATE OR REPLACE FUNCTION public.check_sensitive_data_exposure()
RETURNS SETOF public.security_audit_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    WITH sensitive_patterns AS (
        SELECT 'password' AS pattern, 'High' AS level UNION ALL
        SELECT 'passwd', 'High' UNION ALL
        SELECT 'secret', 'High' UNION ALL
        SELECT 'token', 'High' UNION ALL
        SELECT 'api_key', 'High' UNION ALL
        SELECT 'credit_card', 'High' UNION ALL
        SELECT 'card_number', 'High' UNION ALL
        SELECT 'ssn', 'High' UNION ALL        SELECT 'tax_id', 'High' UNION ALL
        SELECT 'address', 'Medium' UNION ALL
        SELECT 'email', 'Medium' UNION ALL
        SELECT 'phone', 'Medium' UNION ALL        SELECT 'dob', 'Medium' UNION ALL
        SELECT 'birth', 'Medium'
    )    SELECT
        'Sensitive Data Exposure' AS check_name,
        'WARN' AS status,        'Column "' || c.column_name || '" in table "' || c.table_name || '" may contain sensitive ' ||
        sp.level || ' risk data based on its name.' AS details,
        'Ensure this column has appropriate access controls and consider encryption for sensitive data at rest.' AS recommendation
    FROM
        information_schema.columns c
    JOIN
        sensitive_patterns sp ON c.column_name ILIKE '%' || sp.pattern || '%'
    WHERE
        c.table_schema = 'public';

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'Sensitive Data Exposure'::TEXT, 'PASS'::TEXT, 'No columns with obvious sensitive data naming patterns were found.'::TEXT, ''::TEXT;
    END IF;
END;
$$;

-- Create security_audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    executed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    execution_time timestamp with time zone DEFAULT now() NOT NULL,    findings jsonb
);

-- Enable RLS on the audit logs table
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for security_audit_logs are created in 20231028010400_setup_user_roles.sql
-- after the is_admin() function is defined

-- 6. Main Function: Run all security checks and return the results.
CREATE OR REPLACE FUNCTION public.run_security_audit()
RETURNS SETOF public.security_audit_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    results public.security_audit_result[];
    current_result public.security_audit_result;
BEGIN
    -- Run all checks and accumulate results

    results := array_agg(q) FROM (
        SELECT * FROM public.check_rls_enabled()
        UNION ALL
        SELECT * FROM public.check_weak_rls_policies()
        UNION ALL
        SELECT * FROM public.check_missing_primary_keys()
        UNION ALL
        SELECT * FROM public.check_sensitive_data_exposure()
        UNION ALL
        SELECT * FROM public.check_missing_foreign_key_indexes() -- Added this check
    ) q;

    -- Log the audit execution with findings
    INSERT INTO public.security_audit_logs (executed_by, findings)
    VALUES (auth.uid(), to_jsonb(results));

    -- Return all results
    FOREACH current_result IN ARRAY results
    LOOP
        RETURN NEXT current_result;
    END LOOP;
END;$$;

COMMENT ON FUNCTION public.run_security_audit() IS 'Runs a comprehensive security audit on the database, logs the findings, and returns results.';
COMMENT ON FUNCTION public.check_rls_enabled() IS 'Checks for tables without Row Level Security enabled.';
COMMENT ON FUNCTION public.check_weak_rls_policies() IS 'Identifies potentially weak or overly permissive RLS policies.';
COMMENT ON FUNCTION public.check_missing_primary_keys() IS 'Finds tables without primary keys.';
COMMENT ON FUNCTION public.check_sensitive_data_exposure() IS 'Detects columns that might contain sensitive data based on naming patterns.';
