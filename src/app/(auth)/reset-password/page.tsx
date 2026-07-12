"use client";

import Image from "next/image";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) { setError("Password baru wajib diisi."); return; }
    if (password.length < 8) { setError("Password minimal 8 karakter."); return; }
    if (password !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return; }

    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2500);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-gray-500 mt-2 text-center">
          Buat password baru untuk akunmu.
        </p>

        {success ? (
          <div className="w-full max-w-[450px] mt-8 px-4 py-3 rounded-2xl text-sm" style={{ backgroundColor: "#F3FFF1", borderColor: "#346739", border: "1px solid" }}>
            Password berhasil diubah! Mengalihkan ke halaman login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-8">
            <label className="block text-sm mb-1">Email</label>
            <div className="relative">
              <Image
                src="/icons/username-icon.png"
                alt="email icon"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="email"
                value={email}
                readOnly
                className="w-full py-2.5 pl-11 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none text-gray-400 cursor-not-allowed"
              />
            </div>

            <label className="block text-sm mb-1 mt-5">Password Baru</label>
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
                className="w-full py-2.5 pl-11 pr-10 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="Masukkan password baru"
                autoFocus
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

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-4 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
