/*
  # Schools Database Setup

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `city` (text, not null)
      - `state` (text, not null)
      - `type` (text, check constraint for school types)
      - `created_at` (timestamp)

  2. Indexes
    - GiST indexes for fast text search on name and city
    - B-tree index on state for exact matches
*/

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  type text CHECK (type IN ('public', 'private', 'community')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Create policy for reading schools
CREATE POLICY "Anyone can read schools"
  ON schools
  FOR SELECT
  USING (true);

-- Create GiST indexes for fast text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_schools_name_trgm ON schools USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_city_trgm ON schools USING gin(city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state);

-- Insert initial data from Department of Education
INSERT INTO schools (name, city, state, type) VALUES
  ('Massachusetts Institute of Technology', 'Cambridge', 'Massachusetts', 'private'),
  ('Stanford University', 'Stanford', 'California', 'private'),
  ('Harvard University', 'Cambridge', 'Massachusetts', 'private'),
  ('University of California, Berkeley', 'Berkeley', 'California', 'public'),
  ('Georgia Institute of Technology', 'Atlanta', 'Georgia', 'public')
ON CONFLICT (id) DO NOTHING;