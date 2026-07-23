/**
 * Journey Analytics — Data Access Layer
 *
 * Query untuk tile Journey Siswa di dashboard guru:
 * - Tile Pendahuluan: Apersepsi, Pemantik, Refleksi (dari apersepsi_pemantik_responses)
 * - Tile Materi: Diagnostic, Materi, Aktivitas Siswa, Latihan, Evaluasi, Refleksi
 *   (dari student_section_status + aktivitas_siswa_entries)
 */

import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface PendahuluanJourneyItem {
  studentId: number;
  nama: string;
  apersepsi: string;  // "Completed" | "Non Completed"
  pemantik: string;   // "Completed" | "Non Completed"
  refleksi: string;   // "Completed" | "Non Completed"
}

export interface MateriJourneyItem {
  studentId: number;
  nama: string;
  conceptId: string;
  aktivitasDeepLearning: string;
  aktivitasSiswa: string;
  contohSoal: string;
  eksplorasiKontekstual: string;
  penjelasanKonsep: string;
  refleksiMini: string;
}

export interface JourneyAnalyticsData {
  pendahuluan: PendahuluanJourneyItem[];
  materi: MateriJourneyItem[];
}

// ═══════════════════════════════════════════════════════════════
// Tile Pendahuluan
// ═══════════════════════════════════════════════════════════════

export async function getPendahuluanJourney(
  classIds?: number[]
): Promise<PendahuluanJourneyItem[]> {
  const classWhere = classIds && classIds.length > 0
    ? Prisma.sql`AND a.class_id IN (${Prisma.join(classIds)})`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<Array<{
    student_id: number;
    name: string;
    apersepsi: string;
    pemantik: string;
    refleksi: string;
  }>>`
    WITH base AS (
      SELECT
        a.student_id,
        a.name,
        b.section,
        COUNT(*) FILTER (WHERE b.is_correct = TRUE) AS jumlah_benar
      FROM public.students a
      LEFT JOIN public.apersepsi_pemantik_responses b
        ON a.student_id = b.student_id
      LEFT JOIN public.users c
        ON a.user_id = c.user_id
      WHERE c.role = 'siswa'
        ${classWhere}
      GROUP BY a.student_id, a.name, b.section
    )
    SELECT
      student_id,
      name,
      COALESCE(
        MAX(CASE WHEN section = 'apersepsi' AND jumlah_benar >= 3 THEN 'Completed' END),
        'Non Completed'
      ) AS apersepsi,
      COALESCE(
        MAX(CASE WHEN section = 'pemantik' AND jumlah_benar >= 3 THEN 'Completed' END),
        'Non Completed'
      ) AS pemantik,
      COALESCE(
        MAX(CASE WHEN section = 'refleksi' AND jumlah_benar >= 2 THEN 'Completed' END),
        'Non Completed'
      ) AS refleksi
    FROM base
    GROUP BY student_id, name
    ORDER BY name
  `;

  return rows.map((r) => ({
    studentId: r.student_id,
    nama: r.name,
    apersepsi: r.apersepsi,
    pemantik: r.pemantik,
    refleksi: r.refleksi,
  }));
}

// ═══════════════════════════════════════════════════════════════
// Tile Materi
// ═══════════════════════════════════════════════════════════════

