CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_rentals" ON rentals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_rentals" ON rentals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_rentals" ON rentals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_rentals" ON rentals FOR DELETE TO anon, authenticated USING (true);
