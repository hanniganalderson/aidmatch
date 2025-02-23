/*
  # Add scholarship matching columns

  1. New Columns
    - `competition_level` (text) - Indicates how competitive the scholarship is
    - `national` (boolean) - Whether the scholarship is available nationally
    - `roi_score` (numeric) - Overall return on investment score
    
  2. Changes
    - Add columns if they don't exist
    - Add check constraints safely using DO blocks
    - Add index for ROI score sorting
*/

-- Add new columns if they don't exist
ALTER TABLE scholarships
ADD COLUMN IF NOT EXISTS competition_level text,
ADD COLUMN IF NOT EXISTS national boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS roi_score numeric;

-- Safely add check constraints
DO $$ 
BEGIN
  -- Only add competition_level check if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'scholarships_competition_level_check'
  ) THEN
    ALTER TABLE scholarships
    ADD CONSTRAINT scholarships_competition_level_check
    CHECK (competition_level IN ('Low', 'Medium', 'High'));
  END IF;

  -- Only add roi_score check if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'scholarships_roi_score_check'
  ) THEN
    ALTER TABLE scholarships
    ADD CONSTRAINT scholarships_roi_score_check
    CHECK (roi_score >= 0 AND roi_score <= 100);
  END IF;
END $$;

-- Add index for faster sorting if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_scholarships_roi_score ON scholarships(roi_score DESC);