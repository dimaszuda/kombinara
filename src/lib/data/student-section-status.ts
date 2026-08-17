/**
 * Student Section Status -- Seeding & Constants
 *
 * The student_section_status table tracks per-section completion for each
 * student within a concept. It is seeded once (lazily, on first access to a
 * materi page) and then updated via the completion/update logic.
 *
 * Key design decisions:
 * - asesmen_diagnostik is NEVER tracked here; its status lives in diagnostic_attempts.
 * - aktivitas_siswa is NEVER tracked here; its status lives in aktivitas_siswa_entries.
 * - Seeding is idempotent: safe to call multiple times, no side effects after first seed.
 * - ON CONFLICT DO NOTHING handles race conditions (two concurrent first-access requests).
 * - Bulk insert (single INSERT with 13 VALUES) -- no N+1 loops.
 */

import { prisma } from "@/lib/prisma/client";
import type { PrismaClient } from "@prisma/client";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

/**
 * Ordered section list for Kaidah Pencacahan (13 sections across 2 concepts).
 *
 * kaidah_penjumlahan (indices 0-7, 8 sections):
 *   apersepsi -> pemantik -> refleksi_sebelum_mulai -> eksplorasi_kontekstual
 *   -> aktivitas_deep_learning -> penjelasan_konsep -> contoh_soal -> refleksi_mini
 *
 * kaidah_perkalian (indices 8-12, 5 sections):
 *   eksplorasi_kontekstual -> aktivitas_deep_learning -> penjelasan_konsep
 *   -> contoh_soal -> refleksi_mini
 *
 * NOTE: aktivitas_siswa is NOT in this array -- its status is read directly
 * from tabel aktivitas_siswa_entries, not from student_section_status.
 */
export const MATERI_SECTIONS = [
  // ── kaidah_penjumlahan (8 sections) ──
  { conceptId: "kaidah_penjumlahan", section: "apersepsi" },                    // 0
  { conceptId: "kaidah_penjumlahan", section: "pemantik" },                     // 1
  { conceptId: "kaidah_penjumlahan", section: "refleksi_sebelum_mulai" },       // 2
  { conceptId: "kaidah_penjumlahan", section: "eksplorasi_kontekstual" },       // 3
  { conceptId: "kaidah_penjumlahan", section: "aktivitas_deep_learning" },      // 4
  { conceptId: "kaidah_penjumlahan", section: "penjelasan_konsep" },             // 5
  { conceptId: "kaidah_penjumlahan", section: "contoh_soal" },                  // 6
  { conceptId: "kaidah_penjumlahan", section: "refleksi_mini" },                 // 7  -- section terakhir kaidah_penjumlahan

  // ── kaidah_perkalian (5 sections) ──
  { conceptId: "kaidah_perkalian", section: "eksplorasi_kontekstual" },         // 8  -- section pertama kaidah_perkalian
  { conceptId: "kaidah_perkalian", section: "aktivitas_deep_learning" },        // 9
  { conceptId: "kaidah_perkalian", section: "penjelasan_konsep" },               // 10
  { conceptId: "kaidah_perkalian", section: "contoh_soal" },                    // 11
  { conceptId: "kaidah_perkalian", section: "refleksi_mini" },                   // 12 -- section terakhir

  // ── faktorial (6 sections) ──
  { conceptId: "faktorial", section: "eksplorasi_kontekstual" },                // 13
  { conceptId: "faktorial", section: "aktivitas_deep_learning" },               // 14
  { conceptId: "faktorial", section: "penjelasan_konsep" },                      // 15
  { conceptId: "faktorial", section: "contoh_soal" },                           // 16
  { conceptId: "faktorial", section: "mengapa_corner" },                        // 17  -- only in faktorial
  { conceptId: "faktorial", section: "refleksi_mini" },                          // 18 -- section terakhir faktorial
] as const;

export const MATERI_CONCEPT_IDS = ["kaidah_penjumlahan", "kaidah_perkalian", "faktorial"] as const;

// ═══════════════════════════════════════════════════════════════
// Permutasi Sections (3 concepts, 13 sections)
// ═══════════════════════════════════════════════════════════════