export async function getMateriJourney(
  classIds?: number[],
  materi?: string,
  searchName?: string
): Promise<MateriJourneyItem[]> {
  const classWhere = classIds && classIds.length > 0
    ? Prisma.sql`AND a.class_id IN (${Prisma.join(classIds)})`
    : Prisma.empty;

  const nameWhere = searchName
    ? Prisma.sql`AND LOWER(a.name) LIKE ${"%" + searchName.toLowerCase() + "%"}`
    : Prisma.empty;

  // Filter concept_id di CTE all_combinations dan all_status
  const conceptWhere = materi && materi !== "all"
    ? Prisma.sql`AND d.concept_id = ${materi}`
    : Prisma.empty;

  const conceptWhere2 = materi && materi !== "all"
    ? Prisma.sql`AND b.concept_id = ${materi}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<Array<{
    student_id: number;
    name: string;
    concept_id: string;
    aktivitas_deep_learning: string;
    aktivitas_siswa: string;
    contoh_soal: string;
    eksplorasi_kontekstual: string;
    penjelasan_konsep: string;
    refleksi_mini: string;
  }>>`
    WITH all_combinations AS (
      SELECT
        a.student_id,
        a.name,
        d.concept_id
      FROM public.students a
      CROSS JOIN (
        SELECT DISTINCT concept_id
        FROM public.aktivitas_siswa_entries
      ) d
      JOIN public.users c ON a.user_id = c.user_id
      WHERE c.role = 'siswa'
        ${classWhere}
        ${nameWhere}
        ${conceptWhere}
    ),

    counted AS (
      SELECT
        ac.student_id,
        ac.name,
        ac.concept_id,
        COUNT(b.entry_id) FILTER (WHERE b.is_correct = TRUE) AS correct_count
      FROM all_combinations ac
      LEFT JOIN public.aktivitas_siswa_entries b
        ON ac.student_id = b.student_id
       AND ac.concept_id = b.concept_id
      GROUP BY ac.student_id, ac.name, ac.concept_id
    ),

    all_status AS (
      SELECT
        a.student_id,
        a.name,
        b.concept_id,
        b.section,
        CASE
          WHEN b.status = 'completed' THEN 'completed'
          ELSE 'not completed'
        END AS status
      FROM public.students a
      JOIN public.student_section_status b ON a.student_id = b.student_id
      JOIN public.users c ON a.user_id = c.user_id
      WHERE c.role = 'siswa'
        AND b.section NOT IN ('apersepsi', 'pemantik', 'refleksi_sebelum_mulai')
        ${classWhere}
        ${nameWhere}
        ${conceptWhere2}

      UNION ALL

      SELECT
        student_id,
        name,
        concept_id,
        'aktivitas siswa' AS section,
        CASE
          WHEN correct_count >= 10 THEN 'completed'
          ELSE 'not completed'
        END
      FROM counted
    )

    SELECT
      name,
      concept_id,
      COALESCE(
        MAX(CASE WHEN section = 'aktivitas_deep_learning' THEN status END),
        'not completed'
      ) AS aktivitas_deep_learning,
      COALESCE(
        MAX(CASE WHEN section = 'aktivitas siswa' THEN status END),
        'not completed'
      ) AS aktivitas_siswa,
      COALESCE(
        MAX(CASE WHEN section = 'contoh_soal' THEN status END),
        'not completed'
      ) AS contoh_soal,
      COALESCE(
        MAX(CASE WHEN section = 'eksplorasi_kontekstual' THEN status END),
        'not completed'
      ) AS eksplorasi_kontekstual,
      COALESCE(
        MAX(CASE WHEN section = 'penjelasan_konsep' THEN status END),
        'not completed'
      ) AS penjelasan_konsep,
      COALESCE(
        MAX(CASE WHEN section = 'refleksi_mini' THEN status END),
        'not completed'
      ) AS refleksi_mini
    FROM all_status
    GROUP BY student_id, name, concept_id
    ORDER BY name, concept_id
  `;

  return rows.map((r) => ({
    studentId: r.student_id,
    nama: r.name,
    conceptId: r.concept_id,
    aktivitasDeepLearning: r.aktivitas_deep_learning,
    aktivitasSiswa: r.aktivitas_siswa,
    contohSoal: r.contoh_soal,
    eksplorasiKontekstual: r.eksplorasi_kontekstual,
    penjelasanKonsep: r.penjelasan_konsep,
    refleksiMini: r.refleksi_mini,
  }));
}

// ═══════════════════════════════════════════════════════════════
// Gabungan fetch
// ═══════════════════════════════════════════════════════════════

export async function getJourneyAnalyticsData(
  classIds?: number[],
  materi?: string,
  searchName?: string
): Promise<JourneyAnalyticsData> {
  const [pendahuluan, materiJourney] = await Promise.all([
    getPendahuluanJourney(classIds),
    getMateriJourney(classIds, materi, searchName),
  ]);

  return { pendahuluan, materi: materiJourney };
}
