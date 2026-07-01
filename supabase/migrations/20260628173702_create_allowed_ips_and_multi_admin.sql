-- Allow multiple admin credentials (remove unique on username if exists, handled by not adding new unique constraint)
-- The existing admin_credentials table already supports single row; we just allow more rows

-- Create allowed_ips table for IP whitelist
CREATE TABLE IF NOT EXISTS allowed_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  label text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE allowed_ips ENABLE ROW LEVEL SECURITY;

-- Allow public read (so frontend can check if IP is allowed)
CREATE POLICY "public_ips_select" ON allowed_ips FOR SELECT
  TO anon, authenticated USING (true);

-- Allow anon/authenticated to insert (admin manages this client-side after auth)
CREATE POLICY "public_ips_insert" ON allowed_ips FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "public_ips_delete" ON allowed_ips FOR DELETE
  TO anon, authenticated USING (true);

-- Allow multiple admin_credentials rows (insert policy for adding new admins)
DROP POLICY IF EXISTS "public_admin_insert" ON admin_credentials;
CREATE POLICY "public_admin_insert" ON admin_credentials FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_admin_select" ON admin_credentials;
CREATE POLICY "public_admin_select" ON admin_credentials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_admin_delete" ON admin_credentials;
CREATE POLICY "public_admin_delete" ON admin_credentials FOR DELETE
  TO anon, authenticated USING (true);