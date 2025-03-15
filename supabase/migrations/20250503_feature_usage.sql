-- Create feature_usage table
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on user_id and feature_name
CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);

-- Enable RLS
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own usage
CREATE POLICY "Users can view their own feature usage"
  ON feature_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to update their own usage
CREATE POLICY "Users can update their own feature usage"
  ON feature_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own usage
CREATE POLICY "Users can insert their own feature usage"
  ON feature_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to view all usage
CREATE POLICY "Admins can view all feature usage"
  ON feature_usage FOR SELECT
  USING (
    auth.email() IN (
      SELECT unnest(allowed_emails) FROM admin_users
    )
  );

-- Create policy for admins to update all usage
CREATE POLICY "Admins can update all feature usage"
  ON feature_usage FOR UPDATE
  USING (
    auth.email() IN (
      SELECT unnest(allowed_emails) FROM admin_users
    )
  ); 