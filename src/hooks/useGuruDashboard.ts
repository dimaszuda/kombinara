/**
 * useGuruDashboard — fetch data ringkasan dashboard guru dari API.
 *
 * Digunakan di halaman /guru/dashboard untuk menggantikan dummy data
 * pada widget: Total Kelas, Total Siswa, Distribusi Kelas, Daftar Siswa,
 * serta chart Asesmen Diagnostik.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// Types (mirror dari lib/data/guru-dashboard.ts)
// ═══════════════════════════════════════════════════════════════

export interface DistribusiKelasItem {
  classId: number;
  namaKelas: string;
  totalSiswa: number;
}

export interface DaftarSiswaItem {
  name: string;
  kelas: string;
  tanggalJoin: string;
}

export interface KelasOption {
  classId: number;
  namaKelas: string;
}

export interface GenderBreakdown {
  gender: string;
  total: number;
}

export interface StudentProgressItem {
  studentId: number;
  name: string;
  kelas: string;
  completed: number;
  total: number;
  pct: number;
}

// ═══════════════════════════════════════════════════════════════
// Diagnostic Analytics Types
// ═══════════════════════════════════════════════════════════════

export interface ScoreDistributionItem {
  totalScore: number;
  jumlahSiswa: number;
}

export interface DurationScatterItem {
  nama: string;
  kelas: string;
  nilai: number;
  durasiMenit: number;
  passed: boolean;
}

export interface AttemptDistributionItem {
  attemptNumber: number;
  total: number;
}

export interface DiagnosticDetailItem {
  studentId: number;
  nama: string;
  kelas: string;
  nilai: number;
  attemptNumber: number;
  durasiMenit: number;
  status: string;
  submittedAt: string;
}

export interface DiagnosticAnalyticsData {
  scoreDistribution: ScoreDistributionItem[];
  durationScatter: DurationScatterItem[];
  attemptDistribution: AttemptDistributionItem[];
  detailPerSiswa: DiagnosticDetailItem[];
}

// ═══════════════════════════════════════════════════════════════
// Journey Analytics Types
// ═══════════════════════════════════════════════════════════════

export interface PendahuluanJourneyItem {
  studentId: number;
  nama: string;
  apersepsi: string;
  pemantik: string;
  refleksi: string;
}

export interface MateriJourneyItem {
  studentId: number;
  nama: string;
  conceptId: string;
  aktivitasDeepLearning: string;
  aktivitasSiswa: string;
  contohSoal: string;
  eksplorasiKontekstual: string;
  penjelasanKonsep: string;
  refleksiMini: string;
}

export interface JourneyAnalyticsData {
  pendahuluan: PendahuluanJourneyItem[];
  materi: MateriJourneyItem[];
}

// ═══════════════════════════════════════════════════════════════
// Formatif Analytics Types
// ═══════════════════════════════════════════════════════════════

export interface FormatifScoreDistributionItem {
  scoreRange: string;
  jumlah: number;
}

export interface FormatifStats {
  mean: number;
  median: number;
  std: number;
  n: number;
}

export interface FormatifDurationScatterItem {
  nama: string;
  kelas: string;
  nilai: number;
  durasiMenit: number;
}

export interface FormatifAttemptDistributionItem {
  attempt: string;
  total: number;
}

export interface FormatifDetailItem {
  studentId: number;
  nama: string;
  kelas: string;
  conceptId: string;
  nilai: number;
  totalAttempts: number;
  durasiMenit: number;
  status: string;
}

export interface FormatifAnalyticsData {
  scoreDistribution: FormatifScoreDistributionItem[];
  stats: FormatifStats;
  durationScatter: FormatifDurationScatterItem[];
  attemptDistribution: FormatifAttemptDistributionItem[];
  detailPerSiswa: FormatifDetailItem[];
}

// ═══════════════════════════════════════════════════════════════
// Integrity Analytics Types
// ═══════════════════════════════════════════════════════════════

export interface IntegrityEventItem {
  nama: string;
  kelas: string;
  materi: string;
  jenisKejadian: string;
  jumlah: number;
}

// ═══════════════════════════════════════════════════════════════
// Main Dashboard Data
// ═══════════════════════════════════════════════════════════════

export interface GuruDashboardData {
  totalKelas: number;
  totalSiswa: number;
  genderBreakdown: GenderBreakdown[];
  kelasOptions: KelasOption[];
  distribusiKelas: DistribusiKelasItem[];
  daftarSiswa: DaftarSiswaItem[];
  studentProgress: StudentProgressItem[];
  /** Data chart asesmen diagnostik (null jika belum dimuat atau tidak diminta) */
  diagnostic: DiagnosticAnalyticsData | null;
  /** Data journey siswa (null jika belum dimuat atau tidak diminta) */
  journey: JourneyAnalyticsData | null;
  /** Data chart asesmen formatif (null jika belum dimuat atau tidak diminta) */
  formatif: FormatifAnalyticsData | null;
  /** Data integritas pengerjaan (null jika belum dimuat atau tidak diminta) */
  integrity: IntegrityEventItem[] | null;
}

