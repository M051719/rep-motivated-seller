-- Create blog comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  parent_comment_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(blog_post_id);
CREATE INDEX idx_blog_comments_status ON public.blog_comments(status);
CREATE INDEX idx_blog_comments_created_at ON public.blog_comments(created_at DESC);
CREATE INDEX idx_blog_comments_parent_id ON public.blog_comments(parent_comment_id);

-- Add comment count to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_blog_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE public.blog_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.blog_post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE public.blog_posts
      SET comment_count = comment_count + 1
      WHERE id = NEW.blog_post_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE public.blog_posts
      SET comment_count = GREATEST(comment_count - 1, 0)
      WHERE id = NEW.blog_post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE public.blog_posts
    SET comment_count = GREATEST(comment_count - 1, 0)
    WHERE id = OLD.blog_post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comment count
DROP TRIGGER IF EXISTS trigger_update_comment_count ON public.blog_comments;
CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR UPDATE OR DELETE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION update_blog_post_comment_count();

-- RLS Policies

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Public can view approved comments
CREATE POLICY "Public can view approved comments"
  ON public.blog_comments
  FOR SELECT
  USING (status = 'approved');

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.blog_comments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
  );

-- Users can view their own comments regardless of status
CREATE POLICY "Users can view their own comments"
  ON public.blog_comments
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Users can update their own pending comments
CREATE POLICY "Users can update their own pending comments"
  ON public.blog_comments
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.blog_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
  ON public.blog_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update any comment (for moderation)
CREATE POLICY "Admins can moderate comments"
  ON public.blog_comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete any comment
CREATE POLICY "Admins can delete comments"
  ON public.blog_comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant permissions
GRANT SELECT ON public.blog_comments TO anon;
GRANT ALL ON public.blog_comments TO authenticated;

-- Function to get comment thread (with replies)
CREATE OR REPLACE FUNCTION get_comment_thread(post_id UUID)
RETURNS TABLE (
  id UUID,
  blog_post_id UUID,
  user_id UUID,
  author_name VARCHAR(255),
  content TEXT,
  status VARCHAR(20),
  parent_comment_id UUID,
  created_at TIMESTAMPTZ,
  reply_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.blog_post_id,
    c.user_id,
    c.author_name,
    c.content,
    c.status,
    c.parent_comment_id,
    c.created_at,
    (SELECT COUNT(*) FROM public.blog_comments replies
     WHERE replies.parent_comment_id = c.id AND replies.status = 'approved') as reply_count
  FROM public.blog_comments c
  WHERE c.blog_post_id = post_id
    AND c.status = 'approved'
    AND c.parent_comment_id IS NULL
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_comment_thread(UUID) TO anon, authenticated;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
