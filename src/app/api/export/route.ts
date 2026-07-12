// PDF export rekap hasil ulangan
// Library: jsPDF
// Output: PDF blob yang di-download client-side
export async function GET(_req: Request) {
  // TODO:
  // 1. Fetch ulangan results dari DB by ulanganId
  // 2. Generate PDF dengan jsPDF (server-side atau trigger client-side)
  // 3. Return blob atau signed URL Supabase Storage
  return new Response("Not implemented", { status: 501 });
}
