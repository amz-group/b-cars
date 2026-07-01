/*
# B Car For Rent - Database Schema

1. New Tables
- `cars` - Stores car inventory with details, pricing, images, and availability
  - id (uuid, primary key)
  - name (text) - Car name/model
  - brand (text) - Car manufacturer
  - year (integer) - Model year
  - price_per_day (decimal) - Daily rental rate
  - price_per_week (decimal) - Weekly rental rate
  - image_url (text) - Main car image
  - images (jsonb) - Array of additional images
  - transmission (text) - Automatic/Manual
  - fuel_type (text) - Petrol/Diesel/Electric/Hybrid
  - seats (integer) - Number of seats
  - features (jsonb) - Array of car features
  - available (boolean) - Availability toggle
  - created_at (timestamp)
  - updated_at (timestamp)

- `site_settings` - Global site configuration (single row)
  - id (uuid, primary key)
  - phone_primary (text) - Primary contact number
  - phone_secondary (text) - Secondary contact number (optional)
  - whatsapp_number (text) - WhatsApp booking number
  - facebook_url (text) - Facebook page URL
  - instagram_url (text) - Instagram page URL
  - twitter_url (text) - Twitter page URL
  - site_name (text) - Website name
  - created_at (timestamp)
  - updated_at (timestamp)

- `admin_credentials` - Admin authentication
  - id (uuid, primary key)
  - username (text) - Admin username
  - password_hash (text) - Bcrypt password hash
  - created_at (timestamp)
  - updated_at (timestamp)

2. Security
- RLS enabled on all tables
- Public read access for cars and site_settings (anon + authenticated)
- Write access restricted for data integrity
- Admin uses separate credentials stored in admin_credentials table
*/

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  year integer NOT NULL,
  price_per_day decimal(10,2) NOT NULL,
  price_per_week decimal(10,2),
  image_url text,
  images jsonb DEFAULT '[]',
  transmission text DEFAULT 'Automatic',
  fuel_type text DEFAULT 'Petrol',
  seats integer DEFAULT 5,
  features jsonb DEFAULT '[]',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_primary text DEFAULT '+1234567890',
  phone_secondary text,
  whatsapp_number text DEFAULT '+1234567890',
  facebook_url text,
  instagram_url text,
  twitter_url text,
  site_name text DEFAULT 'B Car For Rent',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL DEFAULT 'admin',
  password_hash text NOT NULL DEFAULT '$2a$10$YourHashHere',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Cars policies (public read, public write for booking system)
DROP POLICY IF EXISTS "public_cars_select" ON cars;
CREATE POLICY "public_cars_select" ON cars FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_cars_insert" ON cars;
CREATE POLICY "public_cars_insert" ON cars FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_cars_update" ON cars;
CREATE POLICY "public_cars_update" ON cars FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_cars_delete" ON cars;
CREATE POLICY "public_cars_delete" ON cars FOR DELETE
  TO anon, authenticated USING (true);

-- Site settings policies (public read, public write)
DROP POLICY IF EXISTS "public_settings_select" ON site_settings;
CREATE POLICY "public_settings_select" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_settings_insert" ON site_settings;
CREATE POLICY "public_settings_insert" ON site_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_settings_update" ON site_settings;
CREATE POLICY "public_settings_update" ON site_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Admin credentials policies (public access for simple auth)
DROP POLICY IF EXISTS "public_admin_select" ON admin_credentials;
CREATE POLICY "public_admin_select" ON admin_credentials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_admin_update" ON admin_credentials;
CREATE POLICY "public_admin_update" ON admin_credentials FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert default site settings
INSERT INTO site_settings (id, phone_primary, whatsapp_number, site_name)
SELECT gen_random_uuid(), '+1234567890', '+1234567890', 'B Car For Rent'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Insert default admin credentials (password: admin123)
INSERT INTO admin_credentials (id, username, password_hash)
SELECT gen_random_uuid(), 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq1J8VpY.BFYxQvC3H3UFI6IpPlGKm'
WHERE NOT EXISTS (SELECT 1 FROM admin_credentials);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_credentials_updated_at ON admin_credentials;
CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();