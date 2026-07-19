const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check integrity_events columns
  const cols = await p.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'integrity_events' ORDER BY ordinal_position`
  );
  console.log("=== integrity_events columns ===");
  console.log(JSON.stringify(cols, null, 2));

  // Check if table exists
  const tables = await p.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('integrity_events', 'asesmen_formatif_attempts')`
  );
  console.log("\n=== Existing tables ===");
  console.log(JSON.stringify(tables, null, 2));

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  p.$disconnect();
});
