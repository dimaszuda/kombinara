"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinPage() {
  const router = useRouter();
  const [modulKey, setModulKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!modulKey.trim()) {
      setError("Kode Modul Kosong! Silahkan isi terlebih dahulu");
      return;
    }
    if (modulKey === "691831") {
      router.push(`/signup?key=${encodeURIComponent(modulKey.trim())}`);
    } else {
      setError("Kode Modul Salah!");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8">
        <h1 className="text-3xl font-bold">Masukkan Kode Modul</h1>
        <p className="text-gray-500 mt-2 text-center">
          Minta kode modul kepada guru kamu untuk mulai bergabung.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-8">
          <label className="block text-sm mb-1">Kode Modul</label>
          <div className="relative">
            <Image
              src="/icons/password-icon.png"
              alt="key icon"
              width={20}
              height={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={modulKey}
              onChange={(e) => setModulKey(e.target.value)}
              className="w-full py-2.5 pl-11 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
              placeholder="Masukkan kode modul"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 mt-4 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer"
          >
            Gabung
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
