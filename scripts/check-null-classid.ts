import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  // Cek ada berapa student dengan class_id NULL
  const nullCount = await p.$queryRawUnsafe<Array<{ cnt: bigint }>>(
    `SELECT count(*) as cnt FROM students WHERE class_id IS NULL`
  );
  console.log("Students with NULL classId:", Number(nullCount[0].cnt));

  // Total students
  const total = await p.$queryRawUnsafe<Array<{ cnt: bigint }>>(
    `SELECT count(*) as cnt FROM students`
  );
  console.log("Total students:", Number(total[0].cnt));

  // Total classes
  const classCount = await p.$queryRawUnsafe<Array<{ cnt: bigint }>>(
    `SELECT count(*) as cnt FROM classes`
  );
  console.log("Total classes:", Number(classCount[0].cnt));

  // Cek FK constraint
  const fkInfo = await p.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT
      tc.constraint_name,
      tc.constraint_type,
      rc.delete_rule
     FROM information_schema.table_constraints tc
     LEFT JOIN information_schema.referential_constraints rc
       ON tc.constraint_name = rc.constraint_name
     WHERE tc.table_name = 'students'
       AND tc.constraint_type = 'FOREIGN KEY'
       AND rc.unique_constraint_name IS NOT NULL`
  );
  console.log("\nFK constraints on students:", JSON.stringify(fkInfo, null, 2));

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  p.$disconnect();
});