/**
 * permutasi_r_unsur_dari_n_unsur (indices 0-2, 3 sections):
 *   eksplorasi_kontekstual -> aktivitas_deep_learning -> penjelasan_konsep
 *
 * permutasi_dengan_unsur_sama (indices 3-5, 3 sections):
 *   eksplorasi_kontekstual -> aktivitas_deep_learning -> penjelasan_konsep
 *
 * permutasi_siklis (indices 6-10, 5 sections):
 *   eksplorasi_kontekstual -> aktivitas_deep_learning -> penjelasan_konsep
 *   -> contoh_soal -> refleksi_mini
 */
export const PERMUTASI_SECTIONS = [
  // ── permutasi_r_unsur_dari_n_unsur (3 sections) ──
  { conceptId: "permutasi_r_unsur_dari_n_unsur", section: "eksplorasi_kontekstual" },   // 0
  { conceptId: "permutasi_r_unsur_dari_n_unsur", section: "aktivitas_deep_learning" },  // 1
  { conceptId: "permutasi_r_unsur_dari_n_unsur", section: "penjelasan_konsep" },        // 2

  // ── permutasi_dengan_unsur_sama (3 sections) ──
  { conceptId: "permutasi_dengan_unsur_sama", section: "eksplorasi_kontekstual" },      // 3
  { conceptId: "permutasi_dengan_unsur_sama", section: "aktivitas_deep_learning" },     // 4
  { conceptId: "permutasi_dengan_unsur_sama", section: "penjelasan_konsep" },           // 5

  // ── permutasi_siklis (5 sections) ──
  { conceptId: "permutasi_siklis", section: "eksplorasi_kontekstual" },                 // 6
  { conceptId: "permutasi_siklis", section: "aktivitas_deep_learning" },                // 7
  { conceptId: "permutasi_siklis", section: "penjelasan_konsep" },                      // 8
  { conceptId: "permutasi_siklis", section: "contoh_soal" },                            // 9
  { conceptId: "permutasi_siklis", section: "refleksi_mini" },                           // 10
] as const;

export const PERMUTASI_CONCEPT_IDS = ["permutasi_r_unsur_dari_n_unsur", "permutasi_dengan_unsur_sama", "permutasi_siklis"] as const;

// ═══════════════════════════════════════════════════════════════
// Kombinasi Sections (1 concept, 7 sections)
// ═══════════════════════════════════════════════════════════════

/**
 * kombinasi (indices 0-6, 7 sections):
 *   eksplorasi_kontekstual -> aktivitas_deep_learning -> penjelasan_konsep
 *   -> contoh_soal -> mengapa_corner -> permutasi_vs_kombinasi -> refleksi_mini
 *
 * NOTE: permutasi_vs_kombinasi (Panduan Definitif) is read-only and
 * NOT tracked in student_section_status. It is skipped during seeding.
 */
export const KOMBINASI_SECTIONS = [
  { conceptId: "kombinasi", section: "eksplorasi_kontekstual" },
  { conceptId: "kombinasi", section: "aktivitas_deep_learning" },
  { conceptId: "kombinasi", section: "penjelasan_konsep" },
  { conceptId: "kombinasi", section: "contoh_soal" },
  { conceptId: "kombinasi", section: "mengapa_corner" },
  // permutasi_vs_kombinasi is skipped (read-only, not in DB)
  { conceptId: "kombinasi", section: "refleksi_mini" },
] as const;

export const KOMBINASI_CONCEPT_IDS = ["kombinasi"] as const;

/** Unified lookup: MATERI_SECTIONS + PERMUTASI_SECTIONS + KOMBINASI_SECTIONS */
export const ALL_SECTIONS = [...MATERI_SECTIONS, ...PERMUTASI_SECTIONS, ...KOMBINASI_SECTIONS] as const;

// ═══════════════════════════════════════════════════════════════
// Concept Labels & Order
// ═══════════════════════════════════════════════════════════════

