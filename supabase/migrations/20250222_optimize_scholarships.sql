-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_scholarships_school ON scholarships(school);
CREATE INDEX IF NOT EXISTS idx_scholarships_state ON scholarships(state);
CREATE INDEX IF NOT EXISTS idx_scholarships_education ON scholarships(education_level);
CREATE INDEX IF NOT EXISTS idx_scholarships_gpa ON scholarships(min_gpa);
CREATE INDEX IF NOT EXISTS idx_scholarships_pell ON scholarships(requires_pell);
CREATE INDEX IF NOT EXISTS idx_scholarships_major ON scholarships(major);
CREATE INDEX IF NOT EXISTS idx_scholarships_amount ON scholarships(amount);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);

-- Create GiST index for faster text search on school names
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_schools_name_trgm ON schools USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_city_trgm ON schools USING gin(city gin_trgm_ops);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_scholarships_edu_gpa ON scholarships(education_level, min_gpa);
CREATE INDEX IF NOT EXISTS idx_scholarships_state_pell ON scholarships(state, requires_pell);
