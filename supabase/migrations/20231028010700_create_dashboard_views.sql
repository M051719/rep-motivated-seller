-- Supabase Dashboard Views
-- This migration creates easy-to-query views for audit and log data.

-- 1. Create a view for the main security audit report
CREATE OR REPLACE VIEW public.security_audit_report AS
SELECT
    log.id AS log_id,
    log.executed_by,
    log.execution_time,
    finding ->> 'check_name' AS check_name,
    finding ->> 'status' AS status,    finding ->> 'details' AS details,
    finding ->> 'recommendation' AS recommendation
FROM    public.security_audit_logs AS log,
    jsonb_array_elements(log.findings) AS finding
WHERE
    jsonb_typeof(log.findings) = 'array'
ORDER BY
    log.execution_time DESC;

-- 2. RLS for the view
-- Note: RLS from the underlying table (security_audit_logs) is automatically applied.
-- We must ensure the view owner is `postgres` to prevent RLS bypass issues.
ALTER VIEW public.security_audit_report OWNER TO postgres;

COMMENT ON VIEW public.security_audit_report IS 'Provides a flattened, human-readable view of the security audit log findings.';
