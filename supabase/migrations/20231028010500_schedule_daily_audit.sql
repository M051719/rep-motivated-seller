-- Schedule Daily Security Audits using pg_cron
-- 1. Enable the pg_cron extension if it's not already.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the main audit function to run daily at 3:00 AM UTC.
-- The results will be automatically stored in the security_audit_logs table.
-- Using DO block to make this script idempotent.
DO $$
BEGIN
    -- Try to unschedule existing job if it exists
    PERFORM cron.unschedule('daily-security-audit');
EXCEPTION
    WHEN OTHERS THEN
        -- Job doesn't exist yet, that's fine
        NULL;
END $$;

SELECT cron.schedule(
    'daily-security-audit',
    '0 3 * * *', -- 3:00 AM UTC every day
    $$
    SELECT * FROM public.run_security_audit();
    $$
);

COMMENT ON EXTENSION pg_cron IS 'Used to schedule periodic runs of the security audit functions.';