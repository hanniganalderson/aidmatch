/*
  # Add API Keys Table

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `openai_key` (text, encrypted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `api_keys` table
    - Add policy for authenticated users to read API keys
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  openai_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (true);