"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function CompleteProfilPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [nomorAbsen, setNomorAbsen] = useState("");
  const [kelas, setKelas] = useState("");
  const [groupKelas, setGroupKelas] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const name =
        user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
      if (name) setNamaLengkap(name);
    };

    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // 1. Insert ke public.users + students via API dulu
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: namaLengkap.trim(),
          nomorAbsen: nomorAbsen.trim(),
          kelas: kelas.trim(),
          groupKelas: groupKelas.trim(),
          gender: gender,
        }),
      });
      if (!res.ok) {
        let errorMsg = "Gagal menyimpan profil";
        try {
          const data = await res.json();
          errorMsg = data.error ?? errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      // 2. Update user_metadata hanya setelah DB berhasil
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          role: "siswa",
          nama: namaLengkap.trim(),
          nomorAbsen: nomorAbsen.trim(),
          kelas: kelas.trim(),
          groupKelas: groupKelas.trim(),
          gender: gender,
        },
      });
      if (authError) throw authError;

      router.push("/siswa");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8">
        <h1 className="text-3xl font-bold">Lengkapi Profil Kamu</h1>
        <p className="text-gray-500 mt-2 text-center">
          Satu langkah lagi sebelum mulai belajar.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-8">
          <label className="block text-sm mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
            placeholder="Nama lengkap kamu"
            required
          />

          <label className="block text-sm mt-4 mb-1">Nomor Absen</label>
          <input
            type="text"
            value={nomorAbsen}
            onChange={(e) => setNomorAbsen(e.target.value)}
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
            placeholder="Nomor absen kamu"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-sm mb-1">Kelas</label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="Contoh: XI"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Group Kelas</label>
              <input
                type="text"
                value={groupKelas}
                onChange={(e) => setGroupKelas(e.target.value)}
                className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none"
                placeholder="Contoh: MIPA 1"
              />
            </div>
          </div>

          <label className="block text-sm mt-4 mb-1">Jenis Kelamin</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none appearance-none"
          >
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-6 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? "Menyimpan..." : "Mulai Belajar"}
          </button>
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

