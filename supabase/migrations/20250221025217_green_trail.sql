/*
  # Add scholarship requirements columns

  1. Changes
    - Add GPA requirements column to scholarships table
    - Add education level requirements column
    - Add major requirements column

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE scholarships
ADD COLUMN IF NOT EXISTS gpa_requirement numeric,
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS major text;

-- Add check constraint for GPA
ALTER TABLE scholarships
ADD CONSTRAINT scholarships_gpa_requirement_check
CHECK (gpa_requirement >= 0 AND gpa_requirement <= 4.0);

-- Add check constraint for education level
ALTER TABLE scholarships
ADD CONSTRAINT scholarships_education_level_check
CHECK (education_level IN (
  'High School Senior',
  'College Freshman',
  'College Sophomore',
  'College Junior',
  'College Senior',
  'Masters Student',
  'PhD Student'
));