/** Human-readable labels for each conceptId. */
export const CONCEPT_LABELS: Record<string, string> = {
  kaidah_penjumlahan: "Kaidah Penjumlahan",
  kaidah_perkalian: "Kaidah Perkalian",
  faktorial: "Faktorial",
  permutasi_r_unsur_dari_n_unsur: "Permutasi r Unsur dari n Unsur",
  permutasi_dengan_unsur_sama: "Permutasi dengan Unsur Sama",
  permutasi_siklis: "Permutasi Siklis",
  kombinasi: "Kombinasi",
};

/** Sequential order in which students progress through concepts. */
export const CONCEPT_ORDER = [
  "kaidah_penjumlahan",
  "kaidah_perkalian",
  "faktorial",
  "permutasi_r_unsur_dari_n_unsur",
  "permutasi_dengan_unsur_sama",
  "permutasi_siklis",
  "kombinasi",
] as const;

/** All concept IDs combined for querying across all materi. */
export const ALL_CONCEPT_IDS = [...CONCEPT_ORDER] as const;

/**
 * Section yang validasi concept_id+section-nya harus dilakukan di application
 * layer menggunakan konstanta di atas. JANGAN mengandalkan CHECK constraint
 * database untuk validasi ini.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface SeedResult {
  /** Whether rows were actually seeded in this call (false if already existed). */
  seeded: boolean;
  /** Number of rows found before seeding attempt. */
  existingCount: number;
}

// ═══════════════════════════════════════════════════════════════
// Seeding Function
// ═══════════════════════════════════════════════════════════════

/**
 * Seed student_section_status rows for Kaidah Pencacahan.
 *
 * Idempotent -- safe to call multiple times. If rows already exist for this
 * student + concept combination, this is a no-op.
 *
 * Flow:
 * 1. COUNT existing rows in student_section_status for this student + concepts.
 * 2. If count > 0, return immediately (already seeded).
 * 3. If count === 0, query diagnostic_attempts (Supabase) for passing status.
 * 4. Bulk INSERT 13 rows:
 *    - If diagnostic passed: index 0 = 'unlocked', rest = 'locked'.
 *    - If diagnostic not passed: all 13 = 'locked'.
 * 5. ON CONFLICT DO NOTHING protects against concurrent first-access requests.
 *
 * @param studentId - The internal student.id (INT) from Prisma.
 * @param supabaseClient - An authenticated Supabase server client instance.
 */
export async function seedStudentSectionStatus(
  studentId: number,
  supabaseClient: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<SeedResult> {
  // ── Step 1: Check which concepts need seeding ────────────────
  // Query counts per concept instead of a single aggregate.
  const existingCounts = await Promise.all(
    [...MATERI_CONCEPT_IDS].map((cid) =>
      prisma.studentSectionStatus.count({
        where: { studentId, conceptId: cid },
      }).then((count) => ({ conceptId: cid, count }))
    )
  );

  const totalExisting = existingCounts.reduce((sum, c) => sum + c.count, 0);
  const conceptsToSeed = existingCounts
    .filter((c) => c.count === 0)
    .map((c) => c.conceptId);

  // If all concepts already have rows, nothing to do.
  if (conceptsToSeed.length === 0) {
    return { seeded: false, existingCount: totalExisting };
  }

  // ── Step 2: Determine initial unlock status ─────────────────
  const firstConcept = conceptsToSeed[0];
  let hasPassedDiagnostic = false;

  // Only check diagnostic if kaidah_penjumlahan is being seeded
  if (conceptsToSeed.includes("kaidah_penjumlahan")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: passedAttempt } = await (supabaseClient as any)
      .from("diagnostic_attempts")
      .select("attempt_id")
      .eq("student_id", studentId)
      .eq("status", "passed")
      .limit(1)
      .maybeSingle();

    hasPassedDiagnostic = !!passedAttempt;
  }

  // ── Step 3: Build rows only for concepts that need seeding ──
  const sectionsToSeed = MATERI_SECTIONS.filter((item) =>
    conceptsToSeed.includes(item.conceptId)
  );

  const rows = sectionsToSeed.map((item, index) => {
    // Determine if this is the FIRST section of its concept
    const isFirstInConcept = sectionsToSeed.findIndex(
      (s) => s.conceptId === item.conceptId
    ) === index;
    // First section of a concept is unlocked if:
    // - For kaidah_penjumlahan: only if diagnostic passed
    // - For other concepts: always unlocked (they start after previous concept done)
    const shouldUnlock = isFirstInConcept && (
      item.conceptId !== "kaidah_penjumlahan" || hasPassedDiagnostic
    );

    return {
      studentId,
      conceptId: item.conceptId,
      section: item.section,
      status: shouldUnlock ? "unlocked" : "locked",
      completedAt: null,
    };
  });

  // ── Step 4: Bulk insert with race-condition protection ───────
  await prisma.$transaction(async (tx) => {
    await tx.studentSectionStatus.createMany({
      data: rows as Array<{
        studentId: number;
        conceptId: string;
        section: string;
        status: string;
        completedAt: null;
      }>,
      skipDuplicates: true,
    });
  });

  return { seeded: true, existingCount: totalExisting };
}

