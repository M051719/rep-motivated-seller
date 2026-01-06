-- Fix GLBA Compliance Tables Schema
-- Adds missing columns to existing tables before creating indexes

-- Add missing columns to secure_documents if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'uploaded_by') THEN
        ALTER TABLE secure_documents ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'uploaded_at') THEN
        ALTER TABLE secure_documents ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'expires_at') THEN
        ALTER TABLE secure_documents ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'is_revoked') THEN
        ALTER TABLE secure_documents ADD COLUMN is_revoked BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'revoked_at') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'revoked_by') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'revoked_reason') THEN
        ALTER TABLE secure_documents ADD COLUMN revoked_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'access_count') THEN
        ALTER TABLE secure_documents ADD COLUMN access_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'last_accessed_at') THEN
        ALTER TABLE secure_documents ADD COLUMN last_accessed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'secure_documents' AND column_name = 'metadata') THEN
        ALTER TABLE secure_documents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Now create the indexes (they'll only be created if they don't exist)
CREATE INDEX IF NOT EXISTS idx_secure_documents_user ON secure_documents(uploaded_by, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_secure_documents_expires ON secure_documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_secure_documents_revoked ON secure_documents(is_revoked);
