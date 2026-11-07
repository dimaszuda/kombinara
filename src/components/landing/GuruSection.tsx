import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MATERI_CARDS } from "@/lib/data/siswa-dashboard";
import SectionHeading from "./SectionHeading";
import { IconCheckSmall } from "./icons";

const GURU_POINTS = [
  "Progres tiap siswa per materi dan per bagian materi",
  "Hasil asesmen diagnostik dan latihan pemahaman: sebaran nilai, durasi, dan jumlah percobaan",
  "Catatan aktivitas selama asesmen, seperti keluar layar penuh, pindah tab, atau menempel teks",
  "Kelola kelas dan bagikan kode kelas ke siswa",
  "Unduh data dashboard ke Excel",
];

/** Lebar batang ilustrasi — dekoratif, bukan data sungguhan. */
const MOCK_BAR_WIDTHS = ["w-[85%]", "w-[65%]", "w-[45%]", "w-[30%]"];

export default function GuruSection() {
  return (
    <section id="guru" className="scroll-mt-20 bg-[#346739] py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <ScrollReveal>
          <SectionHeading
            inverted
            align="left"
            eyebrow="Untuk Guru"
            title="Pantau perkembangan belajar siswa di kelasmu"
            description="Learning Dashboard merangkum apa yang dikerjakan siswa, sehingga kamu tahu siapa yang perlu dibantu dan di bagian mana."
          />

          <ul className="mt-8 space-y-3">
            {GURU_POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-relaxed text-white/90 sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DBFFD5] text-[#346739]">
                  <IconCheckSmall className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
          <p className="mt-3 text-sm text-white/70">Pendaftaran guru memerlukan kode guru dari sekolahmu.</p>
        </ScrollReveal>

        {/* Ilustrasi dashboard (dekoratif) */}
        <ScrollReveal variant="fade-left" delay={150}>
          <div aria-hidden="true" className="rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#346739]">Learning Dashboard</span>
              <span className="rounded-full bg-[#F3E8F2] px-3 py-1 text-xs font-medium text-[#663362]">Kelas Saya</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {["Siswa", "Diagnostik", "Formatif"].map((label) => (
                <div key={label} className="rounded-xl bg-[#F5F5F0] p-3">
                  <div className="h-2 w-10 rounded bg-[#C5C5C0]" />
                  <div className="mt-3 h-5 w-12 rounded bg-[#346739]" />
                  <p className="mt-2 text-xs text-[#6B6B66]">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs font-medium text-[#663362]">Progres per materi</p>
            <div className="mt-3 space-y-3">
              {MATERI_CARDS.map((materi, index) => (
                <div key={materi.id}>
                  <p className="text-xs text-[#2C2C2A]">{materi.title}</p>
                  <div className="mt-1 h-2.5 w-full rounded-full bg-[#E5E5E0]">
                    <div className={`h-2.5 rounded-full bg-[#346739] ${MOCK_BAR_WIDTHS[index] ?? "w-1/4"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
