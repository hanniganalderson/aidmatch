/*
  # Initial Database Schema Setup

  1. Core Tables
    - users (auth)
    - schools
    - scholarships
    - education_levels
    - majors
    - states
    
  2. Junction Tables
    - saved_scholarships
    - scholarship_education_levels
    - scholarship_majors
    - scholarship_states
    
  3. Additional Features
    - Full text search
    - Automatic timestamps
    - Row level security
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create education_levels table
CREATE TABLE education_levels (
    id SERIAL PRIMARY KEY,
    level TEXT NOT NULL UNIQUE
);

-- Create majors table
CREATE TABLE majors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Create states table
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Create schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    type TEXT CHECK (type IN ('public', 'private', 'community')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create scholarships table
CREATE TABLE scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    deadline DATE,
    requirements TEXT,
    difficulty_score INTEGER DEFAULT 50 CHECK (difficulty_score >= 0 AND difficulty_score <= 100),
    competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),
    roi_score INTEGER DEFAULT 0 CHECK (roi_score >= 0),
    is_local BOOLEAN DEFAULT false,
    link TEXT,
    gpa_requirement NUMERIC(3,2) CHECK (gpa_requirement >= 0.0 AND gpa_requirement <= 4.0),
    major TEXT,
    national BOOLEAN DEFAULT false,
    education_level TEXT[],
    is_recurring BOOLEAN DEFAULT false,
    recurring_period TEXT CHECK (recurring_period IN ('annual', 'biennial', 'other')),
    keywords TEXT[],
    search_vector TSVECTOR,
    popularity INTEGER DEFAULT 0,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT scholarships_unique_idx UNIQUE (name, provider)
);

-- Create saved_scholarships table
CREATE TABLE saved_scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, scholarship_id)
);

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    education_level TEXT,
    school TEXT,
    major TEXT,
    gpa NUMERIC(3,2) CHECK (gpa >= 0.0 AND gpa <= 4.0),
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_scholarships_name ON scholarships(name);
CREATE INDEX idx_scholarships_provider ON scholarships(provider);
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX idx_scholarships_gpa ON scholarships(gpa_requirement);
CREATE INDEX idx_scholarships_major ON scholarships USING gin(to_tsvector('english', COALESCE(major, '')));
CREATE INDEX idx_scholarships_state ON scholarships(state);
CREATE INDEX idx_scholarships_search ON scholarships USING gin(search_vector);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can read schools" ON schools
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read scholarships" ON scholarships
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their saved scholarships" ON saved_scholarships
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their profiles" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial education levels
INSERT INTO education_levels (level) VALUES
    ('High School Senior'),
    ('College Freshman'),
    ('College Sophomore'),
    ('College Junior'),
    ('College Senior'),
    ('Masters Student'),
    ('PhD Student');

-- Insert initial states
INSERT INTO states (name) VALUES
    ('Alabama'), ('Alaska'), ('Arizona'), ('Arkansas'), ('California'),
    ('Colorado'), ('Connecticut'), ('Delaware'), ('Florida'), ('Georgia'),
    ('Hawaii'), ('Idaho'), ('Illinois'), ('Indiana'), ('Iowa'),
    ('Kansas'), ('Kentucky'), ('Louisiana'), ('Maine'), ('Maryland'),
    ('Massachusetts'), ('Michigan'), ('Minnesota'), ('Mississippi'), ('Missouri'),
    ('Montana'), ('Nebraska'), ('Nevada'), ('New Hampshire'), ('New Jersey'),
    ('New Mexico'), ('New York'), ('North Carolina'), ('North Dakota'), ('Ohio'),
    ('Oklahoma'), ('Oregon'), ('Pennsylvania'), ('Rhode Island'), ('South Carolina'),
    ('South Dakota'), ('Tennessee'), ('Texas'), ('Utah'), ('Vermont'),
    ('Virginia'), ('Washington'), ('West Virginia'), ('Wisconsin'), ('Wyoming');

-- Insert initial majors
INSERT INTO majors (name) VALUES
    ('Computer Science'),
    ('Engineering'),
    ('Business'),
    ('Medicine'),
    ('Law'),
    ('Arts'),
    ('Education'),
    ('Sciences'),
    ('Mathematics'),
    ('Social Sciences'),
    ('Humanities');

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_scholarship_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.provider, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.requirements, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.major, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector
CREATE TRIGGER update_scholarship_search_vector_trigger
    BEFORE INSERT OR UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION update_scholarship_search_vector();