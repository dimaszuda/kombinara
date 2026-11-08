"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types (mirror dari src/lib/data/classes.ts → TeacherClassOverview) ─────────
interface TeacherClassItem {
  classId: number;
  label: string;
  academicYear: string;
  studentCount: number;
  joinCode: string | null;
}

interface TeacherClassOverview {
  schoolName: string;
  currentAcademicYear: string;
  classes: TeacherClassItem[];
  available: TeacherClassItem[];
}

const CLASS_LEVELS = ["X", "XI", "XII"] as const;
const CLASS_GROUPS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A–Z

const primaryButton =
  "rounded-full bg-[#346739] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2";
const selectClass =
  "rounded-full border border-[#346739] bg-[#F3FFF1] px-4 py-2.5 text-sm text-[#2C2C2A] outline-none focus-visible:ring-2 focus-visible:ring-[#663362]";

export default function KelasSayaPage() {
  const [data, setData] = useState<TeacherClassOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [claimClassId, setClaimClassId] = useState("");
  const [newLevel, setNewLevel] = useState<string>("");
  const [newGroup, setNewGroup] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/guru/kelas");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal memuat kelas");
      setData(json as TeacherClassOverview);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat kelas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = async (request: () => Promise<Response>) => {
    setBusy(true);
    setError("");
    try {
      const res = await request();
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Terjadi kesalahan");
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleClaim = async () => {
    if (!claimClassId) return;
    const ok = await mutate(() =>
      fetch("/api/guru/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: Number(claimClassId) }),
      })
    );
    if (ok) setClaimClassId("");
  };

  const handleCreate = async () => {
    if (!newLevel || !newGroup) return;
    const ok = await mutate(() =>
      fetch("/api/guru/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: newLevel, group: newGroup }),
      })
    );
    if (ok) {
      setNewLevel("");
      setNewGroup("");
    }
  };

  const handleUnlink = async (cls: TeacherClassItem) => {
    const confirmed = window.confirm(
      `Lepas kelas ${cls.label} dari daftarmu?\n\nData kelas dan siswa tidak dihapus, tetapi kelas ini tidak lagi muncul di Learning Dashboard-mu.`
    );
    if (!confirmed) return;
    await mutate(() => fetch(`/api/guru/kelas?classId=${cls.classId}`, { method: "DELETE" }));
  };

  const handleCopy = async (cls: TeacherClassItem) => {
    if (!cls.joinCode) return;
    try {
      await navigator.clipboard.writeText(cls.joinCode);
      setCopiedId(cls.classId);
      setTimeout(() => setCopiedId((id) => (id === cls.classId ? null : id)), 2000);
    } catch {
      setError("Gagal menyalin. Salin kode secara manual.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#346739] sm:text-3xl" style={{ fontSize: "var(--dashboard-heading-size)" }}>
          Kelas Saya
        </h1>
        {data && (
          <p className="mt-1 text-sm text-[#6B6B66]">
            {data.schoolName} · Tahun ajaran berjalan {data.currentAcademicYear}
          </p>
        )}
        <p className="mt-4 max-w-3xl rounded-2xl bg-[#DBFFD5] px-5 py-3 text-sm leading-relaxed text-[#1A3D1C]">
          Bagikan <b>kode kelas</b> ke siswa. Siswa memasukkannya di halaman <b>Gabung dengan Kode Kelas</b> saat
          mendaftar. Learning Dashboard hanya menampilkan siswa dari kelas yang ada di daftar ini.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl border border-[#C24949] bg-[#FFF5F5] px-5 py-3 text-sm text-[#B91C1C]">
          {error}
        </p>
      )}

      {/* Daftar kelas saya */}
      <section aria-labelledby="kelas-saya-heading">
        <h2 id="kelas-saya-heading" className="text-lg font-bold text-[#2C2C2A]">
          Kelas yang kamu ajar
        </h2>

        {loading ? (
          <p className="mt-4 text-sm text-[#6B6B66]">Memuat kelas...</p>
        ) : !data || data.classes.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[#C5C5C0] px-5 py-6 text-center text-sm text-[#6B6B66]">
            Kamu belum punya kelas. Tambahkan kelas di bawah.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.classes.map((cls) => (
              <article key={cls.classId} className="flex flex-col rounded-[28px] bg-[#DBFFD5] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#346739]">Kelas {cls.label}</h3>
                    <p className="text-xs text-[#6B6B66]">
                      {cls.academicYear} · {cls.studentCount} siswa
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnlink(cls)}
                    disabled={busy}
                    className="rounded-full px-3 py-1 text-xs font-medium text-[#C24949] transition-colors hover:bg-[#C24949]/10 disabled:opacity-50"
                  >
                    Lepas
                  </button>
                </div>

                <p className="mt-4 text-xs font-medium text-[#663362]">Kode kelas</p>
                <div className="mt-1 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                  <span className="font-mono text-lg font-bold tracking-widest text-[#2C2C2A]">
                    {cls.joinCode ?? "Belum ada"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(cls)}
                    disabled={!cls.joinCode}
                    className="rounded-full border border-[#346739] px-3 py-1 text-xs font-medium text-[#346739] transition-colors hover:bg-[#F3FFF1] disabled:opacity-50"
                  >
                    {copiedId === cls.classId ? "Tersalin!" : "Salin"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Tambah kelas */}
      <section aria-labelledby="tambah-kelas-heading" className="grid gap-6 lg:grid-cols-2">
        <h2 id="tambah-kelas-heading" className="sr-only">
          Tambah kelas
        </h2>

        <div className="rounded-2xl border border-[#34673926] bg-white p-5">
          <h3 className="text-base font-bold text-[#2C2C2A]">Pilih kelas yang sudah ada</h3>
          <p className="mt-1 text-sm text-[#6B6B66]">Kelas di sekolahmu yang sudah dibuat guru lain atau dari tahun lalu.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              aria-label="Pilih kelas"
              value={claimClassId}
              onChange={(e) => setClaimClassId(e.target.value)}
              disabled={!data || data.available.length === 0}
              className={`${selectClass} flex-1`}
            >
              <option value="">
                {data && data.available.length === 0 ? "Tidak ada kelas lain" : "Pilih kelas"}
              </option>
              {data?.available.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.label} · {cls.academicYear} · {cls.studentCount} siswa
                </option>
              ))}
            </select>
            <button type="button" onClick={handleClaim} disabled={busy || !claimClassId} className={primaryButton}>
              Tambahkan
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#34673926] bg-white p-5">
          <h3 className="text-base font-bold text-[#2C2C2A]">Buat kelas baru</h3>
          <p className="mt-1 text-sm text-[#6B6B66]">
            Untuk tahun ajaran {data?.currentAcademicYear ?? "berjalan"}. Kode kelas dibuat otomatis.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select aria-label="Tingkat" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className={selectClass}>
              <option value="">Tingkat</option>
              {CLASS_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <select aria-label="Grup" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} className={selectClass}>
              <option value="">Grup</option>
              {CLASS_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleCreate} disabled={busy || !newLevel || !newGroup} className={primaryButton}>
              Buat Kelas
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
