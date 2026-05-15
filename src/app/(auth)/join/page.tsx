"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinPage() {
  const router = useRouter();
  const [modulKey, setModulKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modulKey.trim()) return;
    router.push(`/signup?key=${encodeURIComponent(modulKey.trim())}`);
  };

  return (
    <div className="flex w-full min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-16">
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

          <button
            type="submit"
            className="w-full py-2.5 mt-6 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer"
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

      <div className="w-1/2 flex justify-end">
        <Image
          src="/images/kombinara-banner.png"
          alt="Kombinara"
          width={771}
          height={859}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
