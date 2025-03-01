/*
  # Update Schools Data

  1. Changes
    - Add more sample schools data
    - Update conflict handling for upserts
*/

-- Update conflict handling for schools
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_name_city_state_key;
ALTER TABLE schools ADD CONSTRAINT schools_name_city_state_key UNIQUE (name, city, state);

-- Insert more sample schools
INSERT INTO schools (name, city, state, type) VALUES
  ('University of Michigan', 'Ann Arbor', 'Michigan', 'public'),
  ('Yale University', 'New Haven', 'Connecticut', 'private'),
  ('Princeton University', 'Princeton', 'New Jersey', 'private'),
  ('Duke University', 'Durham', 'North Carolina', 'private'),
  ('University of Texas at Austin', 'Austin', 'Texas', 'public'),
  ('University of Washington', 'Seattle', 'Washington', 'public'),
  ('New York University', 'New York City', 'New York', 'private'),
  ('University of Illinois at Urbana-Champaign', 'Champaign', 'Illinois', 'public'),
  ('University of Wisconsin-Madison', 'Madison', 'Wisconsin', 'public'),
  ('University of California, Los Angeles', 'Los Angeles', 'California', 'public'),
  ('Cornell University', 'Ithaca', 'New York', 'private'),
  ('University of Pennsylvania', 'Philadelphia', 'Pennsylvania', 'private'),
  ('Columbia University', 'New York City', 'New York', 'private'),
  ('Brown University', 'Providence', 'Rhode Island', 'private'),
  ('Dartmouth College', 'Hanover', 'New Hampshire', 'private'),
  ('Northwestern University', 'Evanston', 'Illinois', 'private'),
  ('University of Chicago', 'Chicago', 'Illinois', 'private'),
  ('Johns Hopkins University', 'Baltimore', 'Maryland', 'private'),
  ('Rice University', 'Houston', 'Texas', 'private'),
  ('Vanderbilt University', 'Nashville', 'Tennessee', 'private')
ON CONFLICT ON CONSTRAINT schools_name_city_state_key 
DO UPDATE SET 
  type = EXCLUDED.type,
  updated_at = now();