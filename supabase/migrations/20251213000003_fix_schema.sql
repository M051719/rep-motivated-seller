-- Fix GLBA and PCI DSS Tables Schema
-- Adds missing columns and updates existing tables

-- Fix secure_documents table - add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add uploaded_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='uploaded_by') THEN
        ALTER TABLE secure_documents ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add uploaded_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='uploaded_at') THEN
        ALTER TABLE secure_documents ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add file_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='file_type') THEN
        ALTER TABLE secure_documents ADD COLUMN file_type VARCHAR(100);
    END IF;

    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='expires_at') THEN
        ALTER TABLE secure_documents ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;

    -- Add is_revoked column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='is_revoked') THEN
        ALTER TABLE secure_documents ADD COLUMN is_revoked BOOLEAN DEFAULT false;
    END IF;

    -- Add revoked_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='revoked_at') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_at TIMESTAMPTZ;
    END IF;

    -- Add revoked_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='revoked_by') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add revoked_reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='revoked_reason') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_reason TEXT;
    END IF;

    -- Add access_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='access_count') THEN
        ALTER TABLE secure_documents ADD COLUMN access_count INTEGER DEFAULT 0;
    END IF;

    -- Add last_accessed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='last_accessed_at') THEN
        ALTER TABLE secure_documents ADD COLUMN last_accessed_at TIMESTAMPTZ;
    END IF;

    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='secure_documents' AND column_name='metadata') THEN
        ALTER TABLE secure_documents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Create indexes that don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_secure_documents_user') THEN
        CREATE INDEX idx_secure_documents_user ON secure_documents(uploaded_by, uploaded_at DESC);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_secure_documents_expires') THEN
        CREATE INDEX idx_secure_documents_expires ON secure_documents(expires_at) WHERE expires_at IS NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_secure_documents_revoked') THEN
        CREATE INDEX idx_secure_documents_revoked ON secure_documents(is_revoked);
    END IF;
END $$;

-- Drop and recreate the policy for secure_documents to handle new columns
DROP POLICY IF EXISTS secure_documents_owner ON secure_documents;

CREATE POLICY secure_documents_owner ON secure_documents
    FOR ALL USING (
        auth.uid() = uploaded_by
        OR auth.role() = 'service_role'
        OR auth.uid() IN (
            SELECT user_id FROM npi_access_permissions 
            WHERE npi_type = 'document' 
            AND (resource_id = id::text OR resource_id IS NULL)
            AND is_active = true
        )
    );

-- Log completion
INSERT INTO compliance_metrics (metric_name, metric_value, category, metadata)
VALUES ('schema_fix_applied', 1, 'general', 
        jsonb_build_object('migration', '20251213000003_fix_schema', 'timestamp', NOW()))
ON CONFLICT DO NOTHING;
