"use client";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "success";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

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

    if (!email.trim()) { setError("Email wajib diisi"); return; }
    if (!password) { setError("Password wajib diisi"); return; }

    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        // Arahkan user Google ke tombol Google jika credentials tidak cocok
        const msg = authError.message.toLowerCase();
        if (authError.code === "invalid_credentials" || msg.includes("invalid")) {
          setError("Email atau password salah. Jika kamu mendaftar via Google, gunakan tombol Google di bawah.");
        } else if (msg.includes("rate limit") || msg.includes("too many")) {
          setError("Server sedang sibuk. Tunggu 1-2 menit lalu coba lagi.");
        } else {
          setError("Terjadi kesalahan saat login. Coba lagi.");
        }
        setIsLoading(false);
        return;
      }

      const role = data.user?.user_metadata?.role as string | undefined;
      router.push(role === "guru" ? "/guru" : "/siswa");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8">
        <h1 className="text-3xl font-bold">Selamat datang di Kombinara</h1>

        {signupSuccess && (
          <div className="w-full max-w-[450px] mt-8 px-4 py-3 rounded-2xl text-sm" style={{ backgroundColor: "#F3FFF1", borderColor: "#346739", border: "1px solid" }}>
            Akun berhasil dibuat! Silakan login dengan email dan password kamu.
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-4">
          <label className="block text-sm mb-1">Email</label>
          <div className="relative">
            <Image
              src="/icons/username-icon.png"
              alt="username icon"
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
            />
          </div>

          <label className="block text-sm mb-1 mt-5">Password</label>
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
              placeholder="Masukkan password"
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-bold text-brand-600 bg-transparent border-0 p-0 cursor-pointer"
            >
              Lupa Password?
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-4 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? "Masuk..." : "Masuk"}
          </button>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-400 whitespace-nowrap">atau masuk dengan</span>
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
            Belum punya akun?{" "}
            <Link href="/join" className="text-brand-600 font-bold no-underline">
              Daftar Sekarang
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
