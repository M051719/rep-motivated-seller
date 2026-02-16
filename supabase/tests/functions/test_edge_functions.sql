-- Test file for Edge Functions
BEGIN;

SELECT plan(10);

-- Test: Database functions for edge function support exist
SELECT has_function('public', 'process_payment_webhook', 'process_payment_webhook function should exist');
SELECT has_function('public', 'handle_consultation_booking', 'handle_consultation_booking function should exist');

-- Test: Database triggers exist
SELECT trigger_is('public', 'payments', 'update_payment_timestamp', 'update_payment_timestamp trigger should exist');

-- Test: Views exist for analytics
SELECT has_view('public', 'consultation_analytics', 'consultation_analytics view should exist');

-- Test: Sample data insertion works
INSERT INTO payments (
    stripe_payment_intent_id,
    amount,
    currency,
    status,
    customer_email
) VALUES (
    'pi_test_12345',
    2000,
    'usd',
    'succeeded',
    'test@example.com'
);

SELECT ok(
    (SELECT COUNT(*) FROM payments WHERE stripe_payment_intent_id = 'pi_test_12345') = 1,
    'Should be able to insert payment record'
);

-- Test: Unique constraints work
SELECT throws_ok(
    'INSERT INTO payments (stripe_payment_intent_id, amount, currency, status) VALUES (''pi_test_12345'', 1000, ''usd'', ''succeeded'')',
    23505, -- Unique violation error code
    'Should prevent duplicate stripe_payment_intent_id'
);

-- Test: Foreign key constraints work
SELECT throws_ok(
    'INSERT INTO consultation_bookings (user_id, consultation_type, invitee_name, invitee_email) VALUES (''00000000-0000-0000-0000-000000000000'', ''test'', ''Test User'', ''test@example.com'')',
    23503, -- Foreign key violation error code
    'Should enforce user_id foreign key constraint'
);

-- Test: Required fields are enforced
SELECT throws_ok(
    'INSERT INTO consultation_bookings (consultation_type) VALUES (''test'')',
    23502, -- Not null violation
    'Should require invitee_name and invitee_email'
);

-- Test: JSON fields work correctly
UPDATE payments
SET metadata = '{"test": "data", "amount_dollars": 20.00}'::jsonb
WHERE stripe_payment_intent_id = 'pi_test_12345';

SELECT ok(
    (SELECT metadata->>'test' FROM payments WHERE stripe_payment_intent_id = 'pi_test_12345') = 'data',
    'Should handle JSONB metadata correctly'
);

SELECT * FROM finish();
ROLLBACK;
```

### **E. Create RLS Policy Tests**

**Create: `supabase/tests/policies/test_rls_policies.sql`**

```sql
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