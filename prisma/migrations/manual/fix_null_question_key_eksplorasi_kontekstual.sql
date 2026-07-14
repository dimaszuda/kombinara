-- Migration: fix_null_question_key_eksplorasi_kontekstual
-- Fixes any rows where question_key is NULL.
-- The questionKey field in Prisma schema is non-nullable String,
-- but some rows may have NULL due to missing/partial migration or legacy inserts.
--
-- Run this manually against the database:
--   npx prisma db execute --schema=prisma/schema.prisma --file=prisma/migrations/manual/fix_null_question_key_eksplorasi_kontekstual.sql

-- Step 1: Backfill any NULL question_key values to 'legacy'
UPDATE eksplorasi_kontekstual
  SET question_key = 'legacy'
  WHERE question_key IS NULL;

-- Step 2: Ensure the column is NOT NULL (idempotent)
ALTER TABLE eksplorasi_kontekstual
  ALTER COLUMN question_key SET NOT NULL;
