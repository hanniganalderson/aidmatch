-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allowed_emails TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create RLS policies for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (auth.email() IN (SELECT unnest(allowed_emails) FROM admin_users));

-- Only admins can update admin_users
CREATE POLICY "Admins can update admin_users"
  ON admin_users FOR UPDATE
  USING (auth.email() IN (SELECT unnest(allowed_emails) FROM admin_users));

-- Create RLS policies for newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert into newsletter_subscribers
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Only admins can view newsletter_subscribers
CREATE POLICY "Admins can view newsletter_subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (auth.email() IN (SELECT unnest(allowed_emails) FROM admin_users));

-- Only admins can update newsletter_subscribers
CREATE POLICY "Admins can update newsletter_subscribers"
  ON newsletter_subscribers FOR UPDATE
  USING (auth.email() IN (SELECT unnest(allowed_emails) FROM admin_users));

-- Insert initial admin user (replace with your admin email)
INSERT INTO admin_users (allowed_emails)
VALUES (ARRAY['admin@aidmatch.com'])
ON CONFLICT DO NOTHING; 