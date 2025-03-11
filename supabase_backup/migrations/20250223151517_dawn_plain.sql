/*
  # Fix Scholarships Schema

  1. Changes
    - Add missing columns to scholarships table
    - Add proper constraints and indexes
    - Enable RLS policies
  
  2. Security
    - Enable RLS on scholarships table
    - Add policy for reading scholarships
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS scholarships;

-- Create scholarships table with correct structure
CREATE TABLE scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  amount numeric NOT NULL,
  deadline date NOT NULL,
  description text,
  gpa_requirement numeric CHECK (gpa_requirement >= 0 AND gpa_requirement <= 4.0),
  education_level text CHECK (education_level IN (
    'High School Senior',
    'College Freshman',
    'College Sophomore',
    'College Junior',
    'College Senior',
    'Masters Student',
    'PhD Student'
  )),
  major text,
  state text,
  competition_level text CHECK (competition_level IN ('Low', 'Medium', 'High')),
  requires_essay boolean DEFAULT false,
  application_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

-- Create policy for reading scholarships
CREATE POLICY "Anyone can read scholarships"
  ON scholarships
  FOR SELECT
  USING (true);

-- Create indexes for common queries
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX idx_scholarships_gpa ON scholarships(gpa_requirement);
CREATE INDEX idx_scholarships_education ON scholarships(education_level);
CREATE INDEX idx_scholarships_state ON scholarships(state);
CREATE INDEX idx_scholarships_major ON scholarships(major);

-- Insert sample data
INSERT INTO scholarships (
  name,
  provider,
  amount,
  deadline,
  description,
  gpa_requirement,
  education_level,
  major,
  state,
  competition_level,
  requires_essay,
  application_url
) VALUES
  (
    'Future Tech Leaders Scholarship',
    'Innovation Foundation',
    25000,
    '2025-05-01',
    'Supporting next-generation technology innovators',
    3.5,
    'College Junior',
    'Computer Science',
    'California',
    'Medium',
    true,
    'https://example.com/apply'
  ),
  (
    'Engineering Excellence Award',
    'Engineering Society',
    15000,
    '2025-06-15',
    'For outstanding engineering students',
    3.2,
    'College Senior',
    'Engineering',
    null,
    'High',
    true,
    'https://example.com/apply'
  ),
  (
    'STEM Diversity Scholarship',
    'Tech for All Foundation',
    20000,
    '2025-04-30',
    'Promoting diversity in STEM fields',
    3.0,
    'College Freshman',
    'STEM',
    null,
    'Medium',
    false,
    'https://example.com/apply'
  )
ON CONFLICT (id) DO NOTHING;