interface UseGuruDashboardOptions {
  classIds?: number[];
  /** concept_id slugs untuk filter materi (overview & journey) */
  materis?: string[];
  /** concept_id slugs untuk filter asesmen formatif & integrity */
  asesmenMateris?: string[];
  searchName?: string;
  /** Percobaan asesmen diagnostik: "latest" (default) atau nomor attempt */
  diagAttempt?: number | "latest";
  /** Percobaan asesmen formatif: "latest" (default) atau nomor attempt */
  formAttempt?: number | "latest";
  /** Apakah perlu fetch data chart diagnostik */
  includeDiagnostic?: boolean;
  /** Apakah perlu fetch data journey siswa */
  includeJourney?: boolean;
  /** Apakah perlu fetch data chart formatif */
  includeFormatif?: boolean;
  /** Apakah perlu fetch data integritas */
  includeIntegrity?: boolean;
}

interface UseGuruDashboardReturn {
  data: GuruDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useGuruDashboard(
  options?: UseGuruDashboardOptions
): UseGuruDashboardReturn {
  const { classIds, materis, asesmenMateris, searchName, diagAttempt, formAttempt, includeDiagnostic, includeJourney, includeFormatif, includeIntegrity } = options ?? {};
  const [data, setData] = useState<GuruDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (classIds && classIds.length > 0) {
        params.set("classIds", classIds.join(","));
      }
      if (materis && materis.length > 0) {
        params.set("materi", materis.join(","));
      }
      if (asesmenMateris && asesmenMateris.length > 0) {
        params.set("formatifMateri", asesmenMateris.join(","));
      }
      if (searchName) {
        params.set("searchName", searchName);
      }
      if (includeDiagnostic) {
        params.set("includeDiagnostic", "true");
      }
      if (includeJourney) {
        params.set("includeJourney", "true");
      }
      if (includeFormatif) {
        params.set("includeFormatif", "true");
      }
      if (includeIntegrity) {
        params.set("includeIntegrity", "true");
      }
      if (diagAttempt) {
        params.set("diagAttempt", String(diagAttempt));
      }
      if (formAttempt) {
        params.set("formAttempt", String(formAttempt));
      }

      const url = `/api/guru/dashboard?${params.toString()}`;
      console.log("[useGuruDashboard] 🔄 Fetching:", url, { classIds, materis, asesmenMateris, diagAttempt });

      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const errMsg = body?.error ?? `Gagal memuat dashboard (HTTP ${res.status})`;
        console.error("[useGuruDashboard] ❌ API error:", res.status, errMsg);
        throw new Error(errMsg);
      }

      const json: GuruDashboardData = await res.json();
      console.log("[useGuruDashboard] ✅ Data diterima:", {
        totalKelas: json.totalKelas,
        totalSiswa: json.totalSiswa,
        distribusiKelas: json.distribusiKelas?.length,
        daftarSiswa: json.daftarSiswa?.length,
        studentProgress: json.studentProgress?.length,
        hasDiagnostic: json.diagnostic !== null,
        hasJourney: json.journey !== null,
        hasFormatif: json.formatif !== null,
      });
      setData(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data";
      console.error("[useGuruDashboard] ❌ Fetch gagal:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [classIds, materis, asesmenMateris, searchName, diagAttempt, formAttempt, includeDiagnostic, includeJourney, includeFormatif, includeIntegrity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
