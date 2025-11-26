-- First, let's see what columns exist in the profiles table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check current profiles structure
SELECT * FROM profiles LIMIT 5;

-- The user ID is usually linked to auth.users
-- Let's find your user ID from the auth.users table
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Once you know your user ID, use ONE of these methods:

-- METHOD 1: Set admin by user ID (most reliable)
-- Replace 'your-user-id-here' with your actual ID from auth.users
UPDATE profiles
SET is_admin = true
WHERE id = 'your-user-id-here';

-- METHOD 2: If profiles table has a user_id column that references auth.users
UPDATE profiles
SET is_admin = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@repmotivatedseller.shoprealestatespace.org'
);

-- METHOD 3: If profiles.id directly matches auth.users.id
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@repmotivatedseller.shoprealestatespace.org'
);

-- Verify the change
SELECT p.*, u.email
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.is_admin = true;