// ═══════════════════════════════════════════════════════════════
// Permutasi Seeding Function
// ═══════════════════════════════════════════════════════════════

/**
 * Seed student_section_status rows for Permutasi.
 *
 * Idempotent -- safe to call multiple times. For permutasi, the first
 * section of the first concept (permutasi_r_unsur_dari_n_unsur) is always
 * unlocked on seed. Subsequent concepts start locked and are unlocked
 * sequentially via completeSectionAndUnlockNext.
 *
 * @param studentId - The internal student.id (INT) from Prisma.
 */
export async function seedPermutasiSectionStatus(
  studentId: number
): Promise<SeedResult> {
  // ── Step 1: Check which concepts need seeding ────────────────
  const existingCounts = await Promise.all(
    [...PERMUTASI_CONCEPT_IDS].map((cid) =>
      prisma.studentSectionStatus.count({
        where: { studentId, conceptId: cid },
      }).then((count) => ({ conceptId: cid, count }))
    )
  );

  const totalExisting = existingCounts.reduce((sum, c) => sum + c.count, 0);
  const conceptsToSeed = existingCounts
    .filter((c) => c.count === 0)
    .map((c) => c.conceptId);

  if (conceptsToSeed.length === 0) {
    return { seeded: false, existingCount: totalExisting };
  }

  // ── Step 2: Build rows ──────────────────────────────────────
  const sectionsToSeed = PERMUTASI_SECTIONS.filter((item) =>
    conceptsToSeed.includes(item.conceptId)
  );

  const rows = sectionsToSeed.map((item, index) => {
    const isFirstInConcept = sectionsToSeed.findIndex(
      (s) => s.conceptId === item.conceptId
    ) === index;
    // First section of the first concept is unlocked; others start locked
    const isFirstConcept = item.conceptId === "permutasi_r_unsur_dari_n_unsur";
    const shouldUnlock = isFirstInConcept && isFirstConcept;

    return {
      studentId,
      conceptId: item.conceptId,
      section: item.section,
      status: shouldUnlock ? "unlocked" : "locked",
      completedAt: null,
    };
  });

  // ── Step 3: Bulk insert ─────────────────────────────────────
  await prisma.$transaction(async (tx) => {
    await tx.studentSectionStatus.createMany({
      data: rows as Array<{
        studentId: number;
        conceptId: string;
        section: string;
        status: string;
        completedAt: null;
      }>,
      skipDuplicates: true,
    });
  });

  return { seeded: true, existingCount: totalExisting };
}

// ═══════════════════════════════════════════════════════════════
// Kombinasi Seeding Function
// ═══════════════════════════════════════════════════════════════

/**
 * Seed student_section_status rows for Kombinasi.
 *
 * Idempotent -- safe to call multiple times. The first section
 * (eksplorasi_kontekstual) is always unlocked on seed. Subsequent
 * sections start locked and are unlocked sequentially.
 *
 * NOTE: permutasi_vs_kombinasi (Panduan Definitif) is NOT seeded --
 * it's a read-only section not tracked in student_section_status.
 *
 * @param studentId - The internal student.id (INT) from Prisma.
 */
