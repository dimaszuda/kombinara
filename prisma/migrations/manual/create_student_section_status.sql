-- Migration: create_student_section_status
-- Tracks per-section completion status for each student within a concept.
-- Used for sequential unlock logic in materi pages (e.g., Kaidah Pencacahan).
-- Note: asesmen_diagnostik is NOT tracked here -- its status lives in diagnostic_attempts.

CREATE TABLE IF NOT EXISTS student_section_status (
  student_id   INT NOT NULL,
  concept_id   VARCHAR NOT NULL,
  section      VARCHAR NOT NULL CHECK (section IN (
    'apersepsi', 'pemantik', 'refleksi_sebelum_mulai',
    'eksplorasi_kontekstual', 'aktivitas_deep_learning',
    'penjelasan_konsep', 'contoh_soal', 'refleksi_formatif', 'asesmen_formatif'
  )),
  status       VARCHAR NOT NULL CHECK (status IN ('locked', 'unlocked', 'completed')) DEFAULT 'locked',
  completed_at TIMESTAMP,
  PRIMARY KEY (student_id, concept_id, section),
  CONSTRAINT fk_student_section_status_student
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

COMMENT ON TABLE student_section_status IS 'Per-section completion tracking. Seeded once on first access to a concept. asesmen_diagnostik statically excluded -- never has rows here.';
