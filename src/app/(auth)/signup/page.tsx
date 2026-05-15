"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  return (
    <div className="flex w-full min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-start px-16 pt-24 pb-16">
        <h1 className="text-3xl font-bold">Daftar akun Kombinara</h1>

        <div className="w-full max-w-[450px] mt-8">
          <label className="block text-sm mb-1">Nama Lengkap</label>
          <input
            type="text"
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
            placeholder="Masukkan nama lengkap"
          />

          <label className="block text-sm mb-1 mt-5">Nomor Absen</label>
          <input
            type="text"
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
            placeholder="contoh: 1, 2, dst"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1 mt-5">Kelas</label>
              <input
                type="text"
                className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="contoh: XI"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 mt-5">Grup Kelas</label>
              <input
                type="text"
                className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="contoh: A"
              />
            </div>
          </div>

          <label className="block text-sm mb-1 mt-5">Email</label>
          <input
            type="email"
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
              className="w-full py-2.5 pl-5 pr-10 rounded-full border border-brand-600 bg-brand-50 outline-none"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-6 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer"
          >
            Daftar
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
        </div>
      </div>

      <div className="w-1/2 self-start flex justify-end overflow-hidden">
        <Image
          src="/images/kombinara-banner.png"
          alt="Kombinara"
          width={771}
          height={859}
        />
      </div>
    </div>
  );
}
