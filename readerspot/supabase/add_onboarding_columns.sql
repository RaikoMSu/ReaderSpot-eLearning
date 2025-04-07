-- Add has_completed_onboarding column to user_preferences if it doesn't exist
ALTER TABLE IF EXISTS user_preferences 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Ensure has_completed_onboarding column exists in user_profiles
ALTER TABLE IF EXISTS user_profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Update any existing records to ensure consistency
UPDATE user_profiles
SET has_completed_onboarding = (
  SELECT has_completed_onboarding 
  FROM user_preferences 
  WHERE user_preferences.user_id = user_profiles.user_id
)
WHERE EXISTS (
  SELECT 1 
  FROM user_preferences 
  WHERE user_preferences.user_id = user_profiles.user_id
  AND user_preferences.has_completed_onboarding = true
);

-- Insert user_preferences records for any users missing them
INSERT INTO user_preferences (user_id, has_completed_onboarding)
SELECT user_id, has_completed_onboarding
FROM user_profiles
WHERE user_id NOT IN (SELECT user_id FROM user_preferences)
AND user_id IS NOT NULL; 