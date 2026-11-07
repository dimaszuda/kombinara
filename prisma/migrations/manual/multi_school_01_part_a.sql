-- ============================================================================
-- Multi-sekolah — PART A (jalankan SEBELUM deploy kode baru)
-- ============================================================================
-- Isi:
--   1. Tabel schools + sekolah default (school_id = 1)
--   2. classes.school_id (+ DEFAULT 1 sementara agar kode lama tetap jalan)
--   3. classes.join_code (kode kelas untuk siswa) — diisi untuk semua kelas lama
--   4. Tabel teachers & teacher_classes
--   5. RLS pada tabel yang menyimpan kode (schools, classes) & tabel guru
--   6. Backfill guru lama → teachers + kelas XII G/J/L (sama dengan tampilan dashboard lama)
--   7. Backfill auth.users.raw_app_meta_data.role dari public.users.role
--
-- Sifat: aditif & idempoten (aman dijalankan ulang). Kode lama tetap berjalan.
-- Jalankan lewat Supabase Dashboard → SQL Editor.
--
-- SETELAH menjalankan file ini, isi nama sekolah dan kode guru:
--   UPDATE public.schools SET name = '<Nama Sekolah>', teacher_code = '<KODE-GURU>' WHERE school_id = 1;
-- (Kode sengaja TIDAK ditulis di repo. teacher_code NULL = pendaftaran guru ditutup.)
-- ============================================================================

-- ── 1. schools ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schools (
  school_id    SERIAL       PRIMARY KEY,
  name         VARCHAR      NOT NULL,
  teacher_code VARCHAR      UNIQUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.schools IS
  'Sekolah. teacher_code = kode pendaftaran guru (NULL = pendaftaran guru ditutup).';

INSERT INTO public.schools (school_id, name)
VALUES (1, 'Sekolah Default (ganti nama)')
ON CONFLICT (school_id) DO NOTHING;

-- Sinkronkan sequence setelah insert eksplisit school_id = 1
SELECT setval(
  pg_get_serial_sequence('public.schools', 'school_id'),
  GREATEST((SELECT MAX(school_id) FROM public.schools), 1)
);

-- ── 2. classes.school_id ────────────────────────────────────────────────────
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS school_id INT REFERENCES public.schools(school_id);

-- DEFAULT sementara: kode lama (sebelum deploy) membuat kelas tanpa school_id.
-- Dihapus di part B.
ALTER TABLE public.classes ALTER COLUMN school_id SET DEFAULT 1;

UPDATE public.classes SET school_id = 1 WHERE school_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes (school_id);

-- Unique (sekolah, tingkat, grup, tahun ajaran) — hanya jika belum ada duplikat
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.classes
    GROUP BY school_id, class_name, "group", academic_year
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Ada kelas duplikat (school_id, class_name, group, academic_year) — unique index TIDAK dibuat. Rapikan duplikat lalu jalankan ulang file ini.';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS uq_classes_school_name_group_year
      ON public.classes (school_id, class_name, "group", academic_year);
  END IF;
END $$;

-- ── 3. classes.join_code ────────────────────────────────────────────────────
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS join_code VARCHAR UNIQUE;

COMMENT ON COLUMN public.classes.join_code IS
  'Kode kelas untuk siswa bergabung. NULL = kelas tidak menerima siswa baru.';

-- 8 karakter hex uppercase. Kode baru dari aplikasi memakai alfabet tanpa 0/O/1/I.
UPDATE public.classes
SET join_code = upper(substr(md5(random()::text || class_id::text || clock_timestamp()::text), 1, 8))
WHERE join_code IS NULL;

-- ── 4. teachers & teacher_classes ───────────────────────────────────────────
-- DB lama punya tabel teachers warisan (user_id INTEGER, tanpa school_id) yang
-- dirujuk FK classes.teacher_id & courses.teacher_id. Hapus HANYA jika kosong;
-- CASCADE hanya menghapus FK-nya, kolom teacher_id tetap ada.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teachers'
      AND column_name = 'user_id' AND data_type = 'integer'
  ) THEN
    IF EXISTS (SELECT 1 FROM public.teachers) THEN
      RAISE EXCEPTION 'Tabel teachers lama berisi data — periksa manual, jangan dihapus otomatis.';
    END IF;
    DROP TABLE public.teachers CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.teachers (
  teacher_id  SERIAL       PRIMARY KEY,
  user_id     UUID         NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  school_id   INT          NOT NULL REFERENCES public.schools(school_id),
  name        VARCHAR      NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teachers_school ON public.teachers (school_id);

CREATE TABLE IF NOT EXISTS public.teacher_classes (
  teacher_id  INT          NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE CASCADE,
  class_id    INT          NOT NULL REFERENCES public.classes(class_id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (teacher_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_classes_class ON public.teacher_classes (class_id);

COMMENT ON TABLE public.teacher_classes IS
  'Kelas yang diajar/dipantau guru (many-to-many). Menentukan data apa yang boleh dilihat guru di Learning Dashboard.';

-- ── 5. RLS ──────────────────────────────────────────────────────────────────
-- Tabel ini hanya diakses aplikasi lewat Prisma (role owner → melewati RLS).
-- RLS tanpa policy = REST API Supabase (anon key) TIDAK bisa membaca kode guru / kode kelas.
ALTER TABLE public.schools          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes          ENABLE ROW LEVEL SECURITY;

-- ── 6. Backfill guru lama ───────────────────────────────────────────────────
-- Hanya guru yang BELUM punya baris teachers yang diberi kelas XII G/J/L,
-- sehingga menjalankan ulang file ini tidak menambah kelas ke guru yang daftar lewat aplikasi.
WITH new_teachers AS (
  INSERT INTO public.teachers (user_id, school_id, name)
  SELECT u.user_id, 1, u.name
  FROM public.users u
  WHERE u.role = 'guru'
    AND NOT EXISTS (SELECT 1 FROM public.teachers t WHERE t.user_id = u.user_id)
  RETURNING teacher_id
)
INSERT INTO public.teacher_classes (teacher_id, class_id)
SELECT nt.teacher_id, c.class_id
FROM new_teachers nt
CROSS JOIN public.classes c
WHERE c.school_id = 1
  AND c.class_name = 'XII'
  AND c."group" IN ('G', 'J', 'L')
ON CONFLICT DO NOTHING;

-- ── 7. Backfill role terverifikasi (app_metadata) ───────────────────────────
-- Sumber: public.users.role (hanya ditulis server). BUKAN user_metadata.
UPDATE auth.users au
SET raw_app_meta_data = COALESCE(au.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', u.role)
FROM public.users u
WHERE au.id = u.user_id
  AND u.role IN ('siswa', 'guru')
  AND (au.raw_app_meta_data ->> 'role') IS DISTINCT FROM u.role;

-- ── Verifikasi (opsional) ───────────────────────────────────────────────────
-- SELECT * FROM public.schools;
-- SELECT t.teacher_id, t.name, c.class_name, c."group", c.academic_year, c.join_code
--   FROM public.teachers t
--   JOIN public.teacher_classes tc ON tc.teacher_id = t.teacher_id
--   JOIN public.classes c ON c.class_id = tc.class_id
--   ORDER BY t.teacher_id, c.class_name, c."group";
-- SELECT raw_app_meta_data ->> 'role' AS role, COUNT(*) FROM auth.users GROUP BY 1;
