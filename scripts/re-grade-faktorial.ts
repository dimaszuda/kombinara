/**
 * Re-grade submissions Faktorial dengan aturan evaluasi terbaru.
 *
 * HANYA menyentuh modul faktorial (filter `modules.slug = 'faktorial'`),
 * materi lain tidak tersentuh.
 *
 * Yang dilakukan per submission:
 * 1. Heal jawaban soal 4 yang terkorupsi format "| | |" (bug lama).
 * 2. Evaluasi ulang dengan aturan baru (deterministik + AI).
 * 3. Update kolom: total_score, per_question_results, ai_feedback,
 *    evaluated_at, ai_model, DAN kolom answers (versi bersih).
 *
 * Usage (jalankan dari root project):
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/re-grade-faktorial.ts --dry-run
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/re-grade-faktorial.ts
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/re-grade-faktorial.ts --ids=12,34,56
 *
 * PENTING:
 * - Selalu jalankan --dry-run dulu untuk melihat delta skor.
 * - Script memanggil AI (gpt-4o) per soal — ada jeda 1 detik antar submission.
 */

import { prisma } from "../src/lib/prisma/client";
import {
  evaluateAnswers,
  healSoal4TableText,
} from "../src/lib/evaluation/run-submission-evaluation";
import type { SubmittedAnswer } from "../src/lib/evaluation/run-submission-evaluation";

const DELAY_BETWEEN_SUBMISSIONS_MS = 1000;

interface SubmissionRow {
  id: number;
  studentId: number;
  totalScore: number | null;
  answers: SubmittedAnswer[];
}

function parseArgs(argv: string[]): { dryRun: boolean; ids: number[] } {
  let dryRun = false;
  let ids: number[] = [];
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    const m = arg.match(/^--ids=(.+)$/);
    if (m) {
      ids = m[1]
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0);
    }
  }
  return { dryRun, ids };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { dryRun, ids } = parseArgs(process.argv.slice(2));

  const where =
    ids.length > 0
      ? { id: { in: ids }, module: { slug: "faktorial" } }
      : { module: { slug: "faktorial" } };

  const submissions = await prisma.asesmenFormatifSubmission.findMany({
    where,
    orderBy: { id: "asc" },
    select: { id: true, studentId: true, totalScore: true, answers: true },
  });

  console.log(
    `[re-grade] ${dryRun ? "DRY-RUN" : "LIVE"} — ${submissions.length} submission faktorial ditemukan` +
      (ids.length > 0 ? ` (filter ids: ${ids.join(", ")})` : "") +
      "\n"
  );

  let ok = 0;
  let failed = 0;
  const failures: { id: number; error: string }[] = [];

  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i] as unknown as SubmissionRow;
    const oldScore = sub.totalScore ?? null;

    try {
      // 1. Heal jawaban soal 4 (kolom answers ikut diperbarui).
      const healedAnswers = (sub.answers as SubmittedAnswer[]).map((a) =>
        a.question_number === 4
          ? { ...a, jawaban_akhir: healSoal4TableText(a.jawaban_akhir ?? "") }
          : a
      );

      // 2. Evaluasi ulang dengan aturan baru.
      const outcome = await evaluateAnswers(healedAnswers, "faktorial");

      console.log(
        `[${i + 1}/${submissions.length}] submission #${sub.id} | student #${sub.studentId} | ` +
          `skor ${oldScore ?? "-"} → ${outcome.totalScore}` +
          (dryRun ? " (dry-run, tidak disimpan)" : "")
      );

      // 3. Simpan hasil (kecuali dry-run).
      if (!dryRun) {
        await prisma.asesmenFormatifSubmission.update({
          where: { id: sub.id },
          data: {
            totalScore: outcome.totalScore,
            perQuestionResults: outcome.perQuestionResults as unknown as object,
            aiFeedback: outcome.aiFeedback,
            evaluatedAt: new Date(),
            aiModel: "gpt-4o",
            answers: healedAnswers as unknown as object,
          },
        });
      }
      ok++;
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      failures.push({ id: sub.id, error: message });
      console.error(`  ✗ submission #${sub.id} GAGAL: ${message}`);
    }

    // Jeda antar submission agar tidak kena rate-limit AI.
    if (i < submissions.length - 1) {
      await sleep(DELAY_BETWEEN_SUBMISSIONS_MS);
    }
  }

  console.log(`\nSelesai: ${ok} berhasil, ${failed} gagal.`);
  if (failures.length > 0) {
    console.log("Submission gagal:");
    for (const f of failures) {
      console.log(`  - #${f.id}: ${f.error}`);
    }
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
