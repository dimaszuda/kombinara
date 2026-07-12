// Edge Runtime — handwritten answer evaluation
// Model: Claude Sonnet 4 Vision (high stakes, no streaming)
// Flow: PNG base64 -> Claude Vision -> JSON feedback
// Response shape: { ocr_result, is_correct, score, feedback, correction }
export const runtime = "edge";

export async function POST(_req: Request) {
  // TODO: Implement
  // 1. Parse { imageBase64, soal, rubrik, quizId, soalId }
  // 2. Forward ke Claude Sonnet 4 dengan vision + strict JSON prompt
  // 3. Validate JSON response shape
  // 4. Simpan hasil ke DB
  // 5. Return feedback ke client
  return new Response("Not implemented", { status: 501 });
}
