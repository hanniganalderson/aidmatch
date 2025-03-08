/*
  # Schools Table Setup

  1. New Tables
    - `schools` table for storing educational institutions
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `state` (text, required) 
      - `type` (text, enum: public/private/community)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Indexes
    - Primary key on id
    - Name search optimization
    - State filtering optimization
    - Full text search capabilities
  
  3. Security
    - Enable RLS
    - Allow public read access
*/

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS schools_search_idx;
DROP INDEX IF EXISTS schools_name_trgm_idx;

-- Drop and recreate schools table with proper structure
DROP TABLE IF EXISTS schools;
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
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
  ('University of Texas at Austin', 'Texas', 'public')
ON CONFLICT (id) DO NOTHING;