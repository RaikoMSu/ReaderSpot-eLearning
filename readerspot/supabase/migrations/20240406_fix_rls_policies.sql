-- Fix Row Level Security policies for user_profiles table
-- This allows newly registered users to create their profiles

-- Drop existing RLS policies for user_profiles to recreate them
DROP POLICY IF EXISTS "Users can view own profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.user_profiles;

-- Create improved policies with better security
-- Allow users to view their own profiles
CREATE POLICY "Users can view own profiles"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create their own profiles during registration
-- This policy is important for the signup process
CREATE POLICY "Users can create profiles during registration"
ON public.user_profiles FOR INSERT
WITH CHECK (
  -- Either the user is authenticated and creating their own profile
  (auth.uid() = user_id) OR
  -- Or the user is in the process of being created (special case for signup)
  (auth.role() = 'anon' AND user_id IN (SELECT id FROM auth.users WHERE id = user_id))
);

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profiles"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 