-- Check blog_posts table and create some sample posts if none exist
-- Run this manually in Supabase SQL Editor

-- First check if any posts exist
SELECT COUNT(*) as post_count FROM blog_posts;

-- If no posts, insert sample posts
INSERT INTO blog_posts (title, excerpt, content, author_name, author_id, category, published, read_time, tags, slug)
VALUES
  ('Understanding Foreclosure Prevention', 'Learn the key steps to prevent foreclosure and protect your home.', '<p>Complete guide to foreclosure prevention...</p>', 'RepMotivatedSeller Team', NULL, 'Education', true, '5 min read', ARRAY['foreclosure', 'prevention', 'education'], 'understanding-foreclosure-prevention'),
  ('5 Financial Tips to Save Your Home', 'Practical financial strategies that can help you keep your property.', '<p>Financial management tips...</p>', 'RepMotivatedSeller Team', NULL, 'Financial Tips', true, '7 min read', ARRAY['finance', 'tips', 'budgeting'], '5-financial-tips-to-save-your-home'),
  ('Your Legal Rights as a Homeowner', 'Know your rights when facing foreclosure proceedings.', '<p>Legal rights and protections...</p>', 'RepMotivatedSeller Team', NULL, 'Legal', true, '6 min read', ARRAY['legal', 'rights', 'homeowner'], 'your-legal-rights-as-homeowner')
ON CONFLICT DO NOTHING;
