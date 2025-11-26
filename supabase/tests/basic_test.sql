BEGIN;

SELECT plan(8);

-- Test pgTAP extension
SELECT has_extension('pgtap', 'pgTAP extension should be installed');

-- Test core tables exist
SELECT has_table('public', 'foreclosure_responses', 'foreclosure_responses table should exist');
SELECT has_table('public', 'notification_settings', 'notification_settings table should exist');
SELECT has_table('public', 'payments', 'payments table should exist');
SELECT has_table('public', 'consultation_bookings', 'consultation_bookings table should exist');

-- Test required columns exist
SELECT has_column('public', 'foreclosure_responses', 'received_nod', 'received_nod column should exist');
SELECT has_column('public', 'foreclosure_responses', 'missed_payments', 'missed_payments column should exist');

-- Test RLS is enabled
SELECT row_security_on('public', 'payments', 'RLS should be enabled on payments');

SELECT * FROM finish();
ROLLBACK;