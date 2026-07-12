-- Migration: alter_modules_add_slug
-- Adds slug column to existing modules table, or creates the table if needed.

DO $$
BEGIN
  -- Add slug column if it doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modules' AND column_name = 'module_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modules' AND column_name = 'slug'
  ) THEN
    ALTER TABLE modules ADD COLUMN slug VARCHAR;
    ALTER TABLE modules ADD CONSTRAINT modules_slug_unique UNIQUE (slug);
  END IF;
  
  -- Add nama column if it doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modules' AND column_name = 'module_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modules' AND column_name = 'nama'
  ) THEN
    ALTER TABLE modules ADD COLUMN nama VARCHAR;
  END IF;
END $$;

-- If table doesn't exist at all, create it
CREATE TABLE IF NOT EXISTS modules (
  module_id SERIAL PRIMARY KEY,
  slug      VARCHAR NOT NULL UNIQUE,
  nama      VARCHAR NOT NULL
);

-- Seed
INSERT INTO modules (slug, nama) VALUES ('kaidah-pencacahan', 'Kaidah Pencacahan')
ON CONFLICT (slug) DO NOTHING;
