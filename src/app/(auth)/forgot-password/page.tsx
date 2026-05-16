"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setIsLoading(false);
    if (resetError) {
      const msg = resetError.message.toLowerCase();
      if (msg.includes("rate limit")) {
        setError("Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.");
      } else if (msg.includes("invalid email") || msg.includes("unable to validate")) {
        setError("Format email tidak valid.");
      } else {
        setError("Gagal mengirim email. Coba lagi nanti.");
      }
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8">
        <h1 className="text-3xl font-bold">Lupa Password?</h1>

        {sent ? (
          <div className="w-full max-w-[450px] mt-8 px-4 py-3 rounded-2xl text-sm" style={{ backgroundColor: "#F3FFF1", borderColor: "#346739", border: "1px solid" }}>
            Link reset password sudah dikirim ke <strong>{email}</strong>. Cek inbox atau folder spam kamu.
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-11 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="Masukkan email kamu"
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-4 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? "Mengirim..." : "Kirim Link Reset"}
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