export async function seedKombinasiSectionStatus(
  studentId: number
): Promise<SeedResult> {
  const conceptIds = [...KOMBINASI_CONCEPT_IDS];

  const existingCounts = await Promise.all(
    conceptIds.map((cid) =>
      prisma.studentSectionStatus.count({
        where: { studentId, conceptId: cid },
      }).then((count) => ({ conceptId: cid, count }))
    )
  );

  const totalExisting = existingCounts.reduce((sum, c) => sum + c.count, 0);
  const conceptsToSeed = existingCounts
    .filter((c) => c.count === 0)
    .map((c) => c.conceptId);

  if (conceptsToSeed.length === 0) {
    return { seeded: false, existingCount: totalExisting };
  }

  const sectionsToSeed = KOMBINASI_SECTIONS.filter((item) =>
    conceptsToSeed.includes(item.conceptId)
  );

  const rows = sectionsToSeed.map((item, index) => {
    const isFirstInConcept = sectionsToSeed.findIndex(
      (s) => s.conceptId === item.conceptId
    ) === index;
    // First section is unlocked; others start locked
    const shouldUnlock = isFirstInConcept;

    return {
      studentId,
      conceptId: item.conceptId,
      section: item.section,
      status: shouldUnlock ? "unlocked" : "locked",
      completedAt: null,
    };
  });

  await prisma.$transaction(async (tx) => {
    await tx.studentSectionStatus.createMany({
      data: rows as Array<{
        studentId: number;
        conceptId: string;
        section: string;
        status: string;
        completedAt: null;
      }>,
      skipDuplicates: true,
    });
  });

  return { seeded: true, existingCount: totalExisting };
}

// ═══════════════════════════════════════════════════════════════
// Section Completion -- Shared Function
// ═══════════════════════════════════════════════════════════════

/**
 * Marks the current section as completed and unlocks the next sequential
 * section (if any) for the given student. This is the single shared function
 * called by both Trigger 1 (answer-based completion) and Trigger 2 (explicit
 * button-click completion for penjelasan_konsep).
 *
 * Rules:
 * 0. SEQUENTIAL INTEGRITY: Before marking the current section completed,
 *    any same-concept predecessor section that is not yet completed is
 *    backfilled as completed. This guarantees the DB never contains a
 *    completed section whose predecessor is still 'locked'/'unlocked'
 *    (root-cause fix for the bug: "penjelasan_konsep unlocked while
 *    contoh_soal completed", caused by client-side inference / fail-open
 *    navigation). Self-healing: even a buggy client cannot corrupt the
 *    sequential invariant.
 * 1. UPSERT current section: status = 'completed', completed_at = NOW().
 *    If the row doesn't exist (e.g., seed hasn't run yet), it will be created.
 * 2. Look up the next step from MATERI_SECTIONS (index + 1).
 * 3. If a next step exists, set its status to 'unlocked' ONLY if it is
 *    currently 'locked'. Never overwrite 'unlocked' or 'completed'.
 *    If the row doesn't exist, create it with 'unlocked'.
 * 4. SPECIAL CASE: When kaidah_perkalian.contoh_soal completes,
 *    the next section kaidah_perkalian.refleksi_mini MUST NOT
 *    be unlocked unless ALL aktivitas_siswa_entries for concept_id
 *    'kaidah_perkalian' are also completed.
 * 5. Cross-concept transition uses the SAME index+1 logic -- no special branching.
 *
 * The function can operate standalone (creates its own transaction) or be
 * passed an existing transaction client via `tx` to participate in a larger
 * transaction (e.g., answer insert + status update).
 *
 * @param studentId   - The internal student.id (INT) from Prisma.
 * @param conceptId   - The concept_id of the section being completed.
 * @param section     - The section name being completed.
 * @param tx          - Optional Prisma transaction client for composability.
 * @throws Error if the (conceptId, section) pair is not found in MATERI_SECTIONS.
 */
