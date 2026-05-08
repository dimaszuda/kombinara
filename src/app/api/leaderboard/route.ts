// Leaderboard — query dari materialized view PostgreSQL
// View di-refresh periodik (cron atau on-demand setelah activity update)
export async function GET(req: Request) {
  // TODO: Query leaderboard_mv (materialized view)
  // Params: kelasId, sortBy: "activity_score" | "completion_rate"
  return new Response("Not implemented", { status: 501 });
}
