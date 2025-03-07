/*
  # Schools Table Optimization

  1. Changes
    - Add updated_at column with trigger
    - Add search vector for full text search
    - Create optimized indexes
    - Add text search configuration
  
  2. Indexes
    - GiST index for full text search
    - Composite index for common filters
    - Individual column indexes
    - Trigram indexes for fuzzy search
*/

-- Add updated_at column if it doesn't exist
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add search vector column
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(state, '')), 'B')
) STORED;

-- Create GiST index for full text search
CREATE INDEX IF NOT EXISTS schools_search_idx ON schools USING GiST (search_vector);

-- Create composite index for common filters
CREATE INDEX IF NOT EXISTS schools_state_type_idx ON schools (state, type);

-- Create indexes for individual columns
CREATE INDEX IF NOT EXISTS schools_name_idx ON schools (name);
CREATE INDEX IF NOT EXISTS schools_state_idx ON schools (state);

-- Add text search configuration
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS schools_name_trgm_idx ON schools USING gin (name gin_trgm_ops);