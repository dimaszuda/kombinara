-- Migration: add_kombinasi_concept_type_enum_value
-- Adds 'kombinasi' to the concept_type PostgreSQL enum.

ALTER TYPE concept_type ADD VALUE IF NOT EXISTS 'kombinasi';
