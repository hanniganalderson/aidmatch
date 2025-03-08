/*
  # Initial Schema Setup for AidMatch

  1. Tables
    - schools: Educational institutions
    - scholarships: Available scholarships
    - saved_scholarships: User-saved scholarships
    - user_profiles: User academic information
  
  2. Indexes
    - Optimized for search and filtering
    - Full-text search capabilities
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Schools table
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  state text NOT NULL,
  type text CHECK (type IN ('public', 'private', 'community')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Scholarships table
CREATE TABLE scholarships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  provider text NOT NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  deadline date,
  requirements text,
  difficulty_score integer CHECK (difficulty_score BETWEEN 0 AND 100),
  competition_level text CHECK (competition_level IN ('Low', 'Medium', 'High')),
  roi_score integer CHECK (roi_score >= 0),
  is_local boolean DEFAULT false,
  link text,
  gpa_requirement numeric(3,2) CHECK (gpa_requirement BETWEEN 0 AND 4.0),
  major text,
  state text,
  national boolean DEFAULT true,
  education_level text[],
  is_recurring boolean DEFAULT false,
  recurring_period text CHECK (recurring_period IN ('annual', 'biennial', 'other')),
  keywords text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(provider, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(requirements, '')), 'C')
  ) STORED
);

-- User profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  education_level text NOT NULL,
  school text NOT NULL,
  major text NOT NULL,
  gpa numeric(3,2) CHECK (gpa BETWEEN 0 AND 4.0),
  location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Saved scholarships table
CREATE TABLE saved_scholarships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  scholarship_id uuid REFERENCES scholarships ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

-- Create indexes
CREATE INDEX idx_schools_name_trgm ON schools USING gin(name gin_trgm_ops);
CREATE INDEX idx_schools_state ON schools(state);
CREATE INDEX idx_scholarships_search ON scholarships USING gin(search_vector);
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX idx_scholarships_amount ON scholarships(amount);
CREATE INDEX idx_scholarships_gpa ON scholarships(gpa_requirement);
CREATE INDEX idx_scholarships_major_trgm ON scholarships USING gin(major gin_trgm_ops);
CREATE INDEX idx_scholarships_state ON scholarships(state);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access to schools"
  ON schools FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to scholarships"
  ON scholarships FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read own profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own saved scholarships"
  ON saved_scholarships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save scholarships"
  ON saved_scholarships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave scholarships"
  ON saved_scholarships FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);