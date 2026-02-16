-- Property Inventory System Migration
-- Created: January 5, 2026
-- Purpose: Track property portfolio (available, purchased, sold, refinanced)

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Property Details
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('single-family', 'multi-family', 'condo', 'townhouse', 'land', 'commercial')),

  -- Financial Details
  purchase_price DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  sale_price DECIMAL(12, 2),
  mortgage_balance DECIMAL(12, 2),
  monthly_payment DECIMAL(10, 2),
  monthly_rent DECIMAL(10, 2),

  -- Property Specs
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  lot_size DECIMAL(10, 2),
  year_built INTEGER,

  -- Status & Workflow
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'under-contract', 'purchased', 'sold', 'refinanced', 'archived')),
  acquisition_date DATE,
  sale_date DATE,

  -- Investment Details
  total_invested DECIMAL(12, 2),
  repair_costs DECIMAL(12, 2),
  holding_costs DECIMAL(12, 2),
  profit DECIMAL(12, 2),
  roi DECIMAL(5, 2), -- Return on Investment %

  -- Description & Notes
  description TEXT,
  notes TEXT,

  -- Owner
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  featured_image_url TEXT,
  listing_url TEXT,
  mls_number TEXT
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Create property_documents table
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'inspection', 'appraisal', 'title', 'deed', 'closing', 'repair-estimate', 'other')),
  document_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties table
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own properties"
  ON properties FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for property_images table
CREATE POLICY "Users can view images of their properties"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images for their properties"
  ON property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images of their properties"
  ON property_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images of their properties"
  ON property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- RLS Policies for property_documents table
CREATE POLICY "Users can view documents of their properties"
  ON property_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_documents.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their properties"
  ON property_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_documents.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents of their properties"
  ON property_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_documents.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents of their properties"
  ON property_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_documents.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for property documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false, -- Private documents
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-images bucket
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their property images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their property images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- Storage policies for property-documents bucket (private)
CREATE POLICY "Users can view their property documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'property-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload property documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their property documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their property documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-documents'
    AND auth.role() = 'authenticated'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER properties_updated_at_trigger
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_properties_updated_at();

-- Function to calculate ROI automatically
CREATE OR REPLACE FUNCTION calculate_property_roi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_invested > 0 AND NEW.profit IS NOT NULL THEN
    NEW.roi = (NEW.profit / NEW.total_invested) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate ROI
CREATE TRIGGER calculate_roi_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_property_roi();
