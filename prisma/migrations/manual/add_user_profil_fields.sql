-- Add nomor_absen, kelas, group_kelas to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS nomor_absen TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kelas TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS group_kelas TEXT;
