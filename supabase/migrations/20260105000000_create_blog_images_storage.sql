-- =====================================================
-- Blog Images Storage Bucket Setup
-- =====================================================
-- This migration creates the storage bucket for blog images
-- and sets up the necessary security policies

-- Create the blog-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- =====================================================
-- Storage Policies for blog-images bucket
-- =====================================================

-- Policy: Anyone can view/download blog images (public access)
CREATE POLICY "Public Access for Blog Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Policy: Authenticated users can upload blog images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own uploaded images
CREATE POLICY "Users can update own blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can delete blog images
-- (In production, you might want to restrict this to admins only)
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- Additional bucket for user avatars (optional)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Avatar storage policies
CREATE POLICY "Public Access for Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- Helper function to get folder name from storage path
-- =====================================================

CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[] AS $$
  SELECT string_to_array(name, '/');
$$ LANGUAGE SQL IMMUTABLE;

COMMENT ON FUNCTION storage.foldername IS 'Extracts folder path components from storage object name';
