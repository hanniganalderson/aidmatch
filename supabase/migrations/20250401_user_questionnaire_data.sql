-- Create user_questionnaire_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_questionnaire_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  education_level TEXT,
  major TEXT,
  gpa NUMERIC(3,2),
  state TEXT,
  school TEXT,
  extracurricular_activities TEXT[],
  demographic_info JSONB,
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create RLS policies for user_questionnaire_data
ALTER TABLE user_questionnaire_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own questionnaire data"
  ON user_questionnaire_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire data"
  ON user_questionnaire_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire data"
  ON user_questionnaire_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_questionnaire_data_updated_at
BEFORE UPDATE ON user_questionnaire_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 