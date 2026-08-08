/**
 * Integrity Analytics — Data Access Layer
 *
 * Query untuk tile "Integritas Pengerjaan" di dashboard guru.
 * Menampilkan log kejadian integritas (tab switch, fullscreen, paste, resize)
 * per siswa, dikelompokkan per materi dan tipe kejadian.
 *
 * Sumber data: public.integrity_events
 * Diakses via prisma.$queryRaw.
 */

import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

/** Satu baris di tabel integritas */
export interface IntegrityEventItem {
  /** Nama siswa */
  nama: string;
  /** Nama kelas (format: "X-1 A") */
  kelas: string;
  /** Nama materi (dari modules.nama) */
  materi: string;
  /** Tipe kejadian (sudah diterjemahkan ke Bahasa Indonesia) */
  jenisKejadian: string;
  /** Jumlah kejadian untuk tipe tersebut */
  jumlah: number;
}

/** Mapping event_type → label Bahasa Indonesia (bahasa guru) */
export const EVENT_TYPE_LABEL: Record<string, string> = {
  paste: "Menempel teks dari luar",
  visibility_visible: "Kembali ke halaman asesmen",
  fullscreen_enter: "Masuk ke mode layar penuh",
  visibility_hidden: "Berpindah ke tab/aplikasi lain",
  fullscreen_exit: "Keluar dari mode layar penuh",
  resize: "Ukuran jendela berubah",
};

// ═══════════════════════════════════════════════════════════════
// Filter helpers
// ═══════════════════════════════════════════════════════════════

interface IntegrityFilter {
  /** Filter by class IDs (via student.class_id) */
  classIds?: number[];
  /** Filter by materi (module.slug, maps ke concept_id) */
  conceptId?: string;
}

// ═══════════════════════════════════════════════════════════════
// Query: Integrity Events per Siswa
// ═══════════════════════════════════════════════════════════════

/**
 * Log Integritas Pengerjaan — per siswa, materi, dan tipe kejadian.
 *
 * Query:
 *   SELECT
 *     b.name,
 *     CONCAT(c.class_name, ' ', c."group") AS kelas,
 *     d.nama AS materi,
 *     COUNT(a.event_id) AS jumlah_kejadian,
 *     a.event_type
 *   FROM public.integrity_events AS a
 *   LEFT JOIN public.students AS b ON a.student_id = b.student_id
 *   LEFT JOIN public.classes AS c ON b.class_id = c.class_id
 *   LEFT JOIN public.modules AS d ON a.module_id = d.module_id
 *   LEFT JOIN public.users AS e ON b.user_id = e.user_id
 *   WHERE e.role = 'siswa'
 *   GROUP BY b.name, CONCAT(...), d.nama, a.event_type
 *   ORDER BY jumlah_kejadian DESC
 */
export async function getIntegrityEvents(
  filter: IntegrityFilter = {}
): Promise<IntegrityEventItem[]> {
  const classWhere =
    filter.classIds && filter.classIds.length > 0
      ? Prisma.sql`AND c.class_id IN (${Prisma.join(filter.classIds)})`
      : Prisma.empty;

  const moduleWhere = filter.conceptId
    ? Prisma.sql`AND d.slug = ${filter.conceptId}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<
    Array<{
      name: string;
      kelas: string;
      materi: string;
      jumlah_kejadian: bigint;
      event_type: string;
    }>
  >`
    SELECT
      b.name,
      CONCAT(c.class_name, ' ', c."group") AS kelas,
      d.nama AS materi,
      COUNT(a.event_id) AS jumlah_kejadian,
      a.event_type
    FROM public.integrity_events AS a
    LEFT JOIN public.students AS b
      ON a.student_id = b.student_id
    LEFT JOIN public.classes AS c
      ON b.class_id = c.class_id
    LEFT JOIN public.modules AS d
      ON a.module_id = d.module_id
    LEFT JOIN public.users AS e
      ON b.user_id = e.user_id
    WHERE e.role = 'siswa'
      ${classWhere}
      ${moduleWhere}
    GROUP BY
      b.name,
      CONCAT(c.class_name, ' ', c."group"),
      d.nama,
      a.event_type
    ORDER BY jumlah_kejadian DESC, b.name ASC
  `;

  return rows.map((r) => ({
    nama: r.name,
    kelas: r.kelas,
    materi: r.materi ?? "-",
    jenisKejadian: EVENT_TYPE_LABEL[r.event_type] ?? r.event_type,
    jumlah: Number(r.jumlah_kejadian),
  }));
}