export async function completeSectionAndUnlockNext(
  studentId: number,
  conceptId: string,
  section: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx?: any
): Promise<void> {
  // tx is either a Prisma transaction client (from $transaction callback)
  // or undefined (use the global prisma singleton).
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const db: PrismaClient = tx ?? prisma;

  // ── Find current index in the unified ordered array ───────────
  const currentIndex = ALL_SECTIONS.findIndex(
    (entry) => entry.conceptId === conceptId && entry.section === section
  );

  if (currentIndex === -1) {
    throw new Error(
      `[completeSectionAndUnlockNext] Unknown section: concept_id=${conceptId}, section=${section}`
    );
  }

  // ── 0. Sequential integrity: backfill same-concept predecessors ──
  // Collect ALL sections of the SAME concept that come before the current
  // one. If any of them is missing or not completed, mark it completed
  // before proceeding. This keeps the prefix invariant:
  //   section N completed ⇒ sections 0..N-1 (same concept) completed.
  const predecessors: { conceptId: string; section: string }[] = [];
  for (let i = currentIndex - 1; i >= 0; i--) {
    const entry = ALL_SECTIONS[i];
    if (entry.conceptId !== conceptId) break;
    predecessors.push({ conceptId: entry.conceptId, section: entry.section });
  }

  if (predecessors.length > 0) {
    const predSections = predecessors.map((p) => p.section);
    const existingRows = await db.studentSectionStatus.findMany({
      where: {
        studentId,
        conceptId,
        section: { in: predSections },
      },
      select: { section: true, status: true },
    });
    const completedSet = new Set(
      existingRows
        .filter((r) => r.status === "completed")
        .map((r) => r.section)
    );
    const missing = predecessors.filter((p) => !completedSet.has(p.section));

    if (missing.length > 0) {
      const now = new Date();
      for (const pred of missing) {
        await db.studentSectionStatus.upsert({
          where: {
            studentId_conceptId_section: {
              studentId,
              conceptId,
              section: pred.section,
            },
          },
          create: {
            studentId,
            conceptId,
            section: pred.section,
            status: "completed",
            completedAt: now,
          },
          update: {
            status: "completed",
            completedAt: now,
          },
        });
      }
      console.warn(
        `[completeSectionAndUnlockNext] Backfilled ${missing.length} predecessor section(s) ` +
          `for student=${studentId} concept=${conceptId} before=${section}: ` +
          missing.map((m) => m.section).join(", ")
      );
    }
  }

  // ── 1. Mark current section as completed (upsert — resilient to missing rows) ──
  await db.studentSectionStatus.upsert({
    where: {
      studentId_conceptId_section: {
        studentId,
        conceptId,
        section,
      },
    },
    create: {
      studentId,
      conceptId,
      section,
      status: "completed",
      completedAt: new Date(),
    },
    update: {
      status: "completed",
      completedAt: new Date(),
    },
  });

  // ── 2. Look up the next step ─────────────────────────────────
  const nextIndex = currentIndex + 1;
  if (nextIndex >= ALL_SECTIONS.length) {
    // Current section is the last one -- nothing to unlock.
    return;
  }

  const nextEntry = ALL_SECTIONS[nextIndex];

  // ── 2a. Cross-family guard: don't unlock across concept families ──
  const MATERI_FAMILY = new Set<string>([...MATERI_CONCEPT_IDS]);
  const PERMUTASI_FAMILY = new Set<string>([...PERMUTASI_CONCEPT_IDS]);
  const KOMBINASI_FAMILY = new Set<string>([...KOMBINASI_CONCEPT_IDS]);
  const currentFamily = MATERI_FAMILY.has(conceptId) ? "materi" : PERMUTASI_FAMILY.has(conceptId) ? "permutasi" : KOMBINASI_FAMILY.has(conceptId) ? "kombinasi" : null;
  const nextFamily = MATERI_FAMILY.has(nextEntry.conceptId) ? "materi" : PERMUTASI_FAMILY.has(nextEntry.conceptId) ? "permutasi" : KOMBINASI_FAMILY.has(nextEntry.conceptId) ? "kombinasi" : null;
  if (currentFamily !== nextFamily) {
    // Don't unlock across concept families (e.g., faktorial → permutasi)
    return;
  }

  // ── 3. Special case: aktivitas_siswa gate for refleksi_mini ──
  // When completing kaidah_perkalian.contoh_soal (index 11), the next
  // section in the array is kaidah_perkalian.refleksi_mini (index 12).
  // refleksi_mini must NOT be unlocked until ALL aktivitas_siswa_entries
  // for kaidah_perkalian are completed.
  if (
    conceptId === "kaidah_perkalian" &&
    section === "contoh_soal"
  ) {
    const aktivitasStatus = await getAktivitasSiswaStatus(db, studentId, "kaidah_perkalian");
    if (!aktivitasStatus.allCompleted) {
      // aktivitas_siswa belum semua selesai -- jangan unlock refleksi_mini dulu
      return;
    }
  }

  // ── 4. Unlock next section (upsert — resilient to missing rows) ──
  // Uses ON CONFLICT ... DO UPDATE WHERE to only change status from 'locked' → 'unlocked'.
  // If the row doesn't exist, creates it with 'unlocked'.
  // If it exists as 'unlocked' or 'completed', leaves it unchanged.
  await db.$executeRawUnsafe(
    `INSERT INTO student_section_status (student_id, concept_id, section, status, completed_at)
     VALUES ($1, $2::concept_type, $3, 'unlocked', NULL)
     ON CONFLICT (student_id, concept_id, section)
     DO UPDATE SET status = 'unlocked'
     WHERE student_section_status.status = 'locked'`,
    studentId,
    nextEntry.conceptId,
    nextEntry.section
  );
}

