import { prisma } from "../src/lib/prisma/client";

async function main() {
  const result = await prisma.$queryRaw<
    Array<{ conname: string }>
  >`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'aktivitas_deep_learning'::regclass
      AND contype = 'u'
  `;
  console.log("Unique constraints on aktivitas_deep_learning:", JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
