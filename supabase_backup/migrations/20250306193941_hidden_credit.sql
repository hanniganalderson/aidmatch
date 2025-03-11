/*
  # Optimize Scholarships Table Performance

  1. New Indexes
    - Create indexes for frequently queried fields
    - Add GiST index for text search
    - Create composite indexes for common query patterns
  
  2. Changes
    - Add gin_trgm extension for text search
    - Add indexes on scholarship fields
    - Add composite indexes for common query combinations
    
  3. Notes
    - All indexes use IF NOT EXISTS to prevent errors
    - Indexes are chosen based on common query patterns
    - Text search uses pg_trgm for fuzzy matching
*/

-- Enable pg_trgm extension for text search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for frequently queried single fields
CREATE INDEX IF NOT EXISTS idx_scholarships_name ON scholarships(name);
CREATE INDEX IF NOT EXISTS idx_scholarships_provider ON scholarships(provider);
CREATE INDEX IF NOT EXISTS idx_scholarships_amount ON scholarships(amount);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_gpa_requirement ON scholarships(gpa_requirement);
CREATE INDEX IF NOT EXISTS idx_scholarships_competition_level ON scholarships(competition_level);
CREATE INDEX IF NOT EXISTS idx_scholarships_roi_score ON scholarships(roi_score DESC);
CREATE INDEX IF NOT EXISTS idx_scholarships_popularity ON scholarships(popularity DESC);

-- Create GiST indexes for text search
CREATE INDEX IF NOT EXISTS idx_scholarships_name_trgm ON scholarships USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_scholarships_provider_trgm ON scholarships USING gin(provider gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_scholarships_major_trgm ON scholarships USING gin(major gin_trgm_ops);

-- Create indexes for array fields
CREATE INDEX IF NOT EXISTS idx_scholarships_education_level ON scholarships USING gin(education_level);
CREATE INDEX IF NOT EXISTS idx_scholarships_keywords ON scholarships USING gin(keywords);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline_amount ON scholarships(deadline, amount DESC);
CREATE INDEX IF NOT EXISTS idx_scholarships_gpa_amount ON scholarships(gpa_requirement, amount DESC);
CREATE INDEX IF NOT EXISTS idx_scholarships_competition_roi ON scholarships(competition_level, roi_score DESC);

-- Create indexes for boolean filters
CREATE INDEX IF NOT EXISTS idx_scholarships_is_local ON scholarships(is_local);
CREATE INDEX IF NOT EXISTS idx_scholarships_is_recurring ON scholarships(is_recurring);
CREATE INDEX IF NOT EXISTS idx_scholarships_national ON scholarships(national);

-- Create partial indexes for common filters
CREATE INDEX IF NOT EXISTS idx_scholarships_active_deadline ON scholarships(deadline)
WHERE deadline >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_scholarships_high_value ON scholarships(amount)
WHERE amount >= 10000;