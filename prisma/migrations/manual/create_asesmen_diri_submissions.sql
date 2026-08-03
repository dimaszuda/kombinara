-- Create asesmen_diri_submissions table
-- Checklist self-assessment pemahaman siswa (Ya / Belum / Ragu per indikator)

CREATE TABLE IF NOT EXISTS asesmen_diri_submissions (
    submission_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    checklist JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    CONSTRAINT uq_asesmen_diri_student UNIQUE (student_id)
);
