-- Add SEO metadata fields to blog_posts table

-- Meta title (custom page title for search engines)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(70);

-- Meta description (for search engine results)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);

-- Meta keywords (comma-separated keywords)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

-- Open Graph image (for social media sharing)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Open Graph title (can be different from page title)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS og_title VARCHAR(100);

-- Open Graph description (can be different from meta description)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS og_description VARCHAR(200);

-- Twitter card type
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS twitter_card_type VARCHAR(50) DEFAULT 'summary_large_image';

-- Canonical URL (for duplicate content management)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Robots meta tag (for search engine crawling control)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS robots_meta VARCHAR(100) DEFAULT 'index, follow';

-- Schema.org markup type (Article, BlogPosting, NewsArticle, etc.)
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS schema_type VARCHAR(50) DEFAULT 'BlogPosting';

-- Add comments to document the fields
COMMENT ON COLUMN public.blog_posts.meta_title IS 'SEO: Custom page title (max 70 chars recommended)';
COMMENT ON COLUMN public.blog_posts.meta_description IS 'SEO: Meta description for search results (max 160 chars recommended)';
COMMENT ON COLUMN public.blog_posts.meta_keywords IS 'SEO: Comma-separated keywords for this post';
COMMENT ON COLUMN public.blog_posts.og_image_url IS 'Social Media: Open Graph image URL (1200x630px recommended)';
COMMENT ON COLUMN public.blog_posts.og_title IS 'Social Media: Open Graph title (can differ from page title)';
COMMENT ON COLUMN public.blog_posts.og_description IS 'Social Media: Open Graph description (can differ from meta description)';
COMMENT ON COLUMN public.blog_posts.twitter_card_type IS 'Social Media: Twitter card type (summary, summary_large_image, etc.)';
COMMENT ON COLUMN public.blog_posts.canonical_url IS 'SEO: Canonical URL for duplicate content management';
COMMENT ON COLUMN public.blog_posts.robots_meta IS 'SEO: Robots meta tag (index/noindex, follow/nofollow)';
COMMENT ON COLUMN public.blog_posts.schema_type IS 'SEO: Schema.org type (BlogPosting, Article, NewsArticle, etc.)';

-- Create index for SEO analytics
CREATE INDEX IF NOT EXISTS idx_blog_posts_robots_meta ON public.blog_posts(robots_meta);

-- Add trigger to auto-populate SEO fields if not provided
CREATE OR REPLACE FUNCTION auto_populate_seo_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate meta_title if not provided
  IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
    NEW.meta_title := LEFT(NEW.title, 70);
  END IF;

  -- Auto-populate meta_description if not provided
  IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
    NEW.meta_description := LEFT(NEW.excerpt, 160);
  END IF;

  -- Auto-populate og_title if not provided
  IF NEW.og_title IS NULL OR NEW.og_title = '' THEN
    NEW.og_title := LEFT(NEW.title, 100);
  END IF;

  -- Auto-populate og_description if not provided
  IF NEW.og_description IS NULL OR NEW.og_description = '' THEN
    NEW.og_description := LEFT(NEW.excerpt, 200);
  END IF;

  -- Auto-populate og_image_url if not provided but featured_image_url exists
  IF (NEW.og_image_url IS NULL OR NEW.og_image_url = '') AND NEW.featured_image_url IS NOT NULL THEN
    NEW.og_image_url := NEW.featured_image_url;
  END IF;

  -- Auto-populate canonical_url if not provided
  IF NEW.canonical_url IS NULL OR NEW.canonical_url = '' THEN
    NEW.canonical_url := 'https://repmotivatedseller.com/blog/' || NEW.slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-populating SEO fields
DROP TRIGGER IF EXISTS trigger_auto_populate_seo_fields ON public.blog_posts;
CREATE TRIGGER trigger_auto_populate_seo_fields
BEFORE INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION auto_populate_seo_fields();

-- Backfill existing posts with SEO data
UPDATE public.blog_posts
SET
  meta_title = COALESCE(meta_title, LEFT(title, 70)),
  meta_description = COALESCE(meta_description, LEFT(excerpt, 160)),
  og_title = COALESCE(og_title, LEFT(title, 100)),
  og_description = COALESCE(og_description, LEFT(excerpt, 200)),
  og_image_url = COALESCE(og_image_url, featured_image_url),
  canonical_url = COALESCE(canonical_url, 'https://repmotivatedseller.com/blog/' || slug),
  twitter_card_type = COALESCE(twitter_card_type, 'summary_large_image'),
  robots_meta = COALESCE(robots_meta, 'index, follow'),
  schema_type = COALESCE(schema_type, 'BlogPosting')
WHERE meta_title IS NULL
   OR meta_description IS NULL
   OR og_title IS NULL
   OR og_description IS NULL;
