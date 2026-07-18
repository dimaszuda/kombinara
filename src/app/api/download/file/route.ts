/**
 * Download Modul — File API
 *
 * GET /api/download/file?file=<key>
 *   -> Server-side eligibility verification, then returns a signed URL
 *      from Supabase Storage for the requested file.
 *
 * Supported file keys:
 *   pendahuluan, kaidah-pencacahan, faktorial, permutasi, kombinasi, bagian-akhir
 *
 * Security: eligibility is re-checked server-side so the client cannot
 * bypass the check by calling the storage API directly.
 *
 * Response (200):  { signedUrl: string }
 * Response (403):  { error: string }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// ─── Constants ──────────────────────────────────────────────────────────────

const PENDAHULUAN_REQUIREMENTS = [
  { conceptId: "kaidah_penjumlahan", section: "apersepsi" },
  { conceptId: "kaidah_penjumlahan", section: "pemantik" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_sebelum_mulai" },
];

const KAIDAH_PENCACAHAN_REQUIREMENTS = [
  { conceptId: "kaidah_penjumlahan", section: "apersepsi" },
  { conceptId: "kaidah_penjumlahan", section: "pemantik" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_sebelum_mulai" },
  { conceptId: "kaidah_penjumlahan", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_penjumlahan", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_penjumlahan", section: "penjelasan_konsep" },
  { conceptId: "kaidah_penjumlahan", section: "contoh_soal" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_mini" },
  { conceptId: "kaidah_perkalian", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_perkalian", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_perkalian", section: "penjelasan_konsep" },
  { conceptId: "kaidah_perkalian", section: "contoh_soal" },
  { conceptId: "kaidah_perkalian", section: "refleksi_mini" },
];

/** Concept-level moduls: eligibility = semua section di concept_id tsb completed. */
const CONCEPT_MODULS: Array<{ key: string; conceptId: string }> = [
  { key: "faktorial", conceptId: "faktorial" },
  { key: "permutasi", conceptId: "permutasi" },
  { key: "kombinasi", conceptId: "kombinasi" },
];

const ALL_CONCEPT_IDS = [
  "kaidah_penjumlahan",
  "kaidah_perkalian",
  ...CONCEPT_MODULS.map((m) => m.conceptId),
];

const FILE_PATHS: Record<string, string> = {
  pendahuluan: "Pendahuluan Modul.pdf",
  "kaidah-pencacahan": "Kaidah Pencacahan.pdf",
  faktorial: "Faktorial.pdf",
  permutasi: "Permutasi.pdf",
  kombinasi: "Kombinasi.pdf",
  "bagian-akhir": "Bagian Akhir Modul.pdf",
};

const SIGNED_URL_EXPIRY = 300; // 5 menit

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildKey(conceptId: string, section: string): string {
  return `${conceptId}::${section}`;
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    // ── Validate file param ─────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get("file");

    if (!fileKey || !(fileKey in FILE_PATHS)) {
      return NextResponse.json(
        { error: `Invalid file parameter. Supported: ${Object.keys(FILE_PATHS).join(", ")}` },
        { status: 400 }
      );
    }

    // ── Auth ────────────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // ── Fetch section statuses ──────────────────────────────────────
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: { in: ALL_CONCEPT_IDS },
      },
      select: {
        conceptId: true,
        section: true,
        status: true,
      },
    });

    const statusMap = new Map<string, string>();
    for (const row of rows) {
      statusMap.set(buildKey(row.conceptId, row.section), row.status);
    }

    // ── Eligibility check ───────────────────────────────────────────
    let isBlocked = false;

    if (fileKey === "pendahuluan") {
      const missing = PENDAHULUAN_REQUIREMENTS.filter(
        (r) => statusMap.get(buildKey(r.conceptId, r.section)) !== "completed"
      );
      isBlocked = missing.length > 0;
    } else if (fileKey === "kaidah-pencacahan") {
      const missing = KAIDAH_PENCACAHAN_REQUIREMENTS.filter(
        (r) => statusMap.get(buildKey(r.conceptId, r.section)) !== "completed"
      );
      const submission = await prisma.asesmenFormatifSubmission.findFirst({
        where: { studentId: student.id },
        select: { id: true },
      });
      isBlocked = missing.length > 0 || !submission;
    } else if (fileKey === "bagian-akhir") {
      // Semua concept + asesmen formatif harus selesai
      const allRequirements = [
        ...KAIDAH_PENCACAHAN_REQUIREMENTS,
        ...CONCEPT_MODULS.flatMap((m) =>
          rows.filter((r) => r.conceptId === m.conceptId).map((r) => ({
            conceptId: r.conceptId,
            section: r.section,
          }))
        ),
      ];
      // Cek setiap concept punya section (tidak kosong)
      const conceptsWithData = new Set(rows.map((r) => r.conceptId));
      const allConceptsPresent = CONCEPT_MODULS.every((m) => conceptsWithData.has(m.conceptId));
      if (!allConceptsPresent) {
        isBlocked = true;
      } else {
        const missing = allRequirements.filter(
          (r) => statusMap.get(buildKey(r.conceptId, r.section)) !== "completed"
        );
        const submission = await prisma.asesmenFormatifSubmission.findFirst({
          where: { studentId: student.id },
          select: { id: true },
        });
        isBlocked = missing.length > 0 || !submission;
      }
    } else {
      // Concept-level: faktorial, permutasi, kombinasi
      const conceptModul = CONCEPT_MODULS.find((m) => m.key === fileKey);
      if (!conceptModul) {
        isBlocked = true;
      } else {
        const conceptSections = rows.filter((r) => r.conceptId === conceptModul.conceptId);
        if (conceptSections.length === 0) {
          isBlocked = true; // belum ada section sama sekali
        } else {
          const missing = conceptSections.filter((r) => r.status !== "completed");
          isBlocked = missing.length > 0;
        }
      }
    }

    if (isBlocked) {
      return NextResponse.json(
        { error: "Kamu belum menyelesaikan semua section yang diperlukan untuk mendownload modul ini." },
        { status: 403 }
      );
    }

    // ── Generate signed URL ─────────────────────────────────────────
    const filePath = FILE_PATHS[fileKey];
    const { data, error: storageError } = await supabase.storage
      .from("E-Modul Kombinatorika")
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

    if (storageError) {
      console.error("[GET /api/download/file] Storage error:", storageError);
      return NextResponse.json(
        { error: "Gagal generate download URL. Silakan coba lagi." },
        { status: 500 }
      );
    }

    if (!data?.signedUrl) {
      return NextResponse.json(
        { error: "Download URL tidak tersedia." },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error("[GET /api/download/file] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
