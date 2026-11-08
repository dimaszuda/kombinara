import Link from "next/link";

// TODO: Leaderboard kelas
// - Berbasis total activity score atau completion rate (configurable)
// - Query dari materialized view PostgreSQL — refresh periodik
// - Highlight posisi siswa yang sedang login
export default function LeaderboardPage() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-start gap-3 py-12">
      <h1 className="text-2xl font-bold text-brand-600">Leaderboard kelas</h1>
      <p className="text-[#2C2C2A]">Segera hadir. Halaman ini belum bisa dipakai.</p>
      <Link
        href="/siswa"
        className="inline-flex min-h-11 items-center rounded-full bg-brand-600 px-5 font-semibold text-white hover:bg-[#2C5830] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
      >
        Kembali ke Dashboard
      </Link>
    </section>
  );
}
