// Activity score recalculation endpoint
// Dipanggil setelah: depth score update, quiz submit, reading progress update
// Formula: (reading * w1) + (freq * w2) + (depth * w3) + (quiz * w4)
// Bobot w1-w4 diambil dari class_settings di DB
export async function POST(req: Request) {
  // TODO: Recalculate dan upsert activity_score untuk siswa
  return new Response("Not implemented", { status: 501 });
}

export async function GET(req: Request) {
  // TODO: Get current activity breakdown per siswa (untuk guru dashboard)
  return new Response("Not implemented", { status: 501 });
}
