-- Fix refleksi_mini CHECK constraint to include all valid concept_ids
-- that are now used across the app (including permutasi sub-concepts and faktorial).

ALTER TABLE refleksi_mini
  DROP CONSTRAINT IF EXISTS refleksi_mini_concept_id_check;

ALTER TABLE refleksi_mini
  ADD CONSTRAINT refleksi_mini_concept_id_check
    CHECK (concept_id IN (
      'kaidah_penjumlahan',
      'kaidah_perkalian',
      'permutasi',
      'permutasi_r_unsur_dari_n_unsur',
      'permutasi_dengan_unsur_sama',
      'permutasi_siklis',
      'kombinasi',
      'faktorial'
    ));
