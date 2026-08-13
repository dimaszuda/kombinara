const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const subs = await p.asesmenFormatifSubmission.findMany({
    where: { conceptId: "faktorial", evaluatedAt: { not: null } },
    orderBy: { evaluatedAt: "desc" },
    take: 3,
    select: { id: true, totalScore: true, evaluatedAt: true, perQuestionResults: true },
  });

  for (const s of subs) {
    console.log(`\n===== Submission #${s.id} | total=${s.totalScore} | ${s.evaluatedAt} =====`);
    const perQuestion = Array.isArray(s.perQuestionResults) ? s.perQuestionResults : [];
    for (const q of perQuestion) {
      console.log(
        `  Q${q.question_number}: total=${q.total_score} | process_raw=${q.process_raw_score} | process_scaled=${q.process_scaled_score} | final_answer=${q.final_answer_score} | guardrail=${q.guardrail_applied} | mistake=${q.mistake_category}`
      );
      if (q.step_by_step) {
        const sbs = q.step_by_step;
        console.log(
          `    identifikasi=${sbs.identifikasi_kondisi?.score} pemilihan=${sbs.pemilihan_rumus?.score} eksekusi=${sbs.eksekusi_perhitungan?.score} justifikasi=${sbs.justifikasi?.score}`
        );
      }
    }
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  p.$disconnect();
});
