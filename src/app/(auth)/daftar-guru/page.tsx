"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClass = "w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none";

export default function DaftarGuruPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [kodeGuru, setKodeGuru] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) { setError("Nama lengkap wajib diisi"); return; }
    if (!email.trim()) { setError("Email wajib diisi"); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }
    if (password !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return; }
    if (!kodeGuru.trim()) { setError("Kode guru wajib diisi"); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup-guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          email: email.trim(),
          password,
          teacherCode: kodeGuru.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal membuat akun guru");
      }

      // Langsung masuk, lalu atur kelas yang diajar
      const supabase = createSupabaseBrowserClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      router.push(loginError ? "/login?signup=success" : "/guru/kelas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-start px-4 md:px-8 lg:px-16 py-8 lg:pt-24 lg:pb-16">
        <h1 className="text-3xl font-bold text-center">Daftar sebagai Guru</h1>
        <p className="text-gray-500 mt-2 text-center max-w-[450px]">
          Gunakan kode guru dari sekolahmu. Setelah mendaftar, kamu bisa memilih kelas yang kamu ajar dan
          membagikan kode kelas ke siswa.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-8">
          <label htmlFor="nama" className="block text-sm mb-1">Nama Lengkap</label>
          <input
            id="nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={inputClass}
            placeholder="Nama lengkap beserta gelar"
            autoComplete="name"
          />

          <label htmlFor="email" className="block text-sm mb-1 mt-5">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="Alamat email aktif"
            autoComplete="email"
          />

          <label htmlFor="password" className="block text-sm mb-1 mt-5">Password</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center bg-transparent border-0 p-0 cursor-pointer"
            >
              <Image
                src={showPassword ? "/icons/open-eye.png" : "/icons/closed-eye.png"}
                alt=""
                width={20}
                height={20}
              />
            </button>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
            />
          </div>

          <label htmlFor="confirm-password" className="block text-sm mb-1 mt-5">Konfirmasi Password</label>
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Ulangi password"
            autoComplete="new-password"
          />

          <label htmlFor="kode-guru" className="block text-sm mb-1 mt-5">Kode Guru</label>
          <input
            id="kode-guru"
            type="text"
            value={kodeGuru}
            onChange={(e) => setKodeGuru(e.target.value)}
            className={inputClass}
            placeholder="Kode dari admin sekolah"
            autoComplete="off"
          />

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-8 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? "Mendaftarkan..." : "Daftar sebagai Guru"}
          </button>

          <p className="text-center mt-3 text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-brand-600 font-bold no-underline">
              Masuk
            </Link>
          </p>
          <p className="text-center mt-1 text-sm text-gray-500">
            Kamu siswa?{" "}
            <Link href="/join" className="text-brand-600 font-bold no-underline">
              Gabung dengan kode kelas
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 self-start justify-end overflow-hidden">
        <Image
          src="/images/kombinara-banner.png"
          alt="Kombinara"
          width={771}
          height={859}
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
}
