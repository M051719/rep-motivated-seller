-- Create blog_posts table for managing blog content
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'RepMotivatedSeller Team',
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    featured_image_url TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    read_time TEXT DEFAULT '5 min read',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);

-- Create function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- Create trigger to auto-set published_at when published
CREATE OR REPLACE FUNCTION set_blog_post_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.published = true AND OLD.published = false THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_set_published_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_blog_post_published_at();

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can read published blog posts
CREATE POLICY "Public can view published blog posts"
    ON public.blog_posts
    FOR SELECT
    USING (published = true);

-- Authenticated users can view all their own blog posts
CREATE POLICY "Users can view their own blog posts"
    ON public.blog_posts
    FOR SELECT
    USING (auth.uid() = author_id);

-- Admin users can view all blog posts
CREATE POLICY "Admins can view all blog posts"
    ON public.blog_posts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Admin users can insert blog posts
CREATE POLICY "Admins can insert blog posts"
    ON public.blog_posts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Admin users can update blog posts
CREATE POLICY "Admins can update blog posts"
    ON public.blog_posts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Admin users can delete blog posts
CREATE POLICY "Admins can delete blog posts"
    ON public.blog_posts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Grant necessary permissions
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;

-- Create view for public blog posts with author info
CREATE OR REPLACE VIEW public.published_blog_posts AS
SELECT
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.content,
    bp.author_name,
    bp.category,
    bp.tags,
    bp.featured_image_url,
    bp.published_at,
    bp.read_time,
    bp.views,
    bp.created_at
FROM public.blog_posts bp
WHERE bp.published = true
ORDER BY bp.published_at DESC;

-- Grant access to view
GRANT SELECT ON public.published_blog_posts TO anon, authenticated;

-- Add helpful comments
COMMENT ON TABLE public.blog_posts IS 'Blog posts for the RepMotivatedSeller platform';
COMMENT ON COLUMN public.blog_posts.slug IS 'URL-friendly version of the title';
COMMENT ON COLUMN public.blog_posts.published IS 'Whether the post is visible to the public';
COMMENT ON COLUMN public.blog_posts.tags IS 'Array of tags for categorization and search';
