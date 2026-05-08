// Async depth scoring — dipanggil background setelah chat Q&A selesai
// Model: Claude Sonnet 4 (scoring butuh reasoning yang baik)
// Output: { score: 1-5, category: "clarification"|"conceptual"|"application"|"critical" }
export const runtime = "edge";

export async function POST(req: Request) {
  // TODO: Implement
  // 1. Parse { questionId, question, context }
  // 2. Kirim ke Claude Sonnet 4 dengan rubrik scoring eksplisit
  // 3. Validate JSON output
  // 4. Update question_depth di DB
  // 5. Trigger recalculation activity_score untuk siswa tersebut
  return new Response("Not implemented", { status: 501 });
}
