"use client";

import { useCallback, useState } from "react";

/** Identitas kelas hasil cek kode (dari POST /api/auth/class-code). */
export interface ClassCodeInfo {
  code: string;
  className: string;
  group: string;
  label: string;
  schoolName: string;
  academicYear: string;
}

type LookupStatus = "idle" | "checking" | "valid" | "invalid";

/**
 * Cek kode kelas ke server dan simpan hasilnya.
 * Dipakai di /signup, /complete-profil, dan halaman profil (pindah kelas).
 */
export function useClassCodeLookup() {
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [info, setInfo] = useState<ClassCodeInfo | null>(null);
  const [error, setError] = useState("");

  const check = useCallback(async (rawCode: string): Promise<ClassCodeInfo | null> => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      setStatus("idle");
      setInfo(null);
      setError("");
      return null;
    }

    setStatus("checking");
    setError("");
    try {
      const res = await fetch("/api/auth/class-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("invalid");
        setInfo(null);
        setError(data.error ?? "Kode kelas tidak ditemukan.");
        return null;
      }
      const found: ClassCodeInfo = {
        code,
        className: data.className,
        group: data.group,
        label: data.label,
        schoolName: data.schoolName,
        academicYear: data.academicYear,
      };
      setStatus("valid");
      setInfo(found);
      return found;
    } catch {
      setStatus("invalid");
      setInfo(null);
      setError("Gagal memeriksa kode. Periksa koneksi lalu coba lagi.");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setInfo(null);
    setError("");
  }, []);

  return { status, info, error, check, reset };
}

// ─── Kode kelas yang dibawa melewati redirect login Google ─────────────────────
// /signup menyimpan kode sebelum redirect OAuth; /complete-profil membacanya.

const PENDING_CLASS_CODE_KEY = "kombinara:pending-class-code";

export function savePendingClassCode(code: string): void {
  try {
    sessionStorage.setItem(PENDING_CLASS_CODE_KEY, code);
  } catch {
    // sessionStorage tidak tersedia (mode privat ketat) — siswa cukup ketik ulang kodenya
  }
}

export function takePendingClassCode(): string | null {
  try {
    const code = sessionStorage.getItem(PENDING_CLASS_CODE_KEY);
    sessionStorage.removeItem(PENDING_CLASS_CODE_KEY);
    return code;
  } catch {
    return null;
  }
}
