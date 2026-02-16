-- Migration to add expanded subcategories and analytics features

-- Add new subcategories (these can be used in the category dropdowns)
-- Marketing subcategories
-- Investment subcategories
-- Analysis subcategories

-- Create analytics view for most downloaded templates
CREATE OR REPLACE VIEW public.template_analytics AS
SELECT
    id,
    name,
    category,
    subcategory,
    download_count,
    is_featured,
    created_at,
    updated_at,
    CASE
        WHEN created_at > NOW() - INTERVAL '7 days' THEN 'new'
        WHEN download_count > 100 THEN 'popular'
        WHEN download_count > 50 THEN 'trending'
        ELSE 'standard'
    END as popularity_status
FROM public.templates_forms
WHERE is_active = true
ORDER BY download_count DESC;

-- Create user favorites table
CREATE TABLE IF NOT EXISTS public.user_template_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.templates_forms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- Create index for user favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_template_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_template_id ON public.user_template_favorites(template_id);

-- Enable RLS on favorites
ALTER TABLE public.user_template_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
    ON public.user_template_favorites
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
    ON public.user_template_favorites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
    ON public.user_template_favorites
    FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all favorites
CREATE POLICY "Admins can view all favorites"
    ON public.user_template_favorites
    FOR SELECT
    USING (public.check_is_admin(auth.uid()) = TRUE);

-- Function to toggle favorite
CREATE OR REPLACE FUNCTION toggle_template_favorite(template_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    favorite_exists BOOLEAN;
BEGIN
    -- Check if favorite exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_template_favorites
        WHERE user_id = auth.uid() AND template_id = template_uuid
    ) INTO favorite_exists;

    IF favorite_exists THEN
        -- Remove favorite
        DELETE FROM public.user_template_favorites
        WHERE user_id = auth.uid() AND template_id = template_uuid;
        RETURN FALSE;
    ELSE
        -- Add favorite
        INSERT INTO public.user_template_favorites (user_id, template_id)
        VALUES (auth.uid(), template_uuid);
        RETURN TRUE;
    END IF;
END;
$$;

-- Function to get user's favorites
CREATE OR REPLACE FUNCTION get_user_favorites()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    subcategory TEXT,
    file_url TEXT,
    download_count INTEGER,
    is_featured BOOLEAN,
    favorited_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tf.id,
        tf.name,
        tf.description,
        tf.category,
        tf.subcategory,
        tf.file_url,
        tf.download_count,
        tf.is_featured,
        utf.created_at as favorited_at
    FROM public.templates_forms tf
    INNER JOIN public.user_template_favorites utf ON tf.id = utf.template_id
    WHERE utf.user_id = auth.uid() AND tf.is_active = true
    ORDER BY utf.created_at DESC;
END;
$$;

-- Create template statistics table for detailed analytics
CREATE TABLE IF NOT EXISTS public.template_download_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates_forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_download_stats_template_id ON public.template_download_stats(template_id);
CREATE INDEX IF NOT EXISTS idx_download_stats_downloaded_at ON public.template_download_stats(downloaded_at DESC);

-- Enable RLS on download stats
ALTER TABLE public.template_download_stats ENABLE ROW LEVEL SECURITY;

-- Admins can view all download stats
CREATE POLICY "Admins can view download stats"
    ON public.template_download_stats
    FOR SELECT
    USING (public.check_is_admin(auth.uid()) = TRUE);

-- Anyone can insert download stats (for tracking)
CREATE POLICY "Anyone can insert download stats"
    ON public.template_download_stats
    FOR INSERT
    WITH CHECK (true);

-- Function to get trending templates (most downloads in last 30 days)
CREATE OR REPLACE FUNCTION get_trending_templates(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    subcategory TEXT,
    recent_downloads BIGINT,
    total_downloads INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tf.id,
        tf.name,
        tf.category,
        tf.subcategory,
        COUNT(tds.id) as recent_downloads,
        tf.download_count as total_downloads
    FROM public.templates_forms tf
    LEFT JOIN public.template_download_stats tds
        ON tf.id = tds.template_id
        AND tds.downloaded_at > NOW() - (days_back || ' days')::INTERVAL
    WHERE tf.is_active = true
    GROUP BY tf.id, tf.name, tf.category, tf.subcategory, tf.download_count
    HAVING COUNT(tds.id) > 0
    ORDER BY recent_downloads DESC
    LIMIT limit_count;
END;
$$;

-- Function to get category statistics
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
    category TEXT,
    subcategory TEXT,
    template_count BIGINT,
    total_downloads BIGINT,
    avg_downloads NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tf.category,
        tf.subcategory,
        COUNT(tf.id) as template_count,
        COALESCE(SUM(tf.download_count), 0) as total_downloads,
        COALESCE(AVG(tf.download_count), 0) as avg_downloads
    FROM public.templates_forms tf
    WHERE tf.is_active = true
    GROUP BY tf.category, tf.subcategory
    ORDER BY total_downloads DESC;
END;
$$;

-- Add favorite_count column to templates_forms for quick access
ALTER TABLE public.templates_forms ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;

-- Function to update favorite count
CREATE OR REPLACE FUNCTION update_template_favorite_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.templates_forms
        SET favorite_count = favorite_count + 1
        WHERE id = NEW.template_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.templates_forms
        SET favorite_count = GREATEST(favorite_count - 1, 0)
        WHERE id = OLD.template_id;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger to auto-update favorite count
CREATE TRIGGER trigger_update_favorite_count
    AFTER INSERT OR DELETE ON public.user_template_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_template_favorite_count();

-- Grant necessary permissions
GRANT SELECT ON public.template_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_template_favorite TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_favorites TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_templates TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_stats TO authenticated;
