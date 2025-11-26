-- Test MailerLite to HubSpot Sync System

-- Check if sync functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%mailerlite%' OR routine_name LIKE '%hubspot%'
ORDER BY routine_name;

-- Check sync log table
SELECT COUNT(*) as total_syncs,
       COUNT(CASE WHEN success = true THEN 1 END) as successful,
       COUNT(CASE WHEN success = false THEN 1 END) as failed
FROM mailerlite_hubspot_sync_log;

-- Check submissions with MailerLite tracking
SELECT 
    id,
    contact_info->>'email' as email,
    mailerlite_subscriber_id,
    email_opened,
    email_clicked,
    created_at
FROM submissions
WHERE mailerlite_subscriber_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
