-- ============================================================================
-- Multi-sekolah — PART B (jalankan SETELAH kode baru ter-deploy)
-- ============================================================================
-- Merapikan data yang dibuat kode lama di sela waktu antara part A dan deploy,
-- lalu mengunci kolom school_id. Idempoten.
-- ============================================================================

-- Kelas yang dibuat kode lama setelah part A
UPDATE public.classes SET school_id = 1 WHERE school_id IS NULL;

UPDATE public.classes
SET join_code = upper(substr(md5(random()::text || class_id::text || clock_timestamp()::text), 1, 8))
WHERE join_code IS NULL;

-- Kunci school_id: setiap kelas wajib punya sekolah, tanpa default diam-diam ke sekolah 1
ALTER TABLE public.classes ALTER COLUMN school_id DROP DEFAULT;
ALTER TABLE public.classes ALTER COLUMN school_id SET NOT NULL;

-- User yang daftar lewat kode lama setelah part A (role hanya di user_metadata)
UPDATE auth.users au
SET raw_app_meta_data = COALESCE(au.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', u.role)
FROM public.users u
WHERE au.id = u.user_id
  AND u.role IN ('siswa', 'guru')
  AND (au.raw_app_meta_data ->> 'role') IS DISTINCT FROM u.role;
