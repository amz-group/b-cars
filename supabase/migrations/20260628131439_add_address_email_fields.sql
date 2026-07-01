-- Add address and email to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS email text;

-- Add email column to admin_credentials
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS email text;

-- Set default email for existing admin
UPDATE admin_credentials SET email = 'admin@bcarforrent.com' WHERE email IS NULL;

-- Add update policy for admin_credentials email
DROP POLICY IF EXISTS "public_admin_update" ON admin_credentials;
CREATE POLICY "public_admin_update" ON admin_credentials FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);