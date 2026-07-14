-- Migration: add_is_correct_eksplorasi_kontekstual
-- Adds is_correct column to eksplorasi_kontekstual table.
-- Populated from AI classification response.

ALTER TABLE eksplorasi_kontekstual
  ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;

COMMENT ON COLUMN eksplorasi_kontekstual.is_correct IS
  'Whether the student answer is correct according to AI classification. NULL if not yet classified.';
