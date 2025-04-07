-- Add missing columns to user_preferences table
ALTER TABLE IF EXISTS public.user_preferences
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS target_language TEXT,
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Remove NOT NULL constraints from existing columns
ALTER TABLE IF EXISTS public.user_preferences
ALTER COLUMN target_language DROP NOT NULL,
ALTER COLUMN preferred_genres DROP NOT NULL;

-- Create function to create user_preferences entry when a new user_profile is created
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id)
  DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON public.user_profiles;

-- Create trigger to automatically create user_preferences entry
CREATE TRIGGER create_user_preferences_trigger
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION create_user_preferences(); 