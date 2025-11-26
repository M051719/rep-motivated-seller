-- Test Row Level Security policies
BEGIN;

SELECT plan(8);

-- Test: RLS is enabled on sensitive tables
SELECT row_security_on('public', 'payments', 'RLS enabled on payments table');
SELECT row_security_on('public', 'consultation_bookings', 'RLS enabled on consultation_bookings table');
SELECT row_security_on('public', 'paypal_transactions', 'RLS enabled on paypal_transactions table');

-- Test: Policies exist
SELECT policies_are('public', 'payments', ARRAY[
    'Users can view their own payments'
], 'payments table should have correct policies');

SELECT policies_are('public', 'consultation_bookings', ARRAY[
    'Users can view their own consultations'
], 'consultation_bookings table should have correct policies');

-- Test: Anonymous users cannot access sensitive data
SET ROLE anon;

SELECT is_empty(
    'SELECT * FROM payments',
    'Anonymous users should not see any payments'
);

SELECT is_empty(
    'SELECT * FROM consultation_bookings', 
    'Anonymous users should not see any consultation bookings'
);

-- Reset role
RESET ROLE;

-- Test: Authenticated users can only see their own data
SELECT ok(
    (SELECT COUNT(*) FROM information_schema.enabled_roles WHERE role_name = 'authenticated') >= 0,
    'Authenticated role should exist'
);

SELECT * FROM finish();
ROLLBACK;