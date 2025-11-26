-- Test file for RepMotivatedSeller database schema
BEGIN;

SELECT plan(20); -- Number of tests we plan to run

-- Test: Extensions exist
SELECT has_extension('uuid-ossp', 'uuid-ossp extension should exist');
SELECT has_extension('pgtap', 'pgtap extension should exist');

-- Test: Tables exist
SELECT has_table('public', 'payments', 'payments table should exist');
SELECT has_table('public', 'paypal_transactions', 'paypal_transactions table should exist');
SELECT has_table('public', 'consultation_bookings', 'consultation_bookings table should exist');
SELECT has_table('public', 'mail_campaigns', 'mail_campaigns table should exist');

-- Test: Table columns exist and have correct types
SELECT has_column('public', 'payments', 'id', 'payments should have id column');
SELECT col_type_is('public', 'payments', 'id', 'uuid', 'payments.id should be uuid type');
SELECT col_is_pk('public', 'payments', 'id', 'payments.id should be primary key');

SELECT has_column('public', 'payments', 'stripe_payment_intent_id', 'payments should have stripe_payment_intent_id');
SELECT col_type_is('public', 'payments', 'amount', 'integer', 'payments.amount should be integer');
SELECT col_type_is('public', 'payments', 'currency', 'text', 'payments.currency should be text');

-- Test: Foreign key relationships
SELECT has_column('public', 'payments', 'user_id', 'payments should have user_id column');
SELECT col_is_fk('public', 'payments', 'user_id', 'payments.user_id should be foreign key');

-- Test: Consultation bookings table structure
SELECT has_column('public', 'consultation_bookings', 'calendly_event_uuid', 'consultation_bookings should have calendly_event_uuid');
SELECT col_type_is('public', 'consultation_bookings', 'invitee_email', 'text', 'invitee_email should be text');
SELECT col_type_is('public', 'consultation_bookings', 'scheduled_start_time', 'timestamp with time zone', 'scheduled_start_time should be timestamptz');

-- Test: Default values
SELECT col_default_is('public', 'payments', 'currency', '''usd''', 'payments.currency should default to usd');
SELECT col_default_is('public', 'consultation_bookings', 'status', '''scheduled''', 'consultation_bookings.status should default to scheduled');

-- Test: Row Level Security is enabled
SELECT row_security_on('public', 'payments', 'RLS should be enabled on payments');
SELECT row_security_on('public', 'consultation_bookings', 'RLS should be enabled on consultation_bookings');

-- Test: Check constraints exist (if any)
SELECT has_check('public', 'consultation_bookings', 'Valid consultation_bookings.status values');

SELECT * FROM finish();
ROLLBACK;