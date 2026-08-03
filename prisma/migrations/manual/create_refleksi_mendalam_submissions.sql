-- Create refleksi_mendalam_submissions table
-- Jawaban refleksi mendalam (6 pertanyaan freetext)
-- Satu row per pertanyaan per siswa.

CREATE TABLE IF NOT EXISTS refleksi_mendalam_submissions (
    submission_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    question_number INT NOT NULL,
    question_key VARCHAR NOT NULL,
    jawaban TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    CONSTRAINT uq_refleksi_mendalam_student_question UNIQUE (student_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_refleksi_mendalam_student ON refleksi_mendalam_submissions(student_id);
