-- Migration: create_modules
-- Simple lookup table for learning modules (e.g., Kaidah Pencacahan).

CREATE TABLE IF NOT EXISTS modules (
  module_id SERIAL PRIMARY KEY,
  slug      VARCHAR NOT NULL UNIQUE,
  nama      VARCHAR NOT NULL
);

-- Seed the Kaidah Pencacahan module
INSERT INTO modules (slug, nama) VALUES ('kaidah-pencacahan', 'Kaidah Pencacahan')
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE modules IS 'Learning modules lookup table. One module can have multiple formative assessments.';
