-- Enable pgTAP testing extension
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Create a schema for our tests
CREATE SCHEMA IF NOT EXISTS tests;

-- Grant permissions for testing
GRANT USAGE ON SCHEMA tests TO postgres;
GRANT CREATE ON SCHEMA tests TO postgres;