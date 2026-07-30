-- Migration: fix_contoh_soal_bertahap_concept_check
-- Updates the CHECK constraint on contoh_soal_bertahap_attempts.concept_id
-- to include the new granular permutasi concept IDs and faktorial.

ALTER TABLE contoh_soal_bertahap_attempts
  DROP CONSTRAINT IF EXISTS contoh_soal_bertahap_attempts_concept_id_check;

ALTER TABLE contoh_soal_bertahap_attempts
  ADD CONSTRAINT contoh_soal_bertahap_attempts_concept_id_check
  CHECK (concept_id IN (
    'kaidah_penjumlahan',
    'kaidah_perkalian',
    'faktorial',
    'permutasi',
    'permutasi_r_unsur_dari_n_unsur',
    'permutasi_dengan_unsur_sama',
    'permutasi_siklis',
    'kombinasi'
  ));
