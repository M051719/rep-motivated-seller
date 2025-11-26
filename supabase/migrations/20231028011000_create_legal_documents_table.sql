-- Supabase Legal Documents Management
-- This migration creates a table to dynamically store legal documents like Terms & Conditions and Privacy Policies.

-- 1. Create the legal_documents table
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    document_type text UNIQUE NOT NULL, -- e.g., 'terms_and_conditions', 'privacy_policy'
    content text NOT NULL, -- The full HTML or Markdown content
    version smallint NOT NULL DEFAULT 1,
    effective_date date NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone can read the legal documents.
CREATE POLICY "Legal documents are publicly readable"
ON public.legal_documents
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can create or update legal documents.
CREATE POLICY "Admins can manage legal documents"
ON public.legal_documents
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

COMMENT ON TABLE public.legal_documents IS 'Stores versioned legal documents for the application.';
COMMENT ON COLUMN public.legal_documents.document_type IS 'The type of the document, e.g., "terms_and_conditions".';