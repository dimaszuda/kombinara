// Reading progress tracking — dipanggil Intersection Observer
// Payload: { materiSlug, sectionId, timeOnSectionSeconds }
export async function POST(req: Request) {
  // TODO: Upsert reading_progress di DB
  // Hitung reading_engagement score berdasarkan akumulasi time-on-section
  return new Response("Not implemented", { status: 501 });
}

export async function GET(req: Request) {
  // TODO: Get progress siswa by materiSlug
  return new Response("Not implemented", { status: 501 });
}
