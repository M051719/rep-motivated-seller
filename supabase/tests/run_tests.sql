-- Main test runner script
\echo 'Starting RepMotivatedSeller Database Tests...'

-- Run table structure tests
\echo 'Running table structure tests...'
\i tests/database/test_tables.sql

-- Run function tests  
\echo 'Running function tests...'
\i tests/functions/test_edge_functions.sql

-- Run RLS policy tests
\echo 'Running RLS policy tests...'
\i tests/policies/test_rls_policies.sql

\echo 'All tests completed!'