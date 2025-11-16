-- Manual upgrade to Pro - Run this in Supabase SQL editor
-- First get your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then run this with your actual user ID (replace the UUID below)
-- Copy your user ID from the query above and paste it here:

INSERT INTO user_subscriptions (user_id, plan_name, status, cancel_at_period_end) 
VALUES (
  '00000000-0000-0000-0000-000000000000', -- REPLACE THIS WITH YOUR ACTUAL USER ID
  'pro', 
  'active', 
  false
) 
ON CONFLICT (user_id) 
DO UPDATE SET 
  plan_name = 'pro', 
  status = 'active', 
  cancel_at_period_end = false,
  updated_at = NOW();

-- Verify the upgrade worked
SELECT user_id, plan_name, status, created_at FROM user_subscriptions;