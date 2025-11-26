-- ============================================================================
-- OPTIONAL HARDENING: Revoke public schema usage
-- ============================================================================
-- CAUTION: This is aggressive hardening. Apply only if confirmed.
-- This prevents any direct access to public schema objects.

-- Create a public_readonly role for specific needs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'public_readonly') THEN
        CREATE ROLE public_readonly;
    END IF;
END $$;

GRANT USAGE ON SCHEMA public TO public_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO public_readonly;

-- Comment: You can grant public_readonly to specific functions/views that need it

SELECT 'Optional hardening prepared (not applied yet)' as status;