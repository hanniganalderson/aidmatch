/*
  # Fix Schools Table Structure

  1. Changes
    - Add missing columns for school data
    - Add constraints for data integrity
    - Update indexes for performance

  2. Data
    - Add sample schools data
*/

-- Drop existing indexes that might conflict
DROP INDEX IF EXISTS schools_search_idx;
DROP INDEX IF EXISTS schools_name_trgm_idx;
DROP INDEX IF EXISTS schools_city_trgm_idx;

-- Recreate schools table with proper structure
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text NOT NULL,
  type text CHECK (type IN ('public', 'private', 'community')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Create policy for reading schools
CREATE POLICY "Anyone can read schools"
  ON schools
  FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state);

-- Add trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_schools_name_trgm ON schools USING gin(name gin_trgm_ops);

-- Insert sample schools data
INSERT INTO schools (name, city, state, type) VALUES
  ('Massachusetts Institute of Technology', 'Cambridge', 'Massachusetts', 'private'),
  ('Stanford University', 'Stanford', 'California', 'private'),
  ('Harvard University', 'Cambridge', 'Massachusetts', 'private'),
  ('University of California, Berkeley', 'Berkeley', 'California', 'public'),
  ('Georgia Institute of Technology', 'Atlanta', 'Georgia', 'public'),
  ('University of Michigan', 'Ann Arbor', 'Michigan', 'public'),
  ('Yale University', 'New Haven', 'Connecticut', 'private'),
  ('Princeton University', 'Princeton', 'New Jersey', 'private'),
  ('Duke University', 'Durham', 'North Carolina', 'private'),
  ('University of Texas at Austin', 'Austin', 'Texas', 'public')
ON CONFLICT (id) DO NOTHING;