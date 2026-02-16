-- Supabase Edge Function Security Scanner Helpers
-- This migration creates the necessary table and RPC function for the security-scan-edge-functions.

-- 1. Create a table to store scan results.
CREATE TABLE IF NOT EXISTS public.edge_function_security_scans (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    function_name text NOT NULL,
    scan_type text NOT NULL,    issues_found int NOT NULL,
    scan_results jsonb,
    scanned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    scanned_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Enable RLS on the new table.
ALTER TABLE public.edge_function_security_scans ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for edge_function_security_scans are created in 20231028010400_setup_user_roles.sql
-- after the user_roles table and is_admin() function are defined

-- 4. Create the RPC function to get the source code of an Edge Function.
-- This function securely reads from the internal functions table.
-- Modified to handle local development where supabase_functions schema may not exist.
CREATE OR REPLACE FUNCTION public.get_edge_function_source(function_name TEXT)
RETURNS TABLE (source_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Check if the supabase_functions schema and table exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'supabase_functions'
        AND table_name = 'functions'
    ) THEN
        -- Production environment: read from internal functions table
        RETURN QUERY
        SELECT content::TEXT FROM supabase_functions.functions WHERE slug = function_name;
    ELSE
        -- Local development: return empty result
        -- Edge function source code scanning is not available in local development
        RETURN;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- Gracefully handle missing table
        RETURN;
END;
$$;

COMMENT ON FUNCTION public.get_edge_function_source(TEXT) IS 'Securely retrieves the source code for a given Edge Function for scanning purposes.';
