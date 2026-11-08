"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinPage() {
  const router = useRouter();
  const [kodeKelas, setKodeKelas] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = kodeKelas.trim();
    if (!code) {
      setError("Kode kelas masih kosong. Silakan isi terlebih dahulu.");
      return;
    }

    // Kode dicek di server — tidak ada kode yang disimpan di browser.
    setIsChecking(true);
    try {
      const res = await fetch("/api/auth/class-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Kode kelas tidak ditemukan.");
        setIsChecking(false);
        return;
      }
      router.push(`/signup?code=${encodeURIComponent(code)}`);
    } catch {
      setError("Gagal memeriksa kode. Periksa koneksi lalu coba lagi.");
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8">
        <h1 className="text-3xl font-bold">Masukkan Kode Kelas</h1>
        <p className="text-muted mt-2 text-center">
          Minta kode kelas kepada guru kamu untuk mulai bergabung.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-8">
          <label htmlFor="kode-kelas" className="block text-sm mb-1">Kode Kelas</label>
          <div className="relative">
            <Image
              src="/icons/password-icon.png"
              alt=""
              width={20}
              height={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="kode-kelas"
              type="text"
              value={kodeKelas}
              onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
              className="w-full py-2.5 pl-11 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none focus:ring-2 focus:ring-[#663362] uppercase tracking-widest"
              placeholder="Contoh: K7M2QX9A"
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && <p role="alert" className="text-[#B91C1C] text-sm mt-2">{error}</p>}

          <button
            type="submit"
            disabled={isChecking}
            className="w-full py-2.5 mt-4 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60"
          >
            {isChecking ? "Memeriksa..." : "Gabung"}
          </button>

          <p className="text-center mt-2 text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-brand-600 font-bold no-underline">
              Masuk
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 justify-end items-center">
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
