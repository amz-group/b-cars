-- Create public storage bucket for car images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images',
  'car-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read car images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'car-images');

-- Allow authenticated and anon upload
CREATE POLICY "Allow upload car images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'car-images');

-- Allow delete
CREATE POLICY "Allow delete car images" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'car-images');