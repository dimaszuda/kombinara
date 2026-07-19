-- Fix: make concept_id nullable on asesmen_formatif_submissions
-- The column was created with NOT NULL but the Prisma schema has it as optional.

ALTER TABLE asesmen_formatif_submissions
  ALTER COLUMN concept_id DROP NOT NULL;
