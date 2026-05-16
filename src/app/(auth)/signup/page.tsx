"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [namaLengkap, setNamaLengkap] = useState("");
  const [nomorAbsen, setNomorAbsen] = useState("");
  const [kelas, setKelas] = useState("");
  const [groupKelas, setGroupKelas] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!namaLengkap.trim()) { setError("Nama lengkap wajib diisi"); return; }
    if (!nomorAbsen.trim()) { setError("Nomor absen wajib diisi"); return; }
    if (!kelas.trim()) { setError("Kelas wajib diisi"); return; }
    if (!groupKelas.trim()) { setError("Grup kelas wajib diisi"); return; }
    if (!gender) { setError("Jenis kelamin wajib dipilih"); return; }
    if (!email.trim()) { setError("Email wajib diisi"); return; }
    if (!password) { setError("Password wajib diisi"); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }
    if (password !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return; }

    setIsLoading(true);

    try {
      // 1. Buat akun via server API (email langsung terkonfirmasi, profil tersimpan)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          nama: namaLengkap.trim(),
          nomorAbsen: nomorAbsen.trim(),
          kelas: kelas.trim(),
          groupKelas: groupKelas.trim(),
          gender,
        }),
      });

      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.error ?? "Gagal membuat akun");
      }

      router.push("/login?signup=success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-start px-4 md:px-8 lg:px-16 py-8 lg:pt-24 lg:pb-16">
        <h1 className="text-3xl font-bold">Daftar akun Kombinara</h1>

        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-8">
          <label className="block text-sm mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
            placeholder="Masukkan nama lengkap"
          />

          <label className="block text-sm mb-1 mt-5">Nomor Absen</label>
          <input
            type="text"
            value={nomorAbsen}
            onChange={(e) => setNomorAbsen(e.target.value)}
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
            placeholder="contoh: 1, 2, dst"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1 mt-5">Kelas</label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="contoh: XI"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 mt-5">Grup Kelas</label>
              <input
                type="text"
                value={groupKelas}
                onChange={(e) => setGroupKelas(e.target.value)}
                className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="contoh: A"
              />
            </div>
          </div>

          <label className="block text-sm mt-5 mb-1">Jenis Kelamin</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none appearance-none"
          >
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <label className="block text-sm mb-1 mt-5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
            placeholder="Alamat email aktif"
          />

          <label className="block text-sm mb-1 mt-5">Password</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center bg-transparent border-0 p-0 cursor-pointer"
            >
              <Image
                src={showPassword ? "/icons/open-eye.png" : "/icons/closed-eye.png"}
                alt="toggle password visibility"
                width={20}
                height={20}
              />
            </button>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 pl-5 pr-10 rounded-full border border-brand-600 bg-brand-50 outline-none"
              placeholder="Masukkan password"
            />
          </div>

          <label className="block text-sm mb-1 mt-5">Konfirmasi Password</label>
          <div className="relative">
            <Image
              src="/icons/password-icon.png"
              alt="password icon"
              width={20}
              height={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center bg-transparent border-0 p-0 cursor-pointer"
            >
              <Image
                src={showConfirm ? "/icons/open-eye.png" : "/icons/closed-eye.png"}
                alt="toggle confirm visibility"
                width={20}
                height={20}
              />
            </button>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2.5 pl-11 pr-10 rounded-full border border-brand-600 bg-brand-50 outline-none"
              placeholder="Ulangi password baru"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-4 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60 mt-8"
          >
            {isLoading ? "Mendaftarkan..." : "Daftar"}
          </button>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-400 whitespace-nowrap">atau daftar dengan</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 mt-6 rounded-full border border-brand-600 bg-white text-black font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Image src="/icons/google.png" alt="google icon" width={20} height={20} />
            {isGoogleLoading ? "Menghubungkan..." : "Google"}
          </button>

          <p className="text-center mt-2 text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-brand-600 font-bold no-underline">
              Masuk Sekarang
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
