-- Create tantangan_submissions table
-- Jawaban esai soal tantangan (10 soal open-ended, dinilai AI)
-- Satu row per submission — INSERT only, no upsert.
-- Siswa bisa submit berkali-kali untuk soal yang sama (setiap attempt = row baru).

CREATE TABLE IF NOT EXISTS tantangan_submissions (
    submission_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    jawaban TEXT NOT NULL,
    is_correct BOOLEAN,
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_tantangan_student ON tantangan_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_tantangan_student_question ON tantangan_submissions(student_id, question_number);
