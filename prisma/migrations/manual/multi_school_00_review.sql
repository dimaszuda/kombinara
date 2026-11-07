-- ============================================================================
-- Multi-sekolah — LANGKAH 0: REVIEW (read-only, tidak mengubah data)
-- ============================================================================
-- Jalankan SEBELUM multi_school_01_part_a.sql.
--
-- Part A menentukan role terverifikasi (app_metadata.role) dan daftar guru
-- dari kolom public.users.role. Query di bawah menampilkan semua akun yang
-- "dianggap guru" dari dua sumber, supaya kamu bisa memastikan:
--
--   1. Semua guru sungguhan punya db_role = 'guru'.
--      Jika ada guru sungguhan yang db_role-nya bukan 'guru', perbaiki dulu:
--        UPDATE public.users SET role = 'guru' WHERE user_id = '<uuid>';
--
--   2. Tidak ada siswa yang user_meta_role-nya 'guru' (tanda akun yang pernah
--      mengubah role-nya sendiri lewat browser). Akun seperti ini TIDAK akan
--      menjadi guru setelah migrasi karena sumbernya public.users.role.
-- ============================================================================

SELECT
  au.id                               AS user_id,
  au.email,
  au.raw_user_meta_data ->> 'role'    AS user_meta_role,  -- bisa diubah user (tidak dipercaya)
  au.raw_app_meta_data  ->> 'role'    AS app_meta_role,   -- sumber role baru
  u.role                              AS db_role,         -- sumber backfill
  (s.student_id IS NOT NULL)          AS has_student_row
FROM auth.users au
LEFT JOIN public.users    u ON u.user_id = au.id
LEFT JOIN public.students s ON s.user_id = au.id
WHERE au.raw_user_meta_data ->> 'role' = 'guru'
   OR u.role = 'guru'
ORDER BY au.email;

-- Cek kelas duplikat (jika ada, unique index di part A tidak akan dibuat):
-- SELECT class_name, "group", academic_year, COUNT(*)
-- FROM public.classes GROUP BY 1, 2, 3 HAVING COUNT(*) > 1;
