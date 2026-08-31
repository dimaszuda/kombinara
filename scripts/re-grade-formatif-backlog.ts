/**
 * Re-grade semua submission Asesmen Formatif yang masih tertahan.
 *
 * Tujuan:
 * 1. Cari row dengan total_score / ai_feedback / evaluated_at null
 * 2. Jalankan evaluateAnswers(...) untuk masing-masing row
 * 3. Simpan hasil kembali ke tabel asesmen_formatif_submissions
 *
 * Penggunaan:
 *   Get-Content .env.local | ... ; npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/re-grade-formatif-backlog.ts
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/re-grade-formatif-backlog.ts --dry-run
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/re-grade-formatif-backlog.ts --limit=5
 */

import { prisma } from "../src/lib/prisma/client";
import { evaluateAnswers } from "../src/lib/evaluation/run-submission-evaluation";

interface ParsedArgs {
  dryRun: boolean;
  limit: number | null;
}

function parseArgs(argv: string[]): ParsedArgs {
  let dryRun = false;
  let limit: number | null = null;

  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
    }

    const match = arg.match(/^--limit=(\d+)$/);
    if (match) {
      limit = Number(match[1]);
    }
  }

  return { dryRun, limit };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeAnswers(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function main() {
  const { dryRun, limit } = parseArgs(process.argv.slice(2));

  const rows = await prisma.asesmenFormatifSubmission.findMany({
    where: {
      OR: [
        { evaluatedAt: null },
        { totalScore: null },
        { aiFeedback: null },
      ],
    },
    include: {
      module: true,
    },
    orderBy: { id: "asc" },
    ...(limit ? { take: limit } : {}),
  });

  console.log(
    `[backfill] ${dryRun ? "DRY-RUN" : "LIVE"} — ${rows.length} submission tertahan ditemukan`
  );

  let ok = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const answers = normalizeAnswers(row.answers);
      const outcome = await evaluateAnswers(
        answers as Array<{ question_number: number; cara_mengerjakan: string; jawaban_akhir: string }>,
        row.module.slug
      );

      console.log(
        `[${i + 1}/${rows.length}] submission #${row.id} (${row.module.slug}) -> total=${outcome.totalScore}, ai=${outcome.aiFeedback.slice(0, 80).replace(/\s+/g, " ")}`
      );

      if (!dryRun) {
        await prisma.asesmenFormatifSubmission.update({
          where: { id: row.id },
          data: {
            totalScore: outcome.totalScore,
            perQuestionResults: outcome.perQuestionResults as unknown as object,
            aiFeedback: outcome.aiFeedback,
            evaluatedAt: new Date(),
            aiModel: "gpt-4o",
          },
        });
      }

      ok++;
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✗ submission #${row.id} gagal: ${message}`);
    }

    if (!dryRun && i < rows.length - 1) {
      await sleep(1500);
    }
  }

  console.log(`\nSelesai: ${ok} berhasil, ${failed} gagal.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
