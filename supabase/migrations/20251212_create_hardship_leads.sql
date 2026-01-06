-- Create hardship_leads table for email capture
CREATE TABLE IF NOT EXISTS public.hardship_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  template_type TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.hardship_leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public form)
CREATE POLICY "Allow public insert on hardship_leads" 
ON public.hardship_leads 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Only authenticated users can read (for admin dashboard)
CREATE POLICY "Allow authenticated read on hardship_leads" 
ON public.hardship_leads 
FOR SELECT 
TO authenticated 
USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hardship_leads_email ON public.hardship_leads(email);
CREATE INDEX IF NOT EXISTS idx_hardship_leads_created_at ON public.hardship_leads(created_at DESC);