// ═══════════════════════════════════════════════════════════════
// Aktivitas Siswa Helper
// ═══════════════════════════════════════════════════════════════

/**
 * Checks whether all aktivitas_siswa_entries for a given student+concept
 * are completed. Returns both the raw counts and a boolean flag.
 *
 * Called both from completeSectionAndUnlockNext (inside a transaction,
 * must use the transaction client) and from the status-fetching endpoint
 * (outside a transaction, uses the global prisma singleton).
 */
export async function getAktivitasSiswaStatus(
  db: PrismaClient,
  studentId: number,
  conceptId: string
): Promise<{ completedCount: number; totalCount: number; allCompleted: boolean }> {
  // Hitung total distinct question_key untuk concept_id ini
  // (total entries yang HARUS dikerjakan; asumsi: semua question_key
  // untuk concept_id ini tersedia di tabel aktivitas_siswa_entries atau
  // didefinisikan di aplikasi layer).
  //
  // Untuk sementara, kita hitung total dari entries yang already submitted
  // sebagai proxy. Kalau perlu hardcode total per concept, bisa di-refine.
  const completedCountResult = await db.aktivitasSiswaEntry.count({
    where: {
      studentId,
      conceptId,
      isCorrect: true,
    },
  });

  // Total entries yang harus dikerjakan ditentukan dari jumlah
  // distinct question_key di tabel untuk concept ini.
  // NOTE: Ini proxy -- idealnya totalCount diambil dari konstanta
  // atau dari tabel activity_templates. Untuk sekarang, kita asumsikan
  // completedCount >= threshold tertentu (misal: minimal 2 entry).
  // Akan di-refine jika ada tabel template aktivitas.
  const totalDistinctQuestions = await db.aktivitasSiswaEntry.groupBy({
    by: ["questionKey"],
    where: {
      conceptId,
    },
    _count: true,
  });

  // Count how many distinct question_key are completed correctly
  const correctDistinctResult = await db.aktivitasSiswaEntry.groupBy({
    by: ["questionKey"],
    where: {
      studentId,
      conceptId,
      isCorrect: true,
    },
    _count: true,
  });

  const totalCount = totalDistinctQuestions.length;
  const completedCount = correctDistinctResult.length;
  const allCompleted = totalCount > 0 && completedCount >= totalCount;

  return { completedCount, totalCount, allCompleted };
}

// ═══════════════════════════════════════════════════════════════
// Last-Question Detection Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Maps a (concept_id, section) pair to the question_key that represents
 * the final question in that section. Used to determine whether a given
 * answer submission is the "last question" in a section, which triggers
 * section completion (Trigger 1).
 *
 * Sections not listed here either have no questions (penjelasan_konsep)
 * or have only a single entry (aktivitas_deep_learning) where any
 * correct submission counts as the last.
 */
