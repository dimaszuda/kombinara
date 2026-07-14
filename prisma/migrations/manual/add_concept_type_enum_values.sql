-- Migration: add_concept_type_enum_values
-- Adds missing concept_type enum values: kaidah_penjumlahan and kaidah_perkalian
-- These are used by the application but were missing from the PostgreSQL enum.

ALTER TYPE concept_type ADD VALUE IF NOT EXISTS 'kaidah_penjumlahan';
ALTER TYPE concept_type ADD VALUE IF NOT EXISTS 'kaidah_perkalian';
