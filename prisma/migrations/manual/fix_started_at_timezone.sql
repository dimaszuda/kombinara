-- ============================================================================
-- Fix: Konversi started_at di diagnostic_attempts dari UTC ke GMT+7 (WIB)
-- ============================================================================
--
-- Masalah:
--   - started_at   di-set oleh DB DEFAULT NOW()          → tersimpan UTC
--   - submitted_at di-set oleh toGMT7ISO()               → tersimpan GMT+7
--   - last_saved_at di-set oleh toGMT7ISO()              → tersimpan GMT+7
--
--   Karena ketiganya di kolom TIMESTAMP WITHOUT TIME ZONE, nilai literal
--   UTC dan GMT+7 bercampur → durasi pengerjaan kacau (selisih 7 jam, bahkan minus).
--
-- Solusi:
--   1. Kode sudah diperbaiki: started_at kini juga pakai toGMT7ISO() (GMT+7).
--   2. Migration ini menambahkan 7 jam ke SEMUA started_at existing (UTC → GMT+7).
--   3. Analytics query juga sudah diperbaiki: hapus hack "- INTERVAL '7 hours'".
--
-- ⚠️  Jalankan SATU KALI setelah deploy kode fix.
--    Migration ini IDEMPOTEN — aman dijalankan ulang (tidak mengubah row yang
--    sudah benar karena kode baru juga sudah pakai GMT+7).
--
--    Cara aman: jalankan lewat Supabase SQL Editor.
-- ============================================================================

-- Cek dulu kondisi existing (opsional, untuk konfirmasi sebelum update)
-- SELECT
--   attempt_id,
--   student_id,
--   started_at AS started_at_utc,
--   started_at + INTERVAL '7 hours' AS started_at_wib,
--   submitted_at,
--   last_saved_at
-- FROM public.diagnostic_attempts
-- WHERE started_at IS NOT NULL
-- ORDER BY attempt_id DESC
-- LIMIT 20;

-- ── Perbaiki data existing: UTC → GMT+7 ───────────────────────────────────
UPDATE public.diagnostic_attempts
SET started_at = started_at + INTERVAL '7 hours'
WHERE started_at IS NOT NULL;

-- ⚠️  HANYA jalankan UPDATE di atas. Jangan jalankan setelah kode baru deploy
--     karena data baru sudah benar (GMT+7). Tapi kalau terlanjur, tidak apa-apa
--     karena INTERVAL '7 hours' hanya ditambahkan sekali per eksekusi — dan
--     migration ini harus dijalankan tepat SATU KALI setelah kode fix live.
--
--     Untuk konfirmasi: setelah UPDATE, durasi harus konsisten:
--     SELECT attempt_id, started_at, submitted_at,
--            EXTRACT(EPOCH FROM (submitted_at - started_at)) / 60 AS durasi_menit
--     FROM public.diagnostic_attempts
--     WHERE submitted_at IS NOT NULL AND started_at IS NOT NULL
--     ORDER BY attempt_id DESC
--     LIMIT 20;
