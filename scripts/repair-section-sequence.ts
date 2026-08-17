/**
 * Repair script: enforce sequential (prefix-closed) invariant on
 * student_section_status.
 *
 * Bug yang diperbaiki: "penjelasan_konsep unlocked tapi contoh_soal completed"
 * (terjadi di semua materi karena UI meng-infer penjelasan_konsep dari section
 * lain dan tombol lanjut bersifat fail-open). Script ini men-backfill semua
 * section pendahulu yang belum completed untuk setiap concept yang sudah punya
 * section completed.
 *
 * Usage:
 *   npx ts-node scripts/repair-section-sequence.ts           (dry-run)
 *   $env:DRY_RUN="0" ; npx ts-node scripts/repair-section-sequence.ts  (apply)
 *
 * Requires DATABASE_URL in environment (copy from .env.local).
 */
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

// Ordered list — copy of ALL_SECTIONS from src/lib/data/student-section-status.ts
// (di-inline agar script tidak butuh path alias / tsconfig-paths).
const ALL_SECTIONS: { conceptId: string; section: string }[] = [
  { conceptId: "kaidah_penjumlahan", section: "apersepsi" },
  { conceptId: "kaidah_penjumlahan", section: "pemantik" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_sebelum_mulai" },
  { conceptId: "kaidah_penjumlahan", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_penjumlahan", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_penjumlahan", section: "penjelasan_konsep" },
  { conceptId: "kaidah_penjumlahan", section: "contoh_soal" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_mini" },
  { conceptId: "kaidah_perkalian", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_perkalian", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_perkalian", section: "penjelasan_konsep" },
  { conceptId: "kaidah_perkalian", section: "contoh_soal" },
  { conceptId: "kaidah_perkalian", section: "refleksi_mini" },
  { conceptId: "faktorial", section: "eksplorasi_kontekstual" },
  { conceptId: "faktorial", section: "aktivitas_deep_learning" },
  { conceptId: "faktorial", section: "penjelasan_konsep" },
  { conceptId: "faktorial", section: "contoh_soal" },
  { conceptId: "faktorial", section: "mengapa_corner" },
  { conceptId: "faktorial", section: "refleksi_mini" },
  { conceptId: "permutasi_r_unsur_dari_n_unsur", section: "eksplorasi_kontekstual" },
  { conceptId: "permutasi_r_unsur_dari_n_unsur", section: "aktivitas_deep_learning" },
  { conceptId: "permutasi_r_unsur_dari_n_unsur", section: "penjelasan_konsep" },
  { conceptId: "permutasi_dengan_unsur_sama", section: "eksplorasi_kontekstual" },
  { conceptId: "permutasi_dengan_unsur_sama", section: "aktivitas_deep_learning" },
  { conceptId: "permutasi_dengan_unsur_sama", section: "penjelasan_konsep" },
  { conceptId: "permutasi_siklis", section: "eksplorasi_kontekstual" },
  { conceptId: "permutasi_siklis", section: "aktivitas_deep_learning" },
  { conceptId: "permutasi_siklis", section: "penjelasan_konsep" },
  { conceptId: "permutasi_siklis", section: "contoh_soal" },
  { conceptId: "permutasi_siklis", section: "refleksi_mini" },
  { conceptId: "kombinasi", section: "eksplorasi_kontekstual" },
  { conceptId: "kombinasi", section: "aktivitas_deep_learning" },
  { conceptId: "kombinasi", section: "penjelasan_konsep" },
  { conceptId: "kombinasi", section: "contoh_soal" },
  { conceptId: "kombinasi", section: "mengapa_corner" },
  { conceptId: "kombinasi", section: "refleksi_mini" },
];

const CONCEPT_IDS = [...new Set(ALL_SECTIONS.map((s) => s.conceptId))];

const DRY_RUN = process.env.DRY_RUN !== "0";

async function main() {
  const students = await p.student.findMany({
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });

  let totalBackfills = 0;
  let totalNormalized = 0;
  const perStudent: { name: string; fixes: string[] }[] = [];

  for (const student of students) {
    const rows = await p.studentSectionStatus.findMany({
      where: { studentId: student.id },
      select: { conceptId: true, section: true, status: true, completedAt: true },
    });

    const byConcept = new Map<string, Map<string, { status: string; completedAt: Date | null }>>();
    for (const r of rows) {
      if (!byConcept.has(r.conceptId)) byConcept.set(r.conceptId, new Map());
      byConcept.get(r.conceptId)!.set(r.section, { status: r.status, completedAt: r.completedAt });
    }

    const fixes: string[] = [];

    for (const conceptId of CONCEPT_IDS) {
      const m = byConcept.get(conceptId);
      if (!m || m.size === 0) continue;

      const conceptSections = ALL_SECTIONS.filter((s) => s.conceptId === conceptId);

      // Timestamp backfill: pakai completed_at paling awal di concept ini
      let earliestCompleted: Date | null = null;
      for (const row of m.values()) {
        if (row.status === "completed" && row.completedAt) {
          if (!earliestCompleted || row.completedAt < earliestCompleted) {
            earliestCompleted = row.completedAt;
          }
        }
      }
      const backfillAt = earliestCompleted ?? new Date();

      // Normalisasi: row completed tapi completed_at NULL → isi dengan backfillAt
      for (const [section, row] of m) {
        if (row.status === "completed" && !row.completedAt) {
          fixes.push(`${conceptId}/${section} [completed_at NULL]`);
          totalNormalized++;
          if (!DRY_RUN) {
            await p.studentSectionStatus.update({
              where: {
                studentId_conceptId_section: {
                  studentId: student.id,
                  conceptId,
                  section,
                },
              },
              data: { completedAt: backfillAt },
            });
          }
        }
      }

      // Index terakhir yang completed
      let lastCompleted = -1;
      conceptSections.forEach((s, i) => {
        const row = m.get(s.section);
        if (row && row.status === "completed") lastCompleted = Math.max(lastCompleted, i);
      });
      if (lastCompleted < 0) continue;

      // Backfill gap: semua section sebelum lastCompleted harus completed
      for (let i = 0; i <= lastCompleted; i++) {
        const s = conceptSections[i];
        const row = m.get(s.section);
        if (!row || row.status !== "completed") {
          fixes.push(`${conceptId}/${s.section}`);
          totalBackfills++;
          if (!DRY_RUN) {
            await p.studentSectionStatus.upsert({
              where: {
                studentId_conceptId_section: {
                  studentId: student.id,
                  conceptId,
                  section: s.section,
                },
              },
              create: {
                studentId: student.id,
                conceptId,
                section: s.section,
                status: "completed",
                completedAt: backfillAt,
              },
              update: {
                status: "completed",
                completedAt: backfillAt,
              },
            });
          }
        }
      }
    }

    if (fixes.length > 0) perStudent.push({ name: student.name, fixes });
  }

  console.log(
    `\n${DRY_RUN ? "[DRY-RUN]" : "[APPLIED]"} Total backfill: ${totalBackfills} section, ` +
      `normalisasi completed_at: ${totalNormalized}, pada ${perStudent.length} siswa`
  );
  for (const s of perStudent) {
    console.log(`- ${s.name} (${s.fixes.length}): ${s.fixes.join(", ")}`);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  p.$disconnect();
  process.exit(1);
});
