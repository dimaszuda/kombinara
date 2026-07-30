/**
 * One-shot script to fix refleksi_mini CHECK constraint.
 * Run: npx tsx scripts/fix-refleksi-mini-constraint.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Manual .env.local loader (no external dependency needed)
function loadEnvLocal() {
  const envPath = resolve(__dirname, "..", ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
  console.log("  ✓ Loaded .env.local");
}
loadEnvLocal();

import { prisma } from "../src/lib/prisma/client";

async function main() {
  console.log("🔧 Fixing refleksi_mini CHECK constraint...");

  // Drop old constraint (ignore if doesn't exist)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE refleksi_mini
    DROP CONSTRAINT IF EXISTS refleksi_mini_concept_id_check
  `);
  console.log("  ✓ Dropped old constraint (if any)");

  // Add new constraint with all valid concept_ids
  await prisma.$executeRawUnsafe(`
    ALTER TABLE refleksi_mini
    ADD CONSTRAINT refleksi_mini_concept_id_check
    CHECK (concept_id IN (
      'kaidah_penjumlahan',
      'kaidah_perkalian',
      'permutasi',
      'permutasi_r_unsur_dari_n_unsur',
      'permutasi_dengan_unsur_sama',
      'permutasi_siklis',
      'kombinasi',
      'faktorial'
    ))
  `);
  console.log("  ✓ Added new constraint with all concept_ids");

  await prisma.$disconnect();
  console.log("✅ Done! refleksi_mini constraint updated.");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
