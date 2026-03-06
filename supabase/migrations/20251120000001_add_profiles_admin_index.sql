-- Ensure profiles admin lookup index exists after profiles table creation
CREATE INDEX IF NOT EXISTS idx_profiles_id_is_admin
ON public.profiles(id, is_admin)
WHERE is_admin = true;
