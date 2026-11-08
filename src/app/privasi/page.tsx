import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Kombinara",
  description: "Data apa yang dikumpulkan Kombinara, untuk apa, dan siapa yang bisa melihatnya.",
};

// DRAF: isi disusun dari cara kerja kode saat ini (2026-11-08). Bagian <Isi> wajib dilengkapi penyelenggara sebelum terbit.
function Isi({ children }: { children: ReactNode }) {
  return <span className="rounded bg-[#FFFBEB] px-1 font-medium text-[#92400E]">[ISI: {children}]</span>;
}

function Bagian({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-[#346739]">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-[#2C2C2A]">{children}</div>
    </section>
  );
}

function Daftar({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivasiPage() {
  return (
    <div className="min-h-screen bg-white text-[#2C2C2A]">
      <header className="border-b border-[#34673926]">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" aria-label="Beranda Kombinara" className="inline-flex min-h-11 items-center">
            <Image src="/images/icon kombinara.png" alt="Kombinara" width={1742} height={448} className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-[#2C2C2A] sm:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-2 text-sm text-[#6B6B66]">
          Terakhir diperbarui: 08 November 2026
        </p>

        <Bagian title="Siapa kami">
          <p>
            Kombinara adalah e-modul interaktif kombinatorika untuk siswa SMA dan guru matematika. Kombinara dikelola
            oleh Siti Nur Baiti, S.Pd. M.Pd. Pertanyaan tentang data pribadi bisa dikirim ke sitibaiti18@student.uns.ac.id.
          </p>
        </Bagian>

        <Bagian title="Data yang dikumpulkan">
          <Daftar
            items={[
              <>
                <strong>Akun:</strong> email dan password. Password disimpan dalam bentuk tersandi (hash) oleh Supabase,
                jadi tidak bisa dibaca siapa pun. Kalau kamu masuk dengan Google, Kombinara menerima nama, email, dan
                foto profil akun Google-mu.
              </>,
              <>
                <strong>Profil siswa:</strong> nama lengkap, nomor absen, jenis kelamin, dan kelas (dari kode kelas yang
                kamu masukkan), serta foto profil kalau kamu mengunggahnya.
              </>,
              <>
                <strong>Profil guru:</strong> nama, email, sekolah (dari kode guru), dan kelas yang kamu ampu.
              </>,
              <>
                <strong>Hasil belajar:</strong> jawaban dan alasan yang kamu tulis, gambar jawaban tulisan tangan yang
                kamu kirim untuk dinilai, refleksi, asesmen diri, progres tiap bagian materi, nilai, waktu dan lama
                pengerjaan, serta jumlah percobaan.
              </>,
              <>
                <strong>Percakapan dengan Kombi:</strong> teks materi yang kamu blok, pertanyaanmu, jawaban Kombi, dan
                skor kedalaman pertanyaanmu.
              </>,
              <>
                <strong>Catatan selama asesmen:</strong> kapan kamu masuk atau keluar layar penuh, pindah tab atau
                jendela, menempel teks (hanya jumlah karakternya, bukan isinya), dan mengubah ukuran jendela, serta jenis
                perangkat yang dipakai (HP, tablet, atau laptop). Aplikasi tidak mengakses kamera, mikrofon, rekaman
                layar, atau isi tab lain.
              </>,
            ]}
          />
        </Bagian>

        <Bagian title="Untuk apa data dipakai">
          <Daftar
            items={[
              "Menyimpan progresmu dan membuka bagian materi berikutnya.",
              "Menilai jawaban dan memberi umpan balik, sebagian dengan bantuan AI.",
              "Menjawab pertanyaanmu lewat Kombi.",
              "Menampilkan progres, nilai, dan catatan asesmen kepada guru kelasmu.",
            ]}
          />
        </Bagian>

        <Bagian title="Siapa yang bisa melihat datamu">
          <Daftar
            items={[
              "Guru yang mengampu kelasmu: progres, jawaban, nilai, durasi, jumlah percobaan, dan catatan selama asesmen. Guru hanya bisa melihat siswa di kelas yang ia ampu, dan bisa mengunduh data itu ke file Excel.",
              "Pengelola Kombinara.",
              "Layanan pihak ketiga di bagian berikut, sebatas yang dibutuhkan untuk menjalankan aplikasi.",
            ]}
          />
        </Bagian>

        <Bagian title="Layanan pihak ketiga">
          <Daftar
            items={[
              <>
                <strong>Supabase:</strong> akun, database, dan penyimpanan foto profil. Foto profil disimpan dengan
                tautan publik, jadi siapa pun yang memegang tautannya bisa membuka foto itu.
              </>,
              <>
                <strong>OpenAI:</strong> memproses jawaban yang dinilai dengan AI, gambar jawaban tulisan tangan, dan
                pertanyaanmu ke Kombi.
              </>,
              <>
                <strong>Upstash:</strong> menyimpan cache, termasuk data profil dan jawaban Kombi. Pertanyaan ke Kombi
                disimpan bersama jawabannya supaya pertanyaan yang mirip, termasuk dari siswa lain, bisa dijawab lebih
                cepat. Jawaban di cache terhapus setelah 7 hari, sedangkan teks pertanyaannya saat ini tersimpan tanpa
                batas waktu. Karena itu, jangan menulis data pribadi di pertanyaan ke Kombi.
              </>,
              <>
                <strong>Google:</strong> hanya kalau kamu memilih masuk dengan Google.
              </>,
              <>
                <strong>Hosting:</strong> Vercel App sebagai penyedia layanan hosting.
              </>,
            ]}
          />
        </Bagian>

        <Bagian title="Penyimpanan di browser">
          <Daftar
            items={[
              "Cookie sesi dari Supabase, supaya kamu tetap masuk.",
              "localStorage, untuk mengingat pengumuman Kombi yang sudah kamu tutup.",
              "sessionStorage, untuk menyimpan sementara kode kelas saat mendaftar dan hasil penilaian yang sedang tampil. Isinya hilang saat tab ditutup.",
            ]}
          />
          <p>Kombinara tidak memasang iklan atau alat pelacak analitik pihak ketiga.</p>
        </Bagian>

        <Bagian title="Berapa lama data disimpan">
          <p>
            Data disimpan selama tahun ajaran berlangsung dan akan dihapus setelahnya. 
          </p>
        </Bagian>

        <Bagian title="Siswa di bawah 18 tahun">
          <p>
            Sebagian besar pengguna Kombinara adalah siswa SMA, termasuk yang belum berusia 18 tahun.{" "}
          </p>
        </Bagian>

        <Bagian title="Hak kamu">
          <Daftar
            items={[
              "Melihat dan mengubah nama, nomor absen, dan foto profil di halaman Profil.",
              <>
                Meminta salinan data, koreksi data lain, atau penghapusan akun lewat sitibaiti18@student.uns.ac.id. Aplikasi
                belum punya tombol hapus akun sendiri.
              </>,
              <>
                Permintaan diproses dalam 5 hari kerja.
              </>,
            ]}
          />
        </Bagian>

        <Bagian title="Keamanan">
          <Daftar
            items={[
              "Password tidak disimpan dalam bentuk aslinya.",
              "Peran akun (siswa atau guru) hanya bisa diubah dari server, bukan dari browser.",
              "Akses guru dibatasi ke kelas yang ia ampu.",
            ]}
          />
        </Bagian>

        <Bagian title="Perubahan kebijakan">
          <p>
            Kalau kebijakan ini berubah, tanggal di bagian atas ikut diperbarui.{" "}
          </p>
        </Bagian>
      </main>

      <LandingFooter />
    </div>
  );
}
