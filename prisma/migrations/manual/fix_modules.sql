-- Add slug and nama columns to existing modules table
ALTER TABLE modules ADD COLUMN IF NOT EXISTS slug VARCHAR;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS nama VARCHAR;

-- Add unique constraint on slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'modules_slug_key'
  ) THEN
    ALTER TABLE modules ADD CONSTRAINT modules_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Seed data
INSERT INTO modules (slug, nama) VALUES ('kaidah-pencacahan', 'Kaidah Pencacahan')
ON CONFLICT (slug) DO NOTHING;
