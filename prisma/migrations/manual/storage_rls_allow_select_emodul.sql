-- =============================================================================
-- Supabase Storage RLS Policy
-- Mengizinkan authenticated users melakukan SELECT (read) pada bucket
-- "E-Modul Kombinatorika" untuk generate signed URL dan download file.
--
-- Cara apply:
--   1. Buka Supabase Dashboard > SQL Editor
--   2. Paste dan run script ini
--   3. Atau: jalankan via supabase CLI dengan `supabase db push`
--
-- Prasyarat:
--   - Bucket "E-Modul Kombinatorika" harus SUDAH ADA di Supabase Storage
--   - Bucket harus PRIVATE (bukan public)
--   - RLS harus ENABLED pada bucket (default Supabase: enabled)
-- =============================================================================

-- Berikan akses SELECT pada bucket untuk authenticated users
-- Ini diperlukan agar `storage.from(bucketName).createSignedUrl(path, expiry)`
-- dapat berjalan di client-side (menggunakan anon key + user JWT)
CREATE POLICY "Allow authenticated select on E-Modul Kombinatorika"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'E-Modul Kombinatorika'
);

-- Catatan:
-- - Policy ini HANYA mengizinkan SELECT (read metadata + signed URL generation).
-- - Tidak mengizinkan INSERT, UPDATE, atau DELETE.
-- - Hanya authenticated users yang bisa mengakses.
-- - Jika setelah apply policy masih error 403/401, cek:
--     a. Apakah nama bucket persis sama (case-sensitive, termasuk spasi)?
--     b. Apakah user sudah login (memiliki JWT valid)?
--     c. Apakah RLS enabled pada bucket? (Cek di Supabase Dashboard > Storage > Bucket > ... > Policies)
