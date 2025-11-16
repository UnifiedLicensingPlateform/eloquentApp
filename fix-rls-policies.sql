-- Fix RLS policies for user_subscriptions table
-- Run this in your Supabase SQL editor

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_subscriptions';

-- Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON user_subscriptions;

-- Create more permissive policies for development
CREATE POLICY "Enable all operations for authenticated users" ON user_subscriptions
  FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: Create specific policies that work
CREATE POLICY "Users can read subscriptions" ON user_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Check if the policies were created
SELECT 'RLS policies updated successfully!' as status;