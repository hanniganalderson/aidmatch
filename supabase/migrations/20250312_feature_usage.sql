-- Create feature usage table
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint to ensure one record per user per feature
  UNIQUE(user_id, feature_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS feature_usage_user_id_idx ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS feature_usage_feature_name_idx ON feature_usage(feature_name);

-- Create function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_name TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE feature_usage
  SET 
    count = count + 1,
    last_used = NOW()
  WHERE 
    user_id = p_user_id AND
    feature_name = p_feature_name;
    
  -- If no rows were updated, insert a new record
  IF NOT FOUND THEN
    INSERT INTO feature_usage (user_id, feature_name, count, last_used)
    VALUES (p_user_id, p_feature_name, 1, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset feature usage (for monthly resets)
CREATE OR REPLACE FUNCTION reset_feature_usage(
  p_user_id UUID,
  p_feature_name TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_feature_name IS NULL THEN
    -- Reset all features for the user
    UPDATE feature_usage
    SET count = 0
    WHERE user_id = p_user_id;
  ELSE
    -- Reset specific feature
    UPDATE feature_usage
    SET count = 0
    WHERE 
      user_id = p_user_id AND
      feature_name = p_feature_name;
  END IF;
END;
$$ LANGUAGE plpgsql; 