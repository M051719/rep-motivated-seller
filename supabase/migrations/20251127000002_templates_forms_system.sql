-- Create templates_forms table for managing uploaded templates and forms
CREATE TABLE IF NOT EXISTS public.templates_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'template', 'contract', 'form', 'canva-template'
    subcategory TEXT, -- e.g., 'postcard', 'flyer', 'legal', 'wholesale'
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'docx', 'doc', 'xlsx', etc.
    file_size BIGINT, -- Size in bytes
    thumbnail_url TEXT, -- Optional thumbnail for visual templates
    canva_template_id TEXT, -- For Canva templates
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_templates_forms_category ON public.templates_forms(category);
CREATE INDEX IF NOT EXISTS idx_templates_forms_subcategory ON public.templates_forms(subcategory);
CREATE INDEX IF NOT EXISTS idx_templates_forms_is_active ON public.templates_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_forms_created_at ON public.templates_forms(created_at DESC);

-- Enable RLS
ALTER TABLE public.templates_forms ENABLE ROW LEVEL SECURITY;

-- Public read access for active templates
CREATE POLICY "Anyone can view active templates"
    ON public.templates_forms
    FOR SELECT
    USING (is_active = true);

-- Admins can view all templates
CREATE POLICY "Admins can view all templates"
    ON public.templates_forms
    FOR SELECT
    USING (public.check_is_admin(auth.uid()) = TRUE);

-- Admins can insert templates
CREATE POLICY "Admins can insert templates"
    ON public.templates_forms
    FOR INSERT
    WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Admins can update templates
CREATE POLICY "Admins can update templates"
    ON public.templates_forms
    FOR UPDATE
    USING (public.check_is_admin(auth.uid()) = TRUE);

-- Admins can delete templates
CREATE POLICY "Admins can delete templates"
    ON public.templates_forms
    FOR DELETE
    USING (public.check_is_admin(auth.uid()) = TRUE);

-- Create storage bucket for templates and forms
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates-forms', 'templates-forms', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for templates-forms bucket

-- Anyone can download files
CREATE POLICY "Anyone can download template files"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates-forms');

-- Admins can upload files
CREATE POLICY "Admins can upload template files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'templates-forms'
    AND public.check_is_admin(auth.uid()) = TRUE
);

-- Admins can update files
CREATE POLICY "Admins can update template files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'templates-forms'
    AND public.check_is_admin(auth.uid()) = TRUE
);

-- Admins can delete files
CREATE POLICY "Admins can delete template files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'templates-forms'
    AND public.check_is_admin(auth.uid()) = TRUE
);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_template_download(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.templates_forms
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = template_id;
END;
$$;

-- Function to update timestamp on row update
CREATE OR REPLACE FUNCTION update_templates_forms_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER trigger_update_templates_forms_timestamp
    BEFORE UPDATE ON public.templates_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_templates_forms_updated_at();
