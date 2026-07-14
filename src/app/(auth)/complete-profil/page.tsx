"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatar = removeAvatar ? null : (avatarPreview ?? avatarUrl);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const name =
        user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
      if (name) setNamaLengkap(name);

      const picture =
        user?.user_metadata?.avatar_url ??
        user?.user_metadata?.picture ??
        null;
      setAvatarUrl(picture);
      setUserId(user?.id ?? null);
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) return;

    const nomorAbsenNum = parseInt(nomorAbsen.trim(), 10);
    if (!nomorAbsen.trim() || isNaN(nomorAbsenNum) || nomorAbsenNum <= 0) {
      setError("Nomor absen harus berupa angka lebih dari 0");
      return;
    }

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

      // 2. Resolve final avatar URL
      let finalAvatarUrl: string | null | undefined = undefined; // undefined = no change
      if (removeAvatar) {
        finalAvatarUrl = null;
      } else if (avatarFile && userId) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${userId}/avatar.${ext}`, avatarFile, { upsert: true });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(uploadData.path);
          finalAvatarUrl = urlData.publicUrl;
        }
        // if upload fails, silently keep existing avatar
      }

      // 3. Update user_metadata hanya setelah DB berhasil
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          role: "siswa",
          nama: namaLengkap.trim(),
          nomorAbsen: nomorAbsen.trim(),
          kelas: kelas.trim(),
          groupKelas: groupKelas.trim(),
          gender: gender,
          ...(finalAvatarUrl !== undefined && { avatar_url: finalAvatarUrl }),
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
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8 mt-4">
        <h1 className="text-3xl font-bold">Lengkapi Profil Kamu</h1>
        <p className="text-gray-500 mt-2 text-center">
          Satu langkah lagi sebelum mulai belajar.
        </p>

        {/* Profile picture row */}
        <div className="w-full max-w-[450px] flex items-center gap-4 mt-8">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt="Foto profil"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: "#346739" }}
            >
              Ubah Foto
            </button>
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="px-4 py-2 rounded-full bg-gray-200 text-red-500 text-sm font-medium"
            >
              Hapus Foto
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mt-1">
          <label className="block text-sm mb-1 mt-4">Nama Lengkap</label>
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
            className="w-full py-2.5 mt-6 rounded-full bg-brand-600 text-white font-bold border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Image
                  src="/icons/loading.png"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="animate-spin"
                />
                Menyimpan...
              </>
            ) : (
              "Mulai Belajar"
            )}
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

