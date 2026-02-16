-- PCI DSS Audit Logging Migration
-- Creates table for PCI DSS Requirement 10: Track and monitor all access
-- Maintains 1-year minimum audit logs per PCI DSS

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PCI Audit Logs Table
-- PCI DSS Requirement 10.2: Automated audit trails for all system components
CREATE TABLE IF NOT EXISTS pci_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    event_type VARCHAR(100) NOT NULL,
    resource_accessed VARCHAR(255) NOT NULL,
    action TEXT NOT NULL,
    result VARCHAR(20) NOT NULL, -- 'success', 'failure', 'denied'
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_result CHECK (result IN ('success', 'failure', 'denied')),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'payment_attempt',
        'payment_success',
        'payment_failure',
        'token_created',
        'token_used',
        'subscription_created',
        'subscription_updated',
        'subscription_cancelled',
        'refund_initiated',
        'refund_completed',
        'access_denied',
        'security_violation',
        'data_export',
        'admin_access',
        'configuration_change'
    ))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pci_audit_timestamp ON pci_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pci_audit_user ON pci_audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pci_audit_event_type ON pci_audit_logs(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pci_audit_result ON pci_audit_logs(result, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pci_audit_severity ON pci_audit_logs(severity, timestamp DESC) WHERE severity IN ('high', 'critical');

-- Row Level Security
ALTER TABLE pci_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY pci_audit_own ON pci_audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY pci_audit_admin ON pci_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Service role has full access
CREATE POLICY pci_audit_service ON pci_audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Function: Cleanup old PCI logs (1-year retention minimum per PCI DSS 10.7)
CREATE OR REPLACE FUNCTION cleanup_old_pci_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    retention_days INTEGER := 365; -- 1 year minimum
BEGIN
    DELETE FROM pci_audit_logs
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get PCI security statistics
CREATE OR REPLACE FUNCTION get_pci_security_statistics(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_events BIGINT,
    payment_attempts BIGINT,
    successful_payments BIGINT,
    failed_payments BIGINT,
    access_denials BIGINT,
    security_violations BIGINT,
    critical_events BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM pci_audit_logs WHERE timestamp > NOW() - (days_back || ' days')::INTERVAL),
        (SELECT COUNT(*) FROM pci_audit_logs WHERE event_type LIKE 'payment_%' AND timestamp > NOW() - (days_back || ' days')::INTERVAL),
        (SELECT COUNT(*) FROM pci_audit_logs WHERE event_type = 'payment_success' AND timestamp > NOW() - (days_back || ' days')::INTERVAL),
        (SELECT COUNT(*) FROM pci_audit_logs WHERE event_type = 'payment_failure' AND timestamp > NOW() - (days_back || ' days')::INTERVAL),
        (SELECT COUNT(*) FROM pci_audit_logs WHERE event_type = 'access_denied' AND timestamp > NOW() - (days_back || ' days')::INTERVAL),
        (SELECT COUNT(*) FROM pci_audit_logs WHERE event_type = 'security_violation' AND timestamp > NOW() - (days_back || ' days')::INTERVAL),
        (SELECT COUNT(*) FROM pci_audit_logs WHERE severity = 'critical' AND timestamp > NOW() - (days_back || ' days')::INTERVAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log payment attempt (convenience function)
CREATE OR REPLACE FUNCTION log_payment_attempt(
    p_user_id UUID,
    p_event_type VARCHAR,
    p_amount NUMERIC,
    p_currency VARCHAR,
    p_provider VARCHAR,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL,
    p_last4 VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO pci_audit_logs (
        user_id,
        event_type,
        resource_accessed,
        action,
        result,
        severity,
        metadata
    ) VALUES (
        p_user_id,
        p_event_type,
        'payment_' || p_provider,
        format('Processed %s %s payment', p_currency, p_amount),
        CASE WHEN p_success THEN 'success' ELSE 'failure' END,
        CASE WHEN p_success THEN 'low' ELSE 'medium' END,
        jsonb_build_object(
            'amount', p_amount,
            'currency', p_currency,
            'provider', p_provider,
            'last4', p_last4,
            'error_message', p_error_message
        )
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to cleanup old logs (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('cleanup-pci-logs', '0 2 * * 0', 'SELECT cleanup_old_pci_logs()');

-- Add table comment
COMMENT ON TABLE pci_audit_logs IS 'PCI DSS Requirement 10: Audit trail for all payment and security events (1-year retention minimum)';

-- Insert initial event to mark migration completion
INSERT INTO pci_audit_logs (
    user_id,
    event_type,
    resource_accessed,
    action,
    result,
    severity,
    metadata
) VALUES (
    NULL,
    'configuration_change',
    'database',
    'PCI DSS audit logging enabled',
    'success',
    'low',
    jsonb_build_object(
        'migration', '20251213000002_pci_dss_audit_logging',
        'timestamp', NOW(),
        'compliance_standard', 'PCI DSS v4.0'
    )
);
