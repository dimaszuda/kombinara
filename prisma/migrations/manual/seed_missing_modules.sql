-- Migration: seed missing modules for faktorial, permutasi, kombinasi
-- Run: npx prisma db execute --file prisma/migrations/manual/seed_missing_modules.sql

INSERT INTO modules (slug, nama)
VALUES
  ('faktorial', 'Faktorial'),
  ('permutasi', 'Permutasi'),
  ('kombinasi', 'Kombinasi')
ON CONFLICT (slug) DO NOTHING;
