-- =====================================================
-- Blog View Counter Function
-- =====================================================
-- This migration adds a PostgreSQL function to increment
-- blog post view counts atomically

-- Function to increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_views(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_blog_views(uuid) TO authenticated;

-- Grant execute permission to anonymous users (for public viewing)
GRANT EXECUTE ON FUNCTION increment_blog_views(uuid) TO anon;

COMMENT ON FUNCTION increment_blog_views IS 'Atomically increments the view count for a blog post';
