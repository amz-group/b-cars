ALTER TABLE cars ADD COLUMN IF NOT EXISTS images_3d_exterior jsonb DEFAULT '[]';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS images_3d_interior jsonb DEFAULT '[]';