const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const sub = await p.asesmenFormatifSubmission.findUnique({
    where: { id: 100 },
    select: { answers: true },
  });
  const answers = Array.isArray(sub?.answers) ? sub.answers : [];
  for (const a of answers) {
    console.log(`\n===== Q${a.question_number} =====`);
    console.log(`cara_mengerjakan: ${JSON.stringify(a.cara_mengerjakan)}`);
    console.log(`jawaban_akhir: ${JSON.stringify(a.jawaban_akhir)}`);
  }
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  p.$disconnect();
});
