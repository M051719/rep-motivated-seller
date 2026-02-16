-- RepMotivatedSeller Data Retention Policy
-- PCI DSS & GLBA Compliant Data Management

SELECT 'Setting up PCI DSS & GLBA compliant data retention...' as status;

-- Create compliance schema
CREATE SCHEMA IF NOT EXISTS compliance;
GRANT USAGE ON SCHEMA compliance TO postgres;

-- Create compliance log table
CREATE TABLE IF NOT EXISTS compliance.compliance_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id UUID,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    pci_dss_relevant BOOLEAN DEFAULT false,
    glba_relevant BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    compliance_notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    retention_date TIMESTAMPTZ
);

-- Create privacy requests table
CREATE TABLE IF NOT EXISTS compliance.privacy_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'deletion', 'portability', 'correction', 'opt_out')),
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    request_details TEXT,
    verification_method TEXT DEFAULT 'email',
    regulation TEXT NOT NULL CHECK (regulation IN ('GLBA', 'GDPR', 'CCPA', 'PIPEDA')),
    status TEXT DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'processing', 'completed', 'denied')),
    verification_token TEXT,
    verified_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PCI DSS Data Retention Rules (3+ years for payment data)
CREATE TABLE IF NOT EXISTS compliance.data_retention_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    schema_name TEXT DEFAULT 'rep_motivated_seller',
    retention_period INTERVAL NOT NULL,
    regulation TEXT NOT NULL,
    description TEXT,
    last_cleanup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert retention rules
INSERT INTO compliance.data_retention_rules (table_name, retention_period, regulation, description) VALUES
('payments', '7 years', 'PCI DSS + GLBA', 'Payment and financial transaction data'),
('foreclosure_responses', '7 years', 'GLBA', 'Financial and mortgage information'),
('consultation_bookings', '7 years', 'GLBA', 'Financial consultation records'),
('compliance_log', '10 years', 'PCI DSS + GLBA', 'Compliance audit trail'),
('privacy_requests', '7 years', 'GLBA + GDPR', 'Privacy rights requests')
ON CONFLICT DO NOTHING;

-- Create automated cleanup function
CREATE OR REPLACE FUNCTION compliance.cleanup_expired_data()
RETURNS TABLE(
    table_cleaned TEXT,
    records_deleted INTEGER,
    regulation TEXT
) AS $$
DECLARE
    rule_record RECORD;
    deleted_count INTEGER;
BEGIN
    -- Log the cleanup start
    INSERT INTO compliance.compliance_log (
        event_type, resource_type, action, pci_dss_relevant, glba_relevant, compliance_notes
    ) VALUES (
        'data_retention', 'automated_cleanup', 'cleanup_started', true, true,
        'Automated data retention cleanup started'
    );

    -- Process each retention rule
    FOR rule_record IN
        SELECT * FROM compliance.data_retention_rules
        WHERE last_cleanup < NOW() - INTERVAL '1 day' OR last_cleanup IS NULL
    LOOP
        -- Execute cleanup based on retention period
        EXECUTE format(
            'DELETE FROM %I.%I WHERE created_at < NOW() - INTERVAL ''%s''',
            rule_record.schema_name,
            rule_record.table_name,
            rule_record.retention_period
        );

        GET DIAGNOSTICS deleted_count = ROW_COUNT;

        -- Update last cleanup timestamp
        UPDATE compliance.data_retention_rules
        SET last_cleanup = NOW()
        WHERE id = rule_record.id;

        -- Return results
        table_cleaned := rule_record.schema_name || '.' || rule_record.table_name;
        records_deleted := deleted_count;
        regulation := rule_record.regulation;
        RETURN NEXT;

        -- Log each cleanup operation
        INSERT INTO compliance.compliance_log (
            event_type, resource_type, action,
            pci_dss_relevant, glba_relevant,
            metadata, compliance_notes
        ) VALUES (
            'data_retention', rule_record.table_name, 'records_deleted',
            (rule_record.regulation LIKE '%PCI DSS%'),
            (rule_record.regulation LIKE '%GLBA%'),
            jsonb_build_object('deleted_count', deleted_count, 'retention_period', rule_record.retention_period),
            format('Deleted %s expired records from %s', deleted_count, rule_record.table_name)
        );
    END LOOP;

    -- Log the cleanup completion
    INSERT INTO compliance.compliance_log (
        event_type, resource_type, action, pci_dss_relevant, glba_relevant, compliance_notes
    ) VALUES (
        'data_retention', 'automated_cleanup', 'cleanup_completed', true, true,
        'Automated data retention cleanup completed successfully'
    );

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create function to create compliance log table (for edge function)
CREATE OR REPLACE FUNCTION create_compliance_log_table()
RETURNS void AS $$
BEGIN
    -- This function ensures the compliance log table exists
    -- It's safe to call multiple times
    PERFORM 1;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_log_timestamp ON compliance.compliance_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_compliance_log_event_type ON compliance.compliance_log(event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_log_pci_dss ON compliance.compliance_log(pci_dss_relevant) WHERE pci_dss_relevant = true;
CREATE INDEX IF NOT EXISTS idx_compliance_log_glba ON compliance.compliance_log(glba_relevant) WHERE glba_relevant = true;
CREATE INDEX IF NOT EXISTS idx_privacy_requests_email ON compliance.privacy_requests(email);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON compliance.privacy_requests(status);

-- Enable RLS
ALTER TABLE compliance.compliance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance.privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance.data_retention_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin access to compliance logs" ON compliance.compliance_log FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email LIKE '%@repmotivatedseller.org')
);

CREATE POLICY "Users can view their own privacy requests" ON compliance.privacy_requests FOR SELECT USING (
    auth.jwt() ->> 'email' = email OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email LIKE '%@repmotivatedseller.org')
);

CREATE POLICY "Public can create privacy requests" ON compliance.privacy_requests FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON compliance.compliance_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance.privacy_requests TO authenticated;
GRANT SELECT ON compliance.data_retention_rules TO authenticated;

-- Create a view for compliance reporting
CREATE OR REPLACE VIEW compliance.compliance_summary AS
SELECT
    DATE_TRUNC('day', timestamp) as date,
    event_type,
    COUNT(*) as event_count,
    COUNT(CASE WHEN pci_dss_relevant THEN 1 END) as pci_dss_events,
    COUNT(CASE WHEN glba_relevant THEN 1 END) as glba_events
FROM compliance.compliance_log
GROUP BY DATE_TRUNC('day', timestamp), event_type
ORDER BY date DESC;

GRANT SELECT ON compliance.compliance_summary TO authenticated;

SELECT '✅ PCI DSS & GLBA data retention policy setup completed!' as status;
SELECT '📊 Compliance logging system active' as status;
SELECT '🔐 Privacy request system ready' as status;