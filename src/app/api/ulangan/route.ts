// Ulangan handler
// - POST: submit jawaban incremental
// - PATCH: auto-submit saat timer habis
export async function POST(_req: Request) {
  // TODO: Incremental answer submission
  return new Response("Not implemented", { status: 501 });
}

export async function PATCH(_req: Request) {
  // TODO: Auto-submit / force-close ulangan session
  return new Response("Not implemented", { status: 501 });
}
