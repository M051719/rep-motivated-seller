-- Migration: Education Dashboard System
-- Created: 2025-12-13
-- Description: Tables for courses, user progress, templates, and learning analytics

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT NOT NULL, -- e.g., '45 min', '1.5 hrs'
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT NOT NULL, -- e.g., 'Foreclosure Prevention', 'Credit Repair'
    thumbnail_url TEXT,
    video_url TEXT,
    tier_required TEXT NOT NULL CHECK (tier_required IN ('free', 'entrepreneur', 'professional', 'enterprise')),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user course progress table
CREATE TABLE IF NOT EXISTS public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed BOOLEAN DEFAULT false,
    last_accessed_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.user_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS public.education_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Letter', 'Contract', 'Report', etc.
    description TEXT,
    content TEXT, -- Template content or file reference
    file_url TEXT,
    tier_required TEXT NOT NULL CHECK (tier_required IN ('free', 'entrepreneur', 'professional', 'enterprise')),
    category TEXT,
    downloads_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user template downloads tracking
CREATE TABLE IF NOT EXISTS public.user_template_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.education_templates(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- Create user study sessions for tracking
CREATE TABLE IF NOT EXISTS public.user_study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    session_date DATE DEFAULT CURRENT_DATE,
    minutes_studied INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create families helped tracking table
CREATE TABLE IF NOT EXISTS public.user_families_helped (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_name TEXT,
    help_date DATE DEFAULT CURRENT_DATE,
    service_type TEXT, -- 'Foreclosure Prevention', 'Credit Repair', 'Wholesale', etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON public.user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON public.user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON public.user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_downloads_user_id ON public.user_template_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_sessions_user_id ON public.user_study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_sessions_date ON public.user_study_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_user_families_helped_user_id ON public.user_families_helped(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_tier ON public.courses(tier_required);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON public.education_templates(tier_required);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_template_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_families_helped ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read for published courses)
CREATE POLICY "Anyone can view published courses"
    ON public.courses FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can manage courses"
    ON public.courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for user progress (users can only see their own)
CREATE POLICY "Users can view their own progress"
    ON public.user_course_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON public.user_course_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON public.user_course_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates"
    ON public.user_certificates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert certificates"
    ON public.user_certificates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for templates (public read)
CREATE POLICY "Anyone can view active templates"
    ON public.education_templates FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage templates"
    ON public.education_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for template downloads
CREATE POLICY "Users can view their own downloads"
    ON public.user_template_downloads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can track their downloads"
    ON public.user_template_downloads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study sessions
CREATE POLICY "Users can view their own study sessions"
    ON public.user_study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON public.user_study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
    ON public.user_study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for families helped
CREATE POLICY "Users can view their own families helped"
    ON public.user_families_helped FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert families helped"
    ON public.user_families_helped FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update families helped"
    ON public.user_families_helped FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete families helped"
    ON public.user_families_helped FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $'$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$'$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at BEFORE UPDATE ON public.user_course_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_templates_updated_at BEFORE UPDATE ON public.education_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for user education stats
CREATE OR REPLACE VIEW public.user_education_stats AS
SELECT 
    ucp.user_id,
    COUNT(DISTINCT ucp.course_id) FILTER (WHERE ucp.completed = true) as courses_completed,
    COUNT(DISTINCT c.id) as total_courses_available,
    COUNT(DISTINCT uc.id) as certificates_earned,
    COALESCE(SUM(uss.minutes_studied), 0) as total_study_minutes,
    COUNT(DISTINCT uss.session_date) as total_study_days,
    COALESCE(
        (SELECT COUNT(*) 
         FROM generate_series(
             CURRENT_DATE - INTERVAL '30 days',
             CURRENT_DATE,
             '1 day'::interval
         ) AS date
         WHERE date::date IN (
             SELECT session_date 
             FROM public.user_study_sessions 
             WHERE user_id = ucp.user_id
             AND session_date >= CURRENT_DATE - INTERVAL '30 days'
         )),
        0
    ) as current_streak_days,
    COUNT(DISTINCT ufh.id) as families_helped
FROM public.user_course_progress ucp
LEFT JOIN public.courses c ON true
LEFT JOIN public.user_certificates uc ON uc.user_id = ucp.user_id
LEFT JOIN public.user_study_sessions uss ON uss.user_id = ucp.user_id
LEFT JOIN public.user_families_helped ufh ON ufh.user_id = ucp.user_id
GROUP BY ucp.user_id;

-- Grant permissions
GRANT SELECT ON public.courses TO authenticated;
GRANT ALL ON public.user_course_progress TO authenticated;
GRANT ALL ON public.user_certificates TO authenticated;
GRANT SELECT ON public.education_templates TO authenticated;
GRANT ALL ON public.user_template_downloads TO authenticated;
GRANT ALL ON public.user_study_sessions TO authenticated;
GRANT ALL ON public.user_families_helped TO authenticated;
GRANT SELECT ON public.user_education_stats TO authenticated;

-- Seed initial courses
INSERT INTO public.courses (title, description, duration, level, category, tier_required) VALUES
('Hardship Letter Writing Mastery', 'Learn to write compelling hardship letters that get results', '45 min', 'beginner', 'Foreclosure Prevention', 'free'),
('Wholesale Contract Essentials', 'Master the fundamentals of wholesale real estate contracts', '1.5 hrs', 'intermediate', 'Wholesale', 'entrepreneur'),
('Platform Walkthrough', 'Complete guide to using RepMotivatedSeller platform features', '30 min', 'beginner', 'Platform Training', 'free'),
('AI-Assisted Report Generation', 'Learn to leverage AI tools for professional property reports', '1 hr', 'intermediate', 'Technology', 'professional'),
('Foreclosure Prevention Strategies', 'Comprehensive strategies for helping families avoid foreclosure', '2 hrs', 'intermediate', 'Foreclosure Prevention', 'free'),
('Credit Repair Fundamentals', 'Understanding credit repair processes and regulations', '1 hr', 'beginner', 'Credit Repair', 'entrepreneur')
ON CONFLICT DO NOTHING;

-- Seed initial templates
INSERT INTO public.education_templates (name, type, description, tier_required, category) VALUES
('Hardship Letter Template', 'Letter', 'Professional hardship letter template', 'free', 'Letters'),
('Wholesale Purchase Agreement', 'Contract', 'Standard wholesale contract', 'entrepreneur', 'Contracts'),
('Assignment Contract', 'Contract', 'Assignment of contract template', 'entrepreneur', 'Contracts'),
('Property Analysis Report', 'Report', 'Comprehensive property analysis', 'professional', 'Reports'),
('Loan Modification Request', 'Letter', 'Loan modification request letter', 'free', 'Letters'),
('Deed in Lieu Agreement', 'Contract', 'Deed in lieu of foreclosure', 'professional', 'Contracts')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.courses IS 'Educational courses available on the platform';
COMMENT ON TABLE public.user_course_progress IS 'Tracks individual user progress through courses';
COMMENT ON TABLE public.user_certificates IS 'Certificates earned by users upon course completion';
COMMENT ON TABLE public.education_templates IS 'Document templates available for download';
COMMENT ON TABLE public.user_template_downloads IS 'Tracks template download history';
COMMENT ON TABLE public.user_study_sessions IS 'Tracks daily study time for streak calculations';
COMMENT ON TABLE public.user_families_helped IS 'Records families helped by each user';
