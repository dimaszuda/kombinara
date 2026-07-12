"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProfileData {
  name: string;
  studentNumber: string;
  className: string;
  group: string;
  gender: string;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [_userId, setUserId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatar = removeAvatar
    ? null
    : avatarPreview ??
      (isEditing ? editData?.avatarUrl : profile?.avatarUrl) ??
      null;

  // Load profile from DB on mount
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name ?? "",
          studentNumber: data.studentNumber ?? "",
          className: data.className ?? "",
          group: data.group ?? "",
          gender: data.gender ?? "",
          avatarUrl: data.avatarUrl ?? null,
        });
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = () => {
    if (!profile) return;
    setEditData({ ...profile });
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);
    setError("");
    setSuccessMsg("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);
    setError("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  const updateField = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setEditData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!editData || !editData.name.trim()) return;

    setIsSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      // 1. Save profile to DB
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: editData.name.trim(),
          nomorAbsen: editData.studentNumber.trim(),
          kelas: editData.className.trim(),
          groupKelas: editData.group.trim(),
          gender: editData.gender,
        }),
      });

      if (!res.ok) {
        let msg = "Gagal menyimpan profil";
        try {
          const d = await res.json();
          msg = d.error ?? msg;
        } catch {}
        throw new Error(msg);
      }

      // 2. Handle avatar upload / removal
      let finalAvatarUrl: string | null | undefined = undefined;
      if (removeAvatar) {
        finalAvatarUrl = null;
        // Delete avatar from storage
        await fetch("/api/users/avatar", { method: "DELETE" });
      } else if (avatarFile) {
        // Upload via API endpoint
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch("/api/users/avatar", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          // Append cache-buster to avoid stale image
          finalAvatarUrl = `${uploadData.url}?t=${Date.now()}`;
        } else {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error ?? "Gagal upload gambar");
        }
      }

      // 3. Sync avatar to auth metadata
      await supabase.auth.updateUser({
        data: {
          ...(finalAvatarUrl !== undefined && { avatar_url: finalAvatarUrl }),
        },
      });

      // 4. Commit to local state — no redirect, no reload
      const saved: ProfileData = {
        ...editData,
        avatarUrl:
          finalAvatarUrl !== undefined ? finalAvatarUrl : editData.avatarUrl,
      };
      setProfile(saved);
      setIsEditing(false);
      setEditData(null);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
      setSuccessMsg("Profil berhasil disimpan!");
      // Re-run server components (layout) to refresh the top-right avatar
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const current = isEditing ? editData : profile;

  const readOnlyClass =
    "w-full py-2.5 pl-5 pr-4 rounded-full border border-gray-200 bg-gray-50 text-gray-700 cursor-default outline-none";
  const editableClass =
    "w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none";

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-8 mt-4">
        {/* Avatar row */}
        <div className="w-full max-w-[450px] flex items-center gap-4 mt-8">
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          {/* Photo buttons — only shown in edit mode */}
          {isEditing && (
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
          )}
        </div>

        {/* Profile fields */}
        <div className="w-full max-w-[450px] mt-1">
          <label className="block text-sm mb-1 mt-4">Nama Lengkap</label>
          <input
            type="text"
            value={current?.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            readOnly={!isEditing}
            className={isEditing ? editableClass : readOnlyClass}
            placeholder="Nama lengkap kamu"
          />

          <label className="block text-sm mt-4 mb-1">Nomor Absen</label>
          <input
            type="text"
            value={current?.studentNumber ?? ""}
            onChange={(e) => updateField("studentNumber", e.target.value)}
            readOnly={!isEditing}
            className={isEditing ? editableClass : readOnlyClass}
            placeholder="Nomor absen kamu"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-sm mb-1">Kelas</label>
              <input
                type="text"
                value={current?.className ?? ""}
                onChange={(e) => updateField("className", e.target.value)}
                readOnly={!isEditing}
                className={isEditing ? editableClass : readOnlyClass}
                placeholder="Contoh: XI"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Group Kelas</label>
              <input
                type="text"
                value={current?.group ?? ""}
                onChange={(e) => updateField("group", e.target.value)}
                readOnly={!isEditing}
                className={isEditing ? editableClass : readOnlyClass}
                placeholder="Contoh: MIPA 1"
              />
            </div>
          </div>

          <label className="block text-sm mt-4 mb-1">Jenis Kelamin</label>
          {isEditing ? (
            <select
              value={editData?.gender ?? ""}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full py-2.5 pl-5 pr-4 rounded-full border border-brand-600 bg-brand-50 outline-none appearance-none"
            >
              <option value="" disabled>
                Pilih jenis kelamin
              </option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          ) : (
            <input
              type="text"
              value={profile?.gender ?? ""}
              readOnly
              className={readOnlyClass}
            />
          )}

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}
          {successMsg && (
            <p className="text-green-600 text-sm mt-3 text-center">
              {successMsg}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={isEditing ? handleCancelEdit : handleEditClick}
              className="flex-1 py-2.5 rounded-full border border-brand-600 text-brand-600 font-bold bg-white"
            >
              {isEditing ? "Batal" : "Edit Profil"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isEditing || isSaving}
              className="flex-1 py-2.5 rounded-full bg-brand-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
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
                "Simpan Profil"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
