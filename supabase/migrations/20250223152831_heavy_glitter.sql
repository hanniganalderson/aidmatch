/*
  # Fix Schools Table Structure

  1. Changes
    - Drop and recreate schools table with correct structure
    - Add proper indexes for performance
    - Add sample data for testing
  
  2. Security
    - Enable RLS
    - Add policy for public read access
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS schools;

-- Create schools table with correct structure
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
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
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_state ON schools(state);
CREATE INDEX idx_schools_city ON schools(city);

-- Add trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_schools_name_trgm ON schools USING gin(name gin_trgm_ops);
CREATE INDEX idx_schools_city_trgm ON schools USING gin(city gin_trgm_ops);

-- Insert sample data
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
  ('University of Texas at Austin', 'Austin', 'Texas', 'public'),
  ('Columbia University', 'New York', 'New York', 'private'),
  ('University of Washington', 'Seattle', 'Washington', 'public'),
  ('University of Illinois', 'Urbana', 'Illinois', 'public'),
  ('Ohio State University', 'Columbus', 'Ohio', 'public'),
  ('University of Florida', 'Gainesville', 'Florida', 'public')
ON CONFLICT (id) DO NOTHING;