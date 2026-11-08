import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { IconCheckSmall } from "./icons";

const GURU_POINTS = [
  "Progres tiap siswa per materi dan per bagian materi",
  "Hasil asesmen diagnostik dan latihan pemahaman: sebaran nilai, durasi, dan jumlah percobaan",
  "Catatan aktivitas selama asesmen, seperti keluar layar penuh, pindah tab, atau menempel teks",
  "Kelola kelas dan bagikan kode kelas ke siswa",
  "Unduh data dashboard ke Excel",
];

export default function GuruSection() {
  return (
    <section id="guru" className="scroll-mt-20 bg-[#346739] py-16 sm:py-20">
      {/* Urutan DOM = urutan baca di HP (judul, daftar, tombol); di desktop daftar pindah ke kolom kanan. */}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-x-16">
        <SectionHeading
          inverted
          title="Pantau perkembangan belajar siswa di kelasmu"
          description="Learning Dashboard merangkum apa yang dikerjakan siswa, sehingga kamu tahu siapa yang perlu dibantu dan di bagian mana."
        />

        <ul className="space-y-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          {GURU_POINTS.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-relaxed text-white/90 sm:text-base">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DBFFD5] text-[#346739]">
                <IconCheckSmall className="h-3 w-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/daftar-guru"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-medium text-[#346739] transition-colors hover:bg-[#DBFFD5] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#346739]"
            >
              Daftar sebagai Guru
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border-2 border-white px-8 py-3 text-base font-medium text-white transition-colors hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#346739]"
            >
              Masuk
            </Link>
          </div>
          <p className="mt-3 text-sm text-white/80">Pendaftaran guru memerlukan kode guru dari sekolahmu.</p>
        </div>
      </div>
    </section>
  );
}
