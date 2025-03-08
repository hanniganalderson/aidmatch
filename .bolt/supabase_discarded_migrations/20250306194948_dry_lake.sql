/*
  # Schools Table Setup and Data

  1. New Tables
    - Updates schools table structure
    - Adds sample university data
    
  2. Changes
    - Adds unique constraint on name and state
    - Inserts initial university data
    - Handles conflict resolution
*/

-- Update schools table constraints
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_name_state_key;
ALTER TABLE schools ADD CONSTRAINT schools_name_state_key UNIQUE (name, state);

-- Insert sample universities
INSERT INTO schools (name, state, type) VALUES
  ('Massachusetts Institute of Technology', 'Massachusetts', 'private'),
  ('Stanford University', 'California', 'private'),
  ('Harvard University', 'Massachusetts', 'private'),
  ('University of California, Berkeley', 'California', 'public'),
  ('Georgia Institute of Technology', 'Georgia', 'public'),
  ('University of Washington', 'Washington', 'public'),
  ('New York University', 'New York', 'private'),
  ('University of Illinois at Urbana-Champaign', 'Illinois', 'public'),
  ('University of Wisconsin-Madison', 'Wisconsin', 'public'),
  ('University of California, Los Angeles', 'California', 'public'),
  ('Cornell University', 'New York', 'private'),
  ('University of Pennsylvania', 'Pennsylvania', 'private'),
  ('Columbia University', 'New York', 'private'),
  ('Brown University', 'Rhode Island', 'private'),
  ('Dartmouth College', 'New Hampshire', 'private'),
  ('Northwestern University', 'Illinois', 'private'),
  ('University of Chicago', 'Illinois', 'private'),
  ('Johns Hopkins University', 'Maryland', 'private'),
  ('Rice University', 'Texas', 'private'),
  ('Vanderbilt University', 'Tennessee', 'private')
ON CONFLICT ON CONSTRAINT schools_name_state_key 
DO UPDATE SET 
  type = EXCLUDED.type,
  updated_at = now();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);