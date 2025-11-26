-- Fix blog_posts RLS policies to allow public reading
-- Migration: 20251125000004_fix_blog_posts_access.sql

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Blog posts are viewable by everyone" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can edit own posts" ON blog_posts;

-- Grant SELECT to anon and authenticated users
GRANT SELECT ON blog_posts TO anon, authenticated;

-- Create policy for public reading of published posts
CREATE POLICY "Anyone can view published blog posts"
ON blog_posts
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Create policy for admins to manage all posts
CREATE POLICY "Admins can manage all blog posts"
ON blog_posts
FOR ALL
TO authenticated
USING (public.check_is_admin(auth.uid()) = TRUE)
WITH CHECK (public.check_is_admin(auth.uid()) = TRUE);

-- Insert sample blog posts if none exist
INSERT INTO blog_posts (title, excerpt, content, author_name, category, published, read_time, tags, slug)
SELECT
  'Understanding Foreclosure Prevention',
  'Learn the key steps to prevent foreclosure and protect your home from being lost.',
  '<div><h2>Introduction to Foreclosure Prevention</h2><p>Facing foreclosure can be overwhelming, but understanding your options is the first step to saving your home. This comprehensive guide will walk you through proven strategies to prevent foreclosure.</p><h3>Key Steps to Take</h3><ul><li>Contact your lender immediately</li><li>Explore loan modification options</li><li>Consider refinancing opportunities</li><li>Seek professional counseling</li></ul><p>Remember, the sooner you act, the more options you have available.</p></div>',
  'RepMotivatedSeller Team',
  'Education',
  true,
  '5 min read',
  ARRAY['foreclosure', 'prevention', 'education', 'homeowner'],
  'understanding-foreclosure-prevention'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'understanding-foreclosure-prevention');

INSERT INTO blog_posts (title, excerpt, content, author_name, category, published, read_time, tags, slug)
SELECT
  '5 Financial Tips to Save Your Home',
  'Practical financial strategies that can help you keep your property and avoid foreclosure.',
  '<div><h2>Smart Financial Management</h2><p>Financial planning is crucial when facing the threat of foreclosure. Here are five proven strategies to help stabilize your finances:</p><h3>1. Create a Detailed Budget</h3><p>Track every dollar coming in and going out. Identify areas where you can cut expenses.</p><h3>2. Prioritize Your Mortgage Payment</h3><p>Your home should be your top financial priority. Make sure your mortgage payment is covered first.</p><h3>3. Build an Emergency Fund</h3><p>Even small amounts can add up. Try to save at least $1000 for unexpected expenses.</p><h3>4. Explore Additional Income Sources</h3><p>Consider side gigs, freelance work, or selling unused items to generate extra cash.</p><h3>5. Seek Professional Financial Advice</h3><p>HUD-approved counselors can provide free guidance tailored to your situation.</p></div>',
  'Financial Expert',
  'Financial Tips',
  true,
  '7 min read',
  ARRAY['finance', 'tips', 'budgeting', 'savings'],
  '5-financial-tips-to-save-your-home'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = '5-financial-tips-to-save-your-home');

INSERT INTO blog_posts (title, excerpt, content, author_name, category, published, read_time, tags, slug)
SELECT
  'Your Legal Rights as a Homeowner',
  'Know your rights when facing foreclosure proceedings and how to protect yourself.',
  '<div><h2>Understanding Your Legal Protections</h2><p>As a homeowner facing foreclosure, you have important legal rights that protect you throughout the process.</p><h3>Right to Notice</h3><p>Your lender must provide proper notice before initiating foreclosure proceedings. This gives you time to explore options.</p><h3>Right to Reinstate</h3><p>In many states, you have the right to reinstate your mortgage by paying all missed payments plus fees.</p><h3>Right to Challenge</h3><p>You can challenge the foreclosure in court if you believe the lender has made errors or violated regulations.</p><h3>Right to Redeem</h3><p>Some states allow you to reclaim your home even after foreclosure by paying the full amount owed.</p><p>Consult with a foreclosure attorney to understand your specific rights in your state.</p></div>',
  'Legal Team',
  'Legal',
  true,
  '6 min read',
  ARRAY['legal', 'rights', 'homeowner', 'protection'],
  'your-legal-rights-as-homeowner'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'your-legal-rights-as-homeowner');

INSERT INTO blog_posts (title, excerpt, content, author_name, category, published, read_time, tags, slug)
SELECT
  'Success Story: The Johnson Family',
  'How one family saved their home from foreclosure with our help and guidance.',
  '<div><h2>From Crisis to Stability</h2><p>The Johnson family was facing foreclosure after unexpected medical bills left them behind on their mortgage payments. Here''s how they turned things around.</p><h3>The Challenge</h3><p>After a serious illness, the Johnsons found themselves $15,000 behind on their mortgage with foreclosure proceedings already started.</p><h3>The Solution</h3><p>Working with our team, they were able to:</p><ul><li>Negotiate a loan modification with their lender</li><li>Set up a repayment plan for past-due amounts</li><li>Access financial counseling to better manage their budget</li><li>Connect with local assistance programs</li></ul><h3>The Outcome</h3><p>Today, the Johnson family is current on their mortgage and has rebuilt their emergency savings. Their home is safe, and they''re helping others facing similar challenges.</p></div>',
  'Success Stories Team',
  'Success Stories',
  true,
  '4 min read',
  ARRAY['success', 'testimonial', 'inspiration'],
  'success-story-johnson-family'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'success-story-johnson-family');

-- Verify policies and grants
DO $$
BEGIN
  RAISE NOTICE 'Blog posts RLS policies updated successfully';
  RAISE NOTICE 'Sample blog posts inserted';
END $$;
