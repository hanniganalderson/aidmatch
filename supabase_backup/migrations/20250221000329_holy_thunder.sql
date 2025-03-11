/*
  # Initial Schema Setup for AidMatch

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - created_at (timestamp)
      - last_login (timestamp)
    
    - user_profiles
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - gpa (numeric)
      - major (text)
      - location (text)
      - education_level (text)
      - household_income (numeric)
      - created_at (timestamp)
    
    - scholarships
      - id (uuid, primary key)
      - name (text)
      - provider (text)
      - amount (numeric)
      - deadline (date)
      - description (text)
      - requirements (jsonb)
      - roi_score (numeric)
      - created_at (timestamp)
    
    - saved_scholarships
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - scholarship_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  gpa numeric CHECK (gpa >= 0 AND gpa <= 4.0),
  major text,
  location text,
  education_level text CHECK (education_level IN ('highschool', 'college')),
  household_income numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  amount numeric NOT NULL,
  deadline date NOT NULL,
  description text,
  requirements jsonb DEFAULT '{}',
  roi_score numeric CHECK (roi_score >= 0 AND roi_score <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scholarships"
  ON scholarships
  FOR SELECT
  TO authenticated
  USING (true);

-- Saved Scholarships table
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id uuid REFERENCES scholarships(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;

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