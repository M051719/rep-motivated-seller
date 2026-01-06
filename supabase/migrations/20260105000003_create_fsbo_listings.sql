-- Create FSBO Listings Table
CREATE TABLE IF NOT EXISTS fsbo_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  -- Owner Contact Information
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  
  -- Property Location
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Los Angeles',
  state TEXT NOT NULL DEFAULT 'CA',
  zip_code TEXT NOT NULL,
  
  -- Pricing
  asking_price NUMERIC(12, 2) NOT NULL,
  property_tax NUMERIC(10, 2),
  
  -- Basic Property Information
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC(3, 1) NOT NULL,
  square_feet INTEGER NOT NULL,
  lot_size NUMERIC(8, 2) NOT NULL,
  year_built INTEGER NOT NULL,
  property_condition TEXT NOT NULL DEFAULT 'good',
  year_remodeled INTEGER,
  
  -- Property Structure
  home_style TEXT NOT NULL DEFAULT 'single-family',
  garage_spaces INTEGER DEFAULT 0,
  garage_attached BOOLEAN DEFAULT false,
  
  -- Additional Rooms
  has_den BOOLEAN DEFAULT false,
  has_dining_room BOOLEAN DEFAULT false,
  has_recreation_room BOOLEAN DEFAULT false,
  has_office BOOLEAN DEFAULT false,
  has_loft BOOLEAN DEFAULT false,
  has_sun_room BOOLEAN DEFAULT false,
  
  -- Outside Buildings
  has_shed BOOLEAN DEFAULT false,
  has_barn BOOLEAN DEFAULT false,
  has_dog_pen BOOLEAN DEFAULT false,
  
  -- Utilities & Systems
  water_type TEXT DEFAULT 'city',
  electricity_type TEXT DEFAULT 'standard',
  has_solar BOOLEAN DEFAULT false,
  ac_type TEXT DEFAULT 'central',
  heating_type TEXT DEFAULT 'central',
  hot_water_type TEXT DEFAULT 'tank',
  
  -- Basement
  has_basement BOOLEAN DEFAULT false,
  basement_type TEXT,
  basement_sqft INTEGER,
  
  -- ADU (Accessory Dwelling Unit)
  has_adu BOOLEAN DEFAULT false,
  
  -- Financing Information
  is_free_and_clear BOOLEAN DEFAULT false,
  existing_loans TEXT,
  
  -- Images
  featured_image_url TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Listing Status
  status TEXT NOT NULL DEFAULT 'active',
  
  -- User Association (optional - for authenticated users)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_fsbo_listings_user_id ON fsbo_listings(user_id);
CREATE INDEX idx_fsbo_listings_status ON fsbo_listings(status);
CREATE INDEX idx_fsbo_listings_city ON fsbo_listings(city);
CREATE INDEX idx_fsbo_listings_price ON fsbo_listings(asking_price);
CREATE INDEX idx_fsbo_listings_bedrooms ON fsbo_listings(bedrooms);
CREATE INDEX idx_fsbo_listings_created_at ON fsbo_listings(created_at DESC);

-- Create storage bucket for FSBO listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fsbo-listings',
  'fsbo-listings',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to FSBO listing images
CREATE POLICY "FSBO listing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'fsbo-listings');

-- Allow authenticated users to upload FSBO listing images
CREATE POLICY "Authenticated users can upload FSBO listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fsbo-listings');

-- Allow users to update their own FSBO listing images
CREATE POLICY "Users can update their own FSBO listing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'fsbo-listings');

-- Allow users to delete their own FSBO listing images
CREATE POLICY "Users can delete their own FSBO listing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'fsbo-listings');

-- Enable Row Level Security
ALTER TABLE fsbo_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active listings (public access)
CREATE POLICY "Active FSBO listings are publicly viewable"
ON fsbo_listings FOR SELECT
USING (status = 'active');

-- Policy: Anyone can insert a listing (both authenticated and anonymous users)
CREATE POLICY "Anyone can create FSBO listings"
ON fsbo_listings FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update their own FSBO listings"
ON fsbo_listings FOR UPDATE
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND created_at > NOW() - INTERVAL '1 hour')
);

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete their own FSBO listings"
ON fsbo_listings FOR DELETE
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR (user_id IS NULL AND created_at > NOW() - INTERVAL '1 hour')
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_fsbo_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_fsbo_listings_updated_at_trigger
BEFORE UPDATE ON fsbo_listings
FOR EACH ROW
EXECUTE FUNCTION update_fsbo_listings_updated_at();

-- Create view for statistics
CREATE OR REPLACE VIEW fsbo_listing_stats AS
SELECT
  COUNT(*) as total_listings,
  COUNT(*) FILTER (WHERE status = 'active') as active_listings,
  AVG(asking_price) as average_price,
  MIN(asking_price) as min_price,
  MAX(asking_price) as max_price,
  COUNT(DISTINCT city) as cities_covered
FROM fsbo_listings;

-- Grant access to the view
GRANT SELECT ON fsbo_listing_stats TO authenticated, anon;
