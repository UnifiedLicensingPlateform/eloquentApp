-- Fix subscription issue - Simple check and setup
-- Run this in your Supabase SQL editor

-- Just check if table exists and show current subscriptions
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') 
    THEN 'user_subscriptions table exists ✅'
    ELSE 'user_subscriptions table missing ❌'
  END as table_status;

-- Show current subscriptions (if any)
SELECT 
  us.user_id,
  us.plan_name,
  us.status,
  us.created_at,
  au.email
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
ORDER BY us.created_at DESC
LIMIT 10;