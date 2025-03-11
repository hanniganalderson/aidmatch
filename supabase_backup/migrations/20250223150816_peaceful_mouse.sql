/*
  # Fix Schools Table Structure

  1. Changes
    - Drop and recreate schools table with correct structure
    - Add proper constraints and indexes
    - Insert initial school data

  2. Security
    - Enable RLS
    - Add policy for reading schools
*/

-- Drop existing table and start fresh
DROP TABLE IF EXISTS schools;

-- Create schools table with correct structure
CREATE TABLE schools (
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
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_state ON schools(state);

-- Add trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_schools_name_trgm ON schools USING gin(name gin_trgm_ops);

-- Insert initial school data
INSERT INTO schools (name, state, type) VALUES
  ('Massachusetts Institute of Technology', 'Massachusetts', 'private'),
  ('Stanford University', 'California', 'private'),
  ('Harvard University', 'Massachusetts', 'private'),
  ('University of California, Berkeley', 'California', 'public'),
  ('Georgia Institute of Technology', 'Georgia', 'public'),
  ('University of Michigan', 'Michigan', 'public'),
  ('Yale University', 'Connecticut', 'private'),
  ('Princeton University', 'New Jersey', 'private'),
  ('Duke University', 'North Carolina', 'private'),
  ('University of Texas at Austin', 'Texas', 'public'),
  ('Columbia University', 'New York', 'private'),
  ('University of Washington', 'Washington', 'public'),
  ('University of Illinois', 'Illinois', 'public'),
  ('Ohio State University', 'Ohio', 'public'),
  ('University of Florida', 'Florida', 'public')
ON CONFLICT (id) DO NOTHING;