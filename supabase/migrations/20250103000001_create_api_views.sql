-- ============================================================================
-- SECURITY HARDENING: API Views for RepMotivatedSeller
-- ============================================================================

-- Drop existing direct grants (if any)
REVOKE ALL ON api.payments FROM anon, authenticated;
REVOKE ALL ON api.consultation_bookings FROM anon, authenticated;
REVOKE ALL ON api.leads FROM anon, authenticated;

-- ============================================================================
-- PUBLIC VIEWS (Safe for anonymous + authenticated users)
-- ============================================================================

-- 1. Public consultation types (pricing info, no PII)
CREATE OR REPLACE VIEW api.consultation_types_public 
WITH (security_invoker = on) AS
SELECT 
    consultation_type,
    -- Hardcoded pricing - no user data exposure
    CASE consultation_type
        WHEN 'basic' THEN 99
        WHEN 'premium' THEN 299  
        WHEN 'enterprise' THEN 999
    END as price,
    CASE consultation_type
        WHEN 'basic' THEN '30 minutes - Property analysis'
        WHEN 'premium' THEN '60 minutes - Full market analysis + strategy'
        WHEN 'enterprise' THEN '90 minutes - Complete investment plan'
    END as description,
    CASE consultation_type
        WHEN 'basic' THEN 30
        WHEN 'premium' THEN 60
        WHEN 'enterprise' THEN 90
    END as duration_minutes
FROM (
    VALUES 
        ('basic'::text), 
        ('premium'::text), 
        ('enterprise'::text)
) AS t(consultation_type);

-- Grant read access to public consultation types
GRANT SELECT ON api.consultation_types_public TO anon, authenticated;

-- 2. Public stats (aggregated, no PII)
CREATE OR REPLACE VIEW api.platform_stats 
WITH (security_invoker = on) AS
SELECT 
    (SELECT COUNT(*) FROM api.consultation_bookings WHERE status = 'completed') as completed_consultations,
    (SELECT COUNT(*) FROM api.leads WHERE status = 'converted') as converted_leads,
    (SELECT COUNT(DISTINCT user_id) FROM api.payments WHERE status = 'completed') as satisfied_clients,
    (SELECT COALESCE(SUM(amount), 0) FROM api.payments WHERE status = 'completed') as total_revenue;

-- Grant read access to platform stats
GRANT SELECT ON api.platform_stats TO anon, authenticated;

-- ============================================================================
-- USER-SCOPED VIEWS (Authenticated users only, RLS enforced)
-- ============================================================================

-- 3. User's own payments (read-only, RLS enforced)
CREATE OR REPLACE VIEW api.my_payments 
WITH (security_invoker = on) AS
SELECT 
    id,
    amount,
    currency,
    status,
    stripe_payment_id,
    created_at,
    updated_at
FROM api.payments;  -- RLS on base table enforces user_id = auth.uid()

-- Grant read access to authenticated users only
GRANT SELECT ON api.my_payments TO authenticated;

-- 4. User's own consultation bookings (read-only, RLS enforced)
CREATE OR REPLACE VIEW api.my_consultations 
WITH (security_invoker = on) AS
SELECT 
    id,
    consultation_type,
    invitee_name,
    invitee_email,
    booking_date,
    duration_minutes,
    status,
    meeting_url,
    notes,
    created_at,
    updated_at
FROM api.consultation_bookings;  -- RLS enforces user_id = auth.uid()

-- Grant read access to authenticated users only
GRANT SELECT ON api.my_consultations TO authenticated;

-- 5. User's own leads (read-only, RLS enforced) 
CREATE OR REPLACE VIEW api.my_leads 
WITH (security_invoker = on) AS
SELECT 
    id,
    name,
    email,
    phone,
    property_address,
    lead_source,
    status,
    notes,
    created_at,
    updated_at
FROM api.leads;  -- RLS enforces user_id = auth.uid()

-- Grant read access to authenticated users only
GRANT SELECT ON api.my_leads TO authenticated;

-- ============================================================================
-- REVOKE DIRECT TABLE ACCESS (Hardening)
-- ============================================================================

-- Remove direct access to base tables
REVOKE ALL ON api.payments FROM anon, authenticated;
REVOKE ALL ON api.consultation_bookings FROM anon, authenticated; 
REVOKE ALL ON api.leads FROM anon, authenticated;

-- Keep only view access
-- (Views already granted above)

SELECT 'API Views created successfully!' as status;
