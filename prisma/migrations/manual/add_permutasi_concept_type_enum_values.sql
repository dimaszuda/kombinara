-- Migration: add_permutasi_concept_type_enum_values
-- Adds permutasi-specific concept_type enum values for the new granular concept IDs.

ALTER TYPE concept_type ADD VALUE IF NOT EXISTS 'permutasi_r_unsur_dari_n_unsur';
ALTER TYPE concept_type ADD VALUE IF NOT EXISTS 'permutasi_dengan_unsur_sama';
ALTER TYPE concept_type ADD VALUE IF NOT EXISTS 'permutasi_siklis';