const LAST_QUESTION_KEY_MAP: Record<string, Record<string, string>> = {
  kaidah_penjumlahan: {
    apersepsi: "pengurus",
    pemantik: "rute_kurir",
    refleksi_sebelum_mulai: "refleksi_sebelum_mulai_2",
    eksplorasi_kontekstual: "operasi_matematika",
    contoh_soal: "penjumlahan_transport",
    refleksi_mini: "refleksi_penjumlahan_3",
  },
  kaidah_perkalian: {
    eksplorasi_kontekstual: "situasi_1",
    contoh_soal: "perkalian_bilangan",
    refleksi_mini: "refleksi_perkalian_3",
  },
  faktorial: {
    eksplorasi_kontekstual: "faktorialNotasi",
    contoh_soal: "penjumlahan_transport",
    refleksi_mini: "refleksi_faktorial_4",
  },
  permutasi_r_unsur_dari_n_unsur: {
    eksplorasi_kontekstual: "soal_2_hitung_medali",
  },
  permutasi_dengan_unsur_sama: {
    eksplorasi_kontekstual: "siapa_benar_ada",
  },
  permutasi_siklis: {
    eksplorasi_kontekstual: "permutasi_siklis_eksplorasi",
    contoh_soal: "contoh_7_totalAkhir",
    refleksi_mini: "refleksi_permutasi_4",
  },
  kombinasi: {
    eksplorasi_kontekstual: "tim_basket_urutan",
    contoh_soal: "c3_total",
    mengapa_corner: "mengapa_dikali_ditambah",
    refleksi_mini: "refleksi_4",
  },
};

/**
 * All question keys required for refleksi_mini per concept.
 * Used to check whether ALL refleksi questions have been answered correctly
 * after a batch submission to /api/refleksi-mini.
 */
const REFLEKSI_ALL_QUESTION_KEYS: Record<string, string[]> = {
  kaidah_penjumlahan: [
    "refleksi_penjumlahan_1",
    "refleksi_penjumlahan_2",
    "refleksi_penjumlahan_3",
  ],
  kaidah_perkalian: [
    "refleksi_perkalian_1",
    "refleksi_perkalian_2",
    "refleksi_perkalian_3",
  ],
  faktorial: [
    "refleksi_faktorial_1",
    "refleksi_faktorial_2",
    "refleksi_faktorial_3",
    "refleksi_faktorial_4",
  ],
  permutasi_r_unsur_dari_n_unsur: [
    "refleksi_permutasi_1",
    "refleksi_permutasi_2",
    "refleksi_permutasi_3",
    "refleksi_permutasi_4",
  ],
  permutasi_dengan_unsur_sama: [
    "refleksi_permutasi_1",
    "refleksi_permutasi_2",
    "refleksi_permutasi_3",
    "refleksi_permutasi_4",
  ],
  permutasi_siklis: [
    "refleksi_permutasi_1",
    "refleksi_permutasi_2",
    "refleksi_permutasi_3",
    "refleksi_permutasi_4",
  ],
  kombinasi: [
    "refleksi_1",
    "refleksi_2",
    "refleksi_3",
    "refleksi_4",
  ],
};

/**
 * Returns true if the given question_key is the last question for the
 * specified (concept_id, section) pair.
 *
 * For sections with a single entry (aktivitas_deep_learning), always
 * returns true since any submission is inherently the "last".
 */
export function isLastQuestionInSection(
  conceptId: string,
  section: string,
  questionKey: string
): boolean {
  // aktivitas_deep_learning has a single entry -- always last
  if (section === "aktivitas_deep_learning") {
    return true;
  }

  const conceptMap = LAST_QUESTION_KEY_MAP[conceptId];
  if (!conceptMap) return false;

  const lastKey = conceptMap[section];
  return lastKey === questionKey;
}

/**
 * Returns the set of all question keys required for refleksi_mini
 * for a given concept_id. Used for batch-completion checks.
 */
export function getRefleksiAllQuestionKeys(conceptId: string): string[] {
  return REFLEKSI_ALL_QUESTION_KEYS[conceptId] ?? [];
}
