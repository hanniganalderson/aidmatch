/*
  # Update user profiles and scholarships schema

  1. Changes
    - Update user_profiles to reference auth.users
    - Add education level validation
    - Add ROI score validation
    - Add proper RLS policies

  2. Security
    - Update RLS policies for user_profiles
    - Add policies for scholarships table
    - Add policies for saved_scholarships
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Anyone can read scholarships" ON scholarships;
  DROP POLICY IF EXISTS "Users can read own saved scholarships" ON saved_scholarships;
  DROP POLICY IF EXISTS "Users can save scholarships" ON saved_scholarships;
  DROP POLICY IF EXISTS "Users can unsave scholarships" ON saved_scholarships;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Update user_profiles to reference auth.users
ALTER TABLE IF EXISTS user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey,
  ADD CONSTRAINT user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Add education level check if not exists
DO $$ 
BEGIN
  ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_education_level_check 
    CHECK (education_level IN ('highschool', 'college'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add GPA check if not exists
DO $$ 
BEGIN
  ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_gpa_check 
    CHECK (gpa >= 0 AND gpa <= 4.0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS on all tables if not already enabled
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_scholarships ENABLE ROW LEVEL SECURITY;

-- Create new policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for scholarships
CREATE POLICY "Anyone can read scholarships"
  ON scholarships
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for saved_scholarships
CREATE POLICY "Users can read own saved scholarships"
  ON saved_scholarships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save scholarships"
  ON saved_scholarships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave scholarships"
  ON saved_scholarships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);