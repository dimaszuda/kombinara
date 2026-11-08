"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Hampir semua page app adalah client component (tidak bisa export metadata), jadi judul tab diatur dari path.
const PAGES: Record<string, string> = {
  "/login": "Masuk",
  "/signup": "Daftar Akun",
  "/join": "Masukkan Kode Kelas",
  "/daftar-guru": "Daftar sebagai Guru",
  "/complete-profil": "Lengkapi Profil",
  "/forgot-password": "Lupa Password",
  "/reset-password": "Reset Password",
  "/siswa": "Dashboard",
  "/siswa/materi": "Materi",
  "/siswa/materi/penutup": "Halaman Penutup",
  "/siswa/activity": "Aktivitas Siswa",
  "/siswa/ulangan": "Latihan Pemahaman",
  "/siswa/download": "Download Modul",
  "/siswa/leaderboard": "Leaderboard",
  "/siswa/profile": "Profil",
  "/guru": "Beranda Guru",
  "/guru/dashboard": "Learning Dashboard",
  "/guru/kelas": "Kelas Saya",
};

const SECTION: Record<string, string> = { materi: "Materi", activity: "Aktivitas", ulangan: "Latihan Pemahaman" };
const MATERI: Record<string, string> = {
  "kaidah-pencacahan": "Kaidah Pencacahan",
  faktorial: "Faktorial",
  permutasi: "Permutasi",
  kombinasi: "Kombinasi",
};

export function pageTitle(path: string): string {
  const [, , section, slug, nomor] = path.split("/");
  const name =
    PAGES[path] ??
    (SECTION[section] && MATERI[slug] ? [SECTION[section], MATERI[slug], nomor].filter(Boolean).join(" ") : null);
  return name ? `${name} | Kombinara` : "Kombinara";
}

export default function PageTitle() {
  const pathname = usePathname();
  useEffect(() => {
    document.title = pageTitle(pathname);
  }, [pathname]);
  return null;
}
