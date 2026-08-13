const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const subs = await p.asesmenFormatifSubmission.findMany({
    where: { conceptId: "faktorial", evaluatedAt: { not: null } },
    orderBy: { evaluatedAt: "desc" },
    take: 4,
    select: { id: true, totalScore: true, evaluatedAt: true, answers: true, perQuestionResults: true },
  });

  for (const s of subs) {
    console.log(`\n===== Submission #${s.id} | total=${s.totalScore} | ${s.evaluatedAt} =====`);
    const answers = Array.isArray(s.answers) ? s.answers : [];
    const perQuestion = Array.isArray(s.perQuestionResults) ? s.perQuestionResults : [];
    for (const a of answers) {
      if (![4, 5, 7].includes(a.question_number)) continue;
      console.log(`\n--- Q${a.question_number} ---`);
      console.log(`cara_mengerjakan: ${JSON.stringify(a.cara_mengerjakan)}`);
      console.log(`jawaban_akhir: ${JSON.stringify(a.jawaban_akhir)}`);
      const q = perQuestion.find((r) => r.question_number === a.question_number);
      if (q) {
        console.log(
          `  SCORE: total=${q.total_score} raw=${q.process_raw_score} scaled=${q.process_scaled_score} final=${q.final_answer_score} guardrail=${JSON.stringify(q.guardrail_applied)} mistake=${q.mistake_category}`
        );
        console.log(`  feedback: ${q.feedback}`);
      }
    }
  }
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  p.$disconnect();
});
