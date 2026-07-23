"use client"

import React, { useState, useMemo, useEffect, ReactNode } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell, Legend
} from "recharts";
import { useGuruDashboard, type KelasOption, type GenderBreakdown, type ScoreDistributionItem, type DurationScatterItem, type AttemptDistributionItem, type DiagnosticDetailItem } from "@/hooks/useGuruDashboard";
import SortableTable, { type Column } from "@/components/dashboard/SortableTable";

type SectionKey = "apersepsi" | "eksplorasi" | "deepLearning" | "contohSoal" | "refleksi" | "aktivitas";

interface Student {
  id: number;
  nama: string;
  kelas: string;
  materi: string;
  tanggalJoin: string;
  diagNilai: number;
  diagPassed: boolean;
  diagDurasi: number;
  diagAttempt: number;
  formNilai: number;
  formPassed: boolean;
  formDurasi: number;
  formAttempt: number;
  sections: Record<SectionKey, boolean>;
  progressPct: number;
  integrityEvents: number;
}

interface Filters {
  kelas: string;   // "all" atau classId sebagai string (dari kelasOptions)
  materi: string;
}

type ModalType = "diag" | "form";

interface ModalState {
  item: DiagnosticDetailItem;
  type: ModalType;
}

interface DiagSoal {
  soal: string;
  jawaban: string;
}

interface FormSoal {
  soal: string;
  jawabanAkhir: string;
  cara: string;
  feedback: string;
}

const COLORS = {
  green: "#346739",
  brick: "#663733",
  purple: "#663362",
  greenLight: "#B8E6BC",
  brickLight: "#E6BBB8",
  white: "#ffffff",
} as const;

const KELAS_LIST: string[] = ["X-1", "X-2", "X-3", "XI-1", "XI-2", "XI-3", "XI-4"];
const MATERI_LIST: string[] = ["Pendahuluan", "Kaidah Penjumlahan", "Kaidah Perkalian", "Faktorial", "Permutasi", "Kombinasi"];

/** Mapping display name → concept_id slug untuk filter API */
const MATERI_SLUG_MAP: Record<string, string> = {
  Pendahuluan: "pendahuluan",
  "Kaidah Penjumlahan": "kaidah-penjumlahan",
  "Kaidah Perkalian": "kaidah-perkalian",
  Faktorial: "faktorial",
  Permutasi: "permutasi",
  Kombinasi: "kombinasi",
};
const SECTION_KEYS: { key: SectionKey; label: string }[] = [
  { key: "apersepsi", label: "Apersepsi" },
  { key: "eksplorasi", label: "Eksplorasi" },
  { key: "deepLearning", label: "Deep learning" },
  { key: "contohSoal", label: "Contoh soal" },
  { key: "refleksi", label: "Refleksi mini" },
  { key: "aktivitas", label: "Aktivitas siswa" },
];

// ═══════════════════════════════════════════════════════════════
// Column definitions for SortableTable (module-level, no state)
// ═══════════════════════════════════════════════════════════════

const DAFTAR_SISWA_COLS: Column<Record<string, unknown>>[] = [
  { key: "name", label: "Nama" },
  { key: "kelas", label: "Kelas" },
  { key: "tanggalJoin", label: "Tanggal join" },
];

const JOURNEY_PENDAHULUAN_COLS: Column<Record<string, unknown>>[] = [
  { key: "nama", label: "Nama" },
  {
    key: "apersepsi",
    label: "Apersepsi",
    align: "center",
    sortable: false,
    render: (row) => (
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: row.apersepsi === "Completed" ? COLORS.green : "#E0E0E0",
        }}
      />
    ),
  },
  {
    key: "pemantik",
    label: "Pemantik",
    align: "center",
    sortable: false,
    render: (row) => (
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: row.pemantik === "Completed" ? COLORS.green : "#E0E0E0",
        }}
      />
    ),
  },
  {
    key: "refleksi",
    label: "Refleksi",
    align: "center",
    sortable: false,
    render: (row) => (
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: row.refleksi === "Completed" ? COLORS.green : "#E0E0E0",
        }}
      />
    ),
  },
];

const JOURNEY_MATERI_COLS: Column<Record<string, unknown>>[] = [
  { key: "nama", label: "Nama" },
  {
    key: "conceptId",
    label: "Konsep",
    render: (row) => {
      const conceptLabel = Object.entries(MATERI_SLUG_MAP).find(([, slug]) => slug === row.conceptId)?.[0] ?? String(row.conceptId);
      return <>{conceptLabel}</>;
    },
  },
  ...(["diagnostic", "materi", "aktivitasSiswa", "latihan", "evaluasi", "refleksi"] as const).map(
    (key): Column<Record<string, unknown>> => ({
      key,
      label: key === "aktivitasSiswa" ? "Aktivitas" : key.charAt(0).toUpperCase() + key.slice(1),
      align: "center",
      sortable: false,
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: row[key] === "completed" ? COLORS.green : "#E0E0E0",
          }}
        />
      ),
    })
  ),
];

const INTEGRITY_COLS: Column<Record<string, unknown>>[] = [
  { key: "nama", label: "Nama" },
  { key: "kelas", label: "Kelas" },
  { key: "materi", label: "Materi" },
  {
    key: "integrityEvents",
    label: "Jumlah kejadian",
    render: (row) => (
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: COLORS.brick,
          background: COLORS.brickLight,
          padding: "2px 8px",
          borderRadius: 4,
        }}
      >
        {String(row.integrityEvents)}x
      </span>
    ),
  },
  { key: "_action", label: "", sortable: false, render: () => <span style={{ color: "#8A8A8A", fontSize: 11.5 }}>Tab switch / keluar fullscreen</span> },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seededRandom(42);

function genStudents(): Student[] {
  const firstNames = ["Ahmad", "Siti", "Budi", "Dewi", "Rizky", "Putri", "Fajar", "Nadia", "Yusuf", "Intan", "Fikri", "Salma", "Dimas", "Aulia", "Reza", "Wulan", "Hafiz", "Citra", "Bayu", "Kirana"];
  const lastNames = ["Pratama", "Wijaya", "Santoso", "Kusuma", "Ramadhan", "Lestari", "Nugroho", "Putra", "Anggraini", "Setiawan"];
  const students: Student[] = [];
  let id = 1;
  KELAS_LIST.forEach((kelas) => {
    const count = 30 + Math.floor(rand() * 7);
    for (let i = 0; i < count; i++) {
      const fn = firstNames[Math.floor(rand() * firstNames.length)];
      const ln = lastNames[Math.floor(rand() * lastNames.length)];
      const diagNilai = Math.round(40 + rand() * 60);
      const diagDurasi = Math.round(8 + rand() * 35);
      const diagAttempt = diagNilai >= 70 ? 1 + Math.floor(rand() * 2) : 1 + Math.floor(rand() * 3);
      const formNilai = Math.round(35 + rand() * 65);
      const formDurasi = Math.round(10 + rand() * 40);
      const formAttempt = 1 + Math.floor(rand() * 3);
      const sections = {} as Record<SectionKey, boolean>;
      let progressCount = 0;
      SECTION_KEYS.forEach((s, idx) => {
        const done = rand() > (0.15 + idx * 0.1);
        sections[s.key] = done;
        if (done) progressCount++;
      });
      const progressPct = Math.round((progressCount / SECTION_KEYS.length) * 100);
      const integrityEvents = rand() > 0.82 ? 1 + Math.floor(rand() * 4) : 0;
      students.push({
        id: id++,
        nama: `${fn} ${ln}`,
        kelas,
        materi: MATERI_LIST[Math.floor(rand() * MATERI_LIST.length)],
        tanggalJoin: `${1 + Math.floor(rand() * 28)}/0${1 + Math.floor(rand() * 6)}/2026`,
        diagNilai,
        diagPassed: diagNilai >= 70,
        diagDurasi,
        diagAttempt,
        formNilai,
        formPassed: formNilai >= 70,
        formDurasi,
        formAttempt,
        sections,
        progressPct,
        integrityEvents,
      });
    }
  });
  return students;
}

const STUDENTS: Student[] = genStudents();

const DIAG_SOAL: DiagSoal[] = [
  { soal: "Sebuah organisasi punya 5 kandidat ketua dan 4 kandidat wakil ketua. Berapa banyak pasangan ketua dan wakil yang mungkin terbentuk?", jawaban: "20, menggunakan kaidah perkalian 5 x 4" },
  { soal: "Ada berapa cara menyusun 3 huruf berbeda dari kata MATEMATIKA tanpa pengulangan?", jawaban: "Siswa menjawab 720, seharusnya menghitung huruf unik dulu" },
  { soal: "Dari 8 pemain, dipilih 3 untuk starting line up tanpa memperhatikan posisi. Ada berapa kemungkinan?", jawaban: "56, menggunakan kombinasi C(8,3)" },
];

const FORM_SOAL: FormSoal[] = [
  { soal: "Berapa banyak kata sandi 4 digit angka berbeda yang bisa dibentuk dari angka 0-9?", jawabanAkhir: "5040", cara: "Menggunakan permutasi P(10,4) = 10x9x8x7", feedback: "Jawaban benar. Identifikasi kondisi soal sudah tepat, penerapan rumus permutasi konsisten dengan syarat tanpa pengulangan." },
  { soal: "Sebuah tim voli terdiri dari 6 pemain dipilih dari 10 pemain yang tersedia. Ada berapa kemungkinan susunan tim?", jawabanAkhir: "252", cara: "C(10,6) = 10! / (6! x 4!)", feedback: "Jawaban benar. Namun penjelasan kenapa memilih kombinasi bukan permutasi belum ditulis eksplisit." },
];

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        background: ok ? COLORS.greenLight : "#EDEDED",
        color: ok ? COLORS.green : "#8A8A8A",
        border: `1px solid ${ok ? COLORS.green : "#D5D5D5"}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? COLORS.green : "#B0B0B0" }} />
      {label}
    </span>
  );
}

interface CategoryHeaderProps {
  color: string;
  title: string;
  subtitle?: string;
}

function CategoryHeader({ color, title, subtitle }: CategoryHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
      <div style={{ width: 4, alignSelf: "stretch", background: color, borderRadius: 0, minHeight: 34 }} />
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1F1F1F", letterSpacing: "-0.01em" }}>{title}</h2>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#6B6B6B" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  span?: number;
  style?: React.CSSProperties;
}

function Card({ children, span = 1, style = {} }: CardProps) {
  return (
    <div
      style={{
        background: COLORS.white,
        border: "1px solid #E2E2E2",
        borderRadius: 10,
        padding: 18,
        gridColumn: `span ${span}`,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: ReactNode }) {
  return <h3 style={{ margin: "0 0 14px", fontSize: 13.5, fontWeight: 600, color: "#333" }}>{children}</h3>;
}

interface SingleValueCardProps {
  title: string;
  value: number;
  keterangan: string;
  icon?: ReactNode;
}

function SingleValueCard({ title, value, keterangan, icon }: SingleValueCardProps) {
  return (
    <Card span={1}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 6 }}>
        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 500, color: "#6B6B6B", display: "flex", alignItems: "center", gap: 6 }}>
          {icon && (
            <span style={{ color: COLORS.green, fontSize: 16, display: "inline-flex" }}>
              {icon}
            </span>
          )}
          {title}
        </div>
        {/* Value besar di tengah */}
        <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.green, lineHeight: 1 }}>
          {value}
        </div>
        {/* Keterangan kecil di bawah */}
        <div style={{ fontSize: 11.5, color: "#8A8A8A" }}>{keterangan}</div>
      </div>
    </Card>
  );
}

const GENDER_COLORS: Record<string, string> = {
  "laki-laki": COLORS.green,
  perempuan: COLORS.purple,
};

interface GenderDonutDatum {
  name: string;
  value: number;
  color: string;
}

interface GenderDistributionCardProps {
  genderBreakdown?: GenderBreakdown[];
  loading?: boolean;
}

function GenderDistributionCard({ genderBreakdown, loading }: GenderDistributionCardProps) {
  const total = genderBreakdown ? genderBreakdown.reduce((sum, g) => sum + g.total, 0) : 0;

  const donutData: GenderDonutDatum[] = genderBreakdown
    ? genderBreakdown.map((g) => {
        const genderLower = g.gender.toLowerCase();
        const displayName =
          genderLower === "laki-laki" || genderLower === "laki" || genderLower === "male"
            ? "Laki-laki"
            : genderLower === "perempuan" || genderLower === "female"
              ? "Perempuan"
              : g.gender;
        const color = GENDER_COLORS[genderLower] ?? "#B0B0B0";
        return { name: displayName, value: g.total, color };
      })
    : [];

  return (
    <Card span={3}>
      <CardTitle>Total siswa</CardTitle>
      {loading && !genderBreakdown ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8A8A", fontSize: 13 }}>
          Memuat data...
        </div>
      ) : total === 0 ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8A8A", fontSize: 13 }}>
          Belum ada data
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke={COLORS.white}
                  strokeWidth={3}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 600, color: "#1F1F1F", lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>siswa</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {donutData.map((g) => {
              const pct = total > 0 ? Math.round((g.value / total) * 100) : 0;
              return (
                <div key={g.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{g.name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#333" }}>
                      <span style={{ fontWeight: 600 }}>{g.value}</span>
                      <span style={{ color: "#8A8A8A", marginLeft: 5 }}>({pct}%)</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "#EDEDED", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: g.color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  kelasOptions: KelasOption[];
  loading?: boolean;
  diagAttempt: number | "latest";
  setDiagAttempt: (val: number | "latest") => void;
}

function FilterBar({ filters, setFilters, kelasOptions, loading, diagAttempt, setDiagAttempt }: FilterBarProps) {
  const selectStyle: React.CSSProperties = {
    padding: "7px 10px",
    borderRadius: 6,
    border: "1px solid #D8D8D8",
    fontSize: 13,
    background: COLORS.white,
    color: "#333",
    minWidth: 140,
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: "#6B6B6B", fontWeight: 500, marginBottom: 4, display: "block" };

  return (
    <div
      style={{
        position: "sticky",
        top: 64,              // tepat di bawah spacer header DashboardShell (64px)
        zIndex: 8,            // di bawah spacer shell (z-index 9), di atas konten
        background: COLORS.white,
        borderBottom: "1px solid #ECECEC",
        display: "flex",
        gap: 18,
        alignItems: "flex-end",
        flexWrap: "wrap",
        padding: "14px 0",
        marginBottom: 8,
      }}
    >
      <div style={{ marginRight: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.green }}>Dashboard analitik</div>
        <div style={{ fontSize: 11, color: "#8A8A8A" }}>Pantau performa & progres siswa</div>
      </div>
      <div>
        <label style={labelStyle}>Kelas</label>
        <select
          style={selectStyle}
          value={filters.kelas}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, kelas: e.target.value })}
          disabled={loading}
        >
          <option value="all">Semua kelas</option>
          {kelasOptions.map((k) => (
            <option key={k.classId} value={String(k.classId)}>
              {k.namaKelas}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Materi</label>
        <select style={selectStyle} value={filters.materi} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, materi: e.target.value })}>
          <option value="all">Semua materi</option>
          {MATERI_LIST.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Percobaan diagnostik</label>
        <select
          style={selectStyle}
          value={diagAttempt === "latest" ? "latest" : String(diagAttempt)}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const val = e.target.value;
            setDiagAttempt(val === "latest" ? "latest" : parseInt(val, 10));
          }}
        >
          <option value="latest">Terakhir</option>
          <option value="1">Percobaan 1</option>
          <option value="2">Percobaan 2</option>
          <option value="3">Percobaan 3</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Percobaan formatif</label>
        <select style={selectStyle} defaultValue="terakhir">
          <option value="terakhir">Terakhir</option>
          <option value="1">Percobaan 1</option>
          <option value="2">Percobaan 2</option>
        </select>
      </div>
      {filters.kelas !== "all" || filters.materi !== "all" ? (
        <button
          onClick={() => setFilters({ kelas: "all", materi: "all" })}
          style={{
            fontSize: 12.5,
            color: COLORS.purple,
            background: "transparent",
            border: `1px solid ${COLORS.purple}`,
            borderRadius: 6,
            padding: "7px 12px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Reset filter
        </button>
      ) : null}
    </div>
  );
}

interface DetailModalProps {
  item: DiagnosticDetailItem | null;
  type: ModalType | undefined;
  onClose: () => void;
}

interface DraftAnswerItem {
  soal: string;
  jawaban: string;
}

function DetailModal({ item, type, onClose }: DetailModalProps) {
  const [answers, setAnswers] = useState<DraftAnswerItem[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    if (!item || type !== "diag") {
      setAnswers([]);
      return;
    }

    let cancelled = false;
    setLoadingAnswers(true);
    setAnswers([]);

    fetch(
      `/api/guru/diagnostic/draft-answers?studentId=${item.studentId}&attemptNumber=${item.attemptNumber}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setAnswers(data.answers ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setAnswers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingAnswers(false);
      });

    return () => { cancelled = true; };
  }, [item, type]);

  if (!item) return null;
  const isDiag = type === "diag";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30,30,30,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          background: COLORS.white,
          borderRadius: 12,
          maxWidth: 640,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          border: "1px solid #E2E2E2",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #E8E8E8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: COLORS.white,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1F1F1F" }}>{item.nama}</div>
            <div style={{ fontSize: 12.5, color: "#6B6B6B" }}>
              {item.kelas} &middot; {isDiag ? "Asesmen diagnostik" : "Asesmen formatif"} &middot; percobaan {item.attemptNumber}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#F2F2F2",
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 15,
              color: "#555",
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ padding: 22 }}>
          {isDiag ? (
            loadingAnswers ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#8A8A8A", fontSize: 13 }}>
                Memuat jawaban...
              </div>
            ) : answers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#8A8A8A", fontSize: 13 }}>
                Tidak ada data jawaban
              </div>
            ) : (
              answers.map((a, idx) => (
                <div key={idx} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: idx < answers.length - 1 ? "1px solid #EFEFEF" : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.purple, marginBottom: 6 }}>{a.soal}</div>
                  <div style={{ fontSize: 13.5, color: "#333", marginBottom: 10, lineHeight: 1.6 }}>
                    Jawaban siswa:
                  </div>
                  <div style={{ fontSize: 13, color: "#555", background: "#FAFAFA", padding: "10px 12px", borderRadius: 6 }}>
                    {a.jawaban || "-"}
                  </div>
                </div>
              ))
            )
          ) : (
            FORM_SOAL.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: idx < FORM_SOAL.length - 1 ? "1px solid #EFEFEF" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.purple, marginBottom: 6 }}>Soal {idx + 1}</div>
                <div style={{ fontSize: 13.5, color: "#333", marginBottom: 10, lineHeight: 1.6 }}>{item.soal}</div>
                <div style={{ fontSize: 13, color: "#555", background: "#FAFAFA", padding: "10px 12px", borderRadius: 6, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Jawaban akhir: </span>{item.jawabanAkhir}
                </div>
                <div style={{ fontSize: 13, color: "#555", background: "#FAFAFA", padding: "10px 12px", borderRadius: 6, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Cara mengerjakan: </span>{item.cara}
                </div>
                <div style={{ fontSize: 13, color: COLORS.green, background: COLORS.greenLight, padding: "10px 12px", borderRadius: 6 }}>
                  <span style={{ fontWeight: 500 }}>Feedback AI: </span>{item.feedback}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function KombinaraDashboard() {
  const [filters, setFilters] = useState<Filters>({ kelas: "all", materi: "all" });
  const [diagAttempt, setDiagAttempt] = useState<number | "latest">("latest");
  const [modal, setModal] = useState<ModalState | null>(null);

  // ── API: hitung classIds & materi slug untuk filter ──────
  const selectedClassIds = useMemo(() => {
    if (filters.kelas === "all") return undefined;
    const id = parseInt(filters.kelas, 10);
    return isNaN(id) ? undefined : [id];
  }, [filters.kelas]);

  const materiSlug = useMemo(() => {
    if (filters.materi === "all") return undefined;
    return MATERI_SLUG_MAP[filters.materi] ?? filters.materi.toLowerCase();
  }, [filters.materi]);

  const { data: dashData, loading: dashLoading, error: dashError, refetch: dashRefetch } = useGuruDashboard({
    classIds: selectedClassIds,
    materi: materiSlug,
    includeDiagnostic: true,
    includeJourney: true,
    diagAttempt,
  });

  // ── Progress data dari API ─────────────────────────────────
  const progressData = dashData?.studentProgress ?? [];

  // ── Dummy data (untuk section yang belum dimigrasi) ────────
  const filtered = useMemo(() => {
    let result = STUDENTS;
    if (filters.kelas !== "all") {
      // Cari nama kelas dari kelasOptions untuk filter dummy data
      const selectedOpt = dashData?.kelasOptions.find(
        (k) => String(k.classId) === filters.kelas
      );
      if (selectedOpt) {
        // Dummy data pakai nama kelas sebagai string — tidak exact match,
        // jadi skip filter dummy jika tidak cocok
        result = result.filter((s) => s.kelas === selectedOpt.namaKelas);
      }
    }
    if (filters.materi !== "all") {
      result = result.filter((s) => s.materi === filters.materi);
    }
    return result;
  }, [filters, dashData]);

  // ── Data real dari API untuk distribusi (donut chart) ──────
  const realDistribusi = useMemo(() => {
    if (!dashData) return [];
    return dashData.distribusiKelas.map((d) => ({
      kelas: d.namaKelas,
      total: d.totalSiswa,
    }));
  }, [dashData]);

  const diagBar = useMemo(() => {
    // Skor 0, 10, 20, ..., 100 (11 bar)
    const ALL_SCORES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const scoreMap: Record<number, number> = {};
    ALL_SCORES.forEach((s) => { scoreMap[s] = 0; });

    const scoreData = dashData?.diagnostic?.scoreDistribution;
    if (scoreData && scoreData.length > 0) {
      scoreData.forEach((item) => {
        if (item.totalScore in scoreMap) {
          scoreMap[item.totalScore] += item.jumlahSiswa;
        }
      });
    } else {
      // Fallback ke dummy data
      filtered.forEach((s) => { scoreMap[s.diagNilai] = (scoreMap[s.diagNilai] || 0) + 1; });
    }
    return ALL_SCORES.map((score) => ({ score: String(score), total: scoreMap[score] }));
  }, [filtered, dashData]);

  const diagStats = useMemo(() => {
    // Expand bar data into individual scores
    const scores: number[] = [];
    diagBar.forEach((bar) => {
      const s = Number(bar.score);
      for (let i = 0; i < bar.total; i++) scores.push(s);
    });
    if (scores.length === 0) return { mean: 0, median: 0, std: 0, n: 0 };

    const n = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Median
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    const median = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Standard deviation (population)
    const variance = scores.reduce((acc, val) => acc + (val - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);

    return { mean, median, std, n };
  }, [diagBar]);

  const formBar = useMemo(() => {
    // Skor 0, 10, 20, ..., 100 (11 bar)
    const ALL_SCORES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const scoreMap: Record<number, number> = {};
    ALL_SCORES.forEach((s) => { scoreMap[s] = 0; });
    filtered.forEach((s) => { scoreMap[s.formNilai] = (scoreMap[s.formNilai] || 0) + 1; });
    return ALL_SCORES.map((score) => ({ score: String(score), total: scoreMap[score] }));
  }, [filtered]);

  const formStats = useMemo(() => {
    // Expand bar data into individual scores
    const scores: number[] = [];
    formBar.forEach((bar) => {
      const s = Number(bar.score);
      for (let i = 0; i < bar.total; i++) scores.push(s);
    });
    if (scores.length === 0) return { mean: 0, median: 0, std: 0, n: 0 };

    const n = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Median
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    const median = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Standard deviation (population)
    const variance = scores.reduce((acc, val) => acc + (val - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);

    return { mean, median, std, n };
  }, [formBar]);

  const diagAttemptDist = useMemo(() => {
    const realData = dashData?.diagnostic?.attemptDistribution;
    if (realData && realData.length > 0) {
      return realData
        .map((item) => ({ attempt: `Percobaan ${item.attemptNumber}`, total: item.total }))
        .sort((a, b) => a.attempt.localeCompare(b.attempt));
    }
    // Fallback ke dummy data
    const map: Record<number, number> = {};
    filtered.forEach((s) => { map[s.diagAttempt] = (map[s.diagAttempt] || 0) + 1; });
    return Object.entries(map).map(([attempt, total]) => ({ attempt: `Percobaan ${attempt}`, total })).sort((a, b) => a.attempt.localeCompare(b.attempt));
  }, [filtered, dashData]);

  const formAttemptDist = useMemo(() => {
    const map: Record<number, number> = {};
    filtered.forEach((s) => { map[s.formAttempt] = (map[s.formAttempt] || 0) + 1; });
    return Object.entries(map).map(([attempt, total]) => ({ attempt: `Percobaan ${attempt}`, total })).sort((a, b) => a.attempt.localeCompare(b.attempt));
  }, [filtered]);

  const scatterDiag = useMemo(() => {
    const realData = dashData?.diagnostic?.durationScatter;
    if (realData && realData.length > 0) {
      return realData.slice(0, 80).map((item) => ({
        x: item.durasiMenit,
        y: item.nilai,
        passed: item.passed,
      }));
    }
    // Fallback ke dummy data
    return filtered.slice(0, 80).map((s) => ({ x: s.diagDurasi, y: s.diagNilai, passed: s.diagPassed }));
  }, [filtered, dashData]);
  const scatterForm = useMemo(() => filtered.slice(0, 80).map((s) => ({ x: s.formDurasi, y: s.formNilai, passed: s.formPassed })), [filtered]);

  // Total kelas & siswa: prioritas data real, fallback ke dummy
  const totalKelas = dashData?.totalKelas ?? (new Set(filtered.map((s) => s.kelas)).size || KELAS_LIST.length);
  const totalSiswa = dashData?.totalSiswa ?? filtered.length;

  const integrityLog = useMemo(() => filtered.filter((s) => s.integrityEvents > 0 && s.materi !== "Pendahuluan").slice(0, 12), [filtered]);

  const diagTableRows = useMemo(() => {
    const real = dashData?.diagnostic?.detailPerSiswa;
    if (real && real.length > 0) return real;
    // Fallback ke dummy data
    return filtered.slice(0, 10).map((s) => ({
      studentId: s.id,
      nama: s.nama,
      kelas: s.kelas,
      nilai: s.diagNilai,
      attemptNumber: s.diagAttempt,
      durasiMenit: s.diagDurasi,
      status: s.diagPassed ? "Lulus" : "Belum Lulus",
      submittedAt: s.tanggalJoin,
    })) as DiagnosticDetailItem[];
  }, [filtered, dashData]);
  const formTableRows = filtered.slice(0, 10);

  // Column defs that need component state (setModal)
  const diagDetailCols = useMemo((): Column<Record<string, unknown>>[] => [
    { key: "nama", label: "Nama" },
    { key: "kelas", label: "Kelas" },
    { key: "nilai", label: "Nilai" },
    { key: "attemptNumber", label: "Percobaan", render: (row) => <>{String(row.attemptNumber)}x</> },
    { key: "durasiMenit", label: "Durasi (menit)", render: (row) => <>{Math.round(Number(row.durasiMenit))}</> },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (row) => <StatusBadge ok={row.status === "Lulus"} label={String(row.status)} />,
    },
    {
      key: "_action",
      label: "",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => setModal({ item: row as unknown as DiagnosticDetailItem, type: "diag" })}
          style={{ fontSize: 12, color: COLORS.purple, background: "transparent", border: `1px solid ${COLORS.purple}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
        >
          Lihat jawaban
        </button>
      ),
    },
  ], [setModal]);

  const formDetailCols = useMemo((): Column<Record<string, unknown>>[] => [
    { key: "nama", label: "Nama" },
    { key: "kelas", label: "Kelas" },
    { key: "materi", label: "Materi" },
    { key: "formNilai", label: "Nilai" },
    { key: "formAttempt", label: "Percobaan", render: (row) => <>{String(row.formAttempt)}x</> },
    { key: "formDurasi", label: "Durasi", render: (row) => <>{String(row.formDurasi)} menit</> },
    {
      key: "_status",
      label: "Status",
      sortable: false,
      render: (row) => <StatusBadge ok={Boolean(row.formPassed)} label={row.formPassed ? "Lulus" : "Belum lulus"} />,
    },
    {
      key: "_action",
      label: "",
      sortable: false,
      render: (row) => (
        <button
          onClick={() =>
            setModal({
              item: {
                studentId: row.id as number,
                nama: String(row.nama),
                kelas: String(row.kelas),
                nilai: Number(row.formNilai),
                attemptNumber: Number(row.formAttempt),
                durasiMenit: Number(row.formDurasi),
                status: row.formPassed ? "Lulus" : "Belum Lulus",
                submittedAt: String(row.tanggalJoin),
              },
              type: "form",
            })
          }
          style={{ fontSize: 12, color: COLORS.purple, background: "transparent", border: `1px solid ${COLORS.purple}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
        >
          Lihat jawaban
        </button>
      ),
    },
  ], [setModal]);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 60 }}>
      {/* ── Error banner ─────────────────────────────────── */}
      {dashError && (
        <div
          style={{
            background: "#FFF5F5",
            border: "1px solid #FECACA",
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#991B1B" }}>Gagal memuat data dashboard</div>
              <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 2 }}>{dashError}</div>
            </div>
          </div>
          <button
            onClick={dashRefetch}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#991B1B",
              background: "#FEE2E2",
              border: "1px solid #FECACA",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Coba lagi
          </button>
        </div>
      )}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        kelasOptions={dashData?.kelasOptions ?? []}
        loading={dashLoading}
        diagAttempt={diagAttempt}
        setDiagAttempt={setDiagAttempt}
      />

      <div>

        {/* OVERVIEW */}
        <section style={{ marginBottom: 36 }}>
          <CategoryHeader color={COLORS.green} title="Ringkasan" subtitle="Gambaran umum kelas dan siswa" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <SingleValueCard title="Total kelas" value={totalKelas} keterangan="kelas" icon={<i className="ti ti-school" />} />
            <GenderDistributionCard genderBreakdown={dashData?.genderBreakdown} loading={dashLoading} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 14 }}>
            <Card span={4}>
              <CardTitle>Distribusi kelas</CardTitle>
              {dashLoading && !dashData ? (
                <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8A8A", fontSize: 13 }}>
                  Memuat data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={realDistribusi} dataKey="total" nameKey="kelas" innerRadius={35} outerRadius={58} paddingAngle={2}>
                      {realDistribusi.map((_, i) => (
                        <Cell key={i} fill={[COLORS.green, COLORS.purple, COLORS.greenLight, COLORS.brickLight, "#4A8A50", "#8A5387", "#D9A5D5"][i % 7]} stroke={COLORS.white} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <Card>
              <CardTitle>Daftar siswa</CardTitle>
              {dashLoading && !dashData ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>
                  Memuat data...
                </div>
              ) : (
                <SortableTable
                  columns={DAFTAR_SISWA_COLS}
                  data={(dashData?.daftarSiswa ?? []) as unknown as Record<string, unknown>[]}
                  rowKey={(_, i) => i}
                  maxHeight={220}
                  emptyMessage="Belum ada data siswa"
                />
              )}
            </Card>

            <Card>
              <CardTitle>Progress belajar siswa</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {dashLoading && !dashData ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>
                    Memuat data...
                  </div>
                ) : progressData.length === 0 ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>
                    Belum ada data progress
                  </div>
                ) : (
                  progressData.map((s) => (
                    <div key={s.studentId}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: "#333" }}>{s.name}</span>
                        <span style={{ color: "#8A8A8A" }}>{s.pct}%</span>
                      </div>
                      <div style={{ height: 7, background: "#EDEDED", borderRadius: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${s.pct}%`,
                            height: "100%",
                            background: s.pct >= 70 ? COLORS.green : s.pct >= 30 ? COLORS.purple : COLORS.brick,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* DIAGNOSTIK */}
        <section style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #DEDEDA" }}>
          <CategoryHeader color={COLORS.purple} title="Asesmen diagnostik" subtitle="Hasil gate prasyarat sebelum siswa mulai belajar" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 14 }}>
            <Card>
              <CardTitle>Distribusi nilai</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={diagBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" vertical={false} />
                  <XAxis dataKey="score" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} label={{ value: "Nilai", position: "bottom", offset: -4, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <YAxis tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} label={{ value: "Jumlah Siswa", angle: -90, position: "left", offset: 12, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#8A8A8A", marginTop: 6, justifyContent: "center" }}>
                <span>Mean <b style={{ color: "#555" }}>{diagStats.mean.toFixed(1)}</b></span>
                <span>Median <b style={{ color: "#555" }}>{diagStats.median.toFixed(1)}</b></span>
                <span>Std <b style={{ color: "#555" }}>{diagStats.std.toFixed(1)}</b></span>
              </div>
            </Card>

            <Card>
              <CardTitle>Durasi vs nilai</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                  <XAxis type="number" dataKey="x" name="Durasi (menit)" domain={[0, "dataMax"]} tickCount={5} tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} label={{ value: "Durasi (menit)", position: "bottom", offset: -4, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <YAxis dataKey="y" name="Nilai" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} label={{ value: "Nilai", angle: -90, position: "left", offset: 12, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={scatterDiag.filter((d) => d.passed)} fill={COLORS.green} />
                  <Scatter data={scatterDiag.filter((d) => !d.passed)} fill={COLORS.brick} />
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#8A8A8A", marginTop: 4 }}>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.green, marginRight: 4 }} />Lulus</span>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.brick, marginRight: 4 }} />Belum lulus</span>
              </div>
            </Card>

            <Card>
              <CardTitle>Distribusi percobaan</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={diagAttemptDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} label={{ value: "Jumlah Siswa", position: "bottom", offset: -4, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <YAxis type="category" dataKey="attempt" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.green} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card>
            <CardTitle>Detail hasil diagnostik per siswa</CardTitle>
            <SortableTable
              columns={diagDetailCols}
              data={diagTableRows as unknown as Record<string, unknown>[]}
              rowKey={(s) => `${s.studentId}-${s.attemptNumber}`}
              maxHeight={400}
            />
          </Card>
        </section>

        {/* JOURNEY: PENDAHULUAN */}
        <section style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #DEDEDA" }}>
          <CategoryHeader color={COLORS.green} title="Journey siswa — Pendahuluan" subtitle="Apersepsi, Pemantik, dan Refleksi awal" />
          <Card>
            <SortableTable
              columns={JOURNEY_PENDAHULUAN_COLS}
              data={(dashData?.journey?.pendahuluan ?? []) as unknown as Record<string, unknown>[]}
              rowKey={(row) => row.studentId as number}
              maxHeight={400}
              fontSize={12}
              minWidth={400}
              emptyMessage="Belum ada data journey pendahuluan"
            />
          </Card>
        </section>

        {/* JOURNEY: MATERI */}
        <section style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #DEDEDA" }}>
          <CategoryHeader color={COLORS.green} title="Journey siswa — Materi" subtitle="Progress tiap siswa per konsep materi" />
          <Card>
            <SortableTable
              columns={JOURNEY_MATERI_COLS}
              data={(dashData?.journey?.materi ?? []) as unknown as Record<string, unknown>[]}
              rowKey={(row) => `${row.studentId}-${row.conceptId}`}
              maxHeight={400}
              fontSize={12}
              minWidth={800}
              emptyMessage="Belum ada data journey materi"
            />
          </Card>
        </section>

        {/* FORMATIF */}
        <section style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #DEDEDA" }}>
          <CategoryHeader color={COLORS.purple} title="Asesmen formatif" subtitle="Evaluasi per modul setelah penjelasan konsep" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 14 }}>
            <Card>
              <CardTitle>Distribusi nilai</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={formBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" vertical={false} />
                  <XAxis dataKey="score" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} label={{ value: "Nilai", position: "bottom", offset: -4, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <YAxis tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} label={{ value: "Jumlah Siswa", angle: -90, position: "left", offset: 12, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#8A8A8A", marginTop: 6, justifyContent: "center" }}>
                <span>Mean <b style={{ color: "#555" }}>{formStats.mean.toFixed(1)}</b></span>
                <span>Median <b style={{ color: "#555" }}>{formStats.median.toFixed(1)}</b></span>
                <span>Std <b style={{ color: "#555" }}>{formStats.std.toFixed(1)}</b></span>
              </div>
            </Card>

            <Card>
              <CardTitle>Durasi vs nilai</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                  <XAxis type="number" dataKey="x" name="Durasi (menit)" domain={[0, "dataMax"]} tickCount={5} tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} label={{ value: "Durasi (menit)", position: "bottom", offset: -4, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <YAxis dataKey="y" name="Nilai" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} label={{ value: "Nilai", angle: -90, position: "left", offset: 12, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={scatterForm.filter((d) => d.passed)} fill={COLORS.green} />
                  <Scatter data={scatterForm.filter((d) => !d.passed)} fill={COLORS.brick} />
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#8A8A8A", marginTop: 4 }}>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.green, marginRight: 4 }} />Lulus</span>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.brick, marginRight: 4 }} />Belum lulus</span>
              </div>
            </Card>

            <Card>
              <CardTitle>Distribusi percobaan</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={formAttemptDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} label={{ value: "Jumlah Siswa", position: "bottom", offset: -4, style: { fontSize: 11, fill: "#8A8A8A" } }} />
                  <YAxis type="category" dataKey="attempt" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card>
            <CardTitle>Detail hasil formatif per siswa</CardTitle>
            <SortableTable
              columns={formDetailCols}
              data={formTableRows as unknown as Record<string, unknown>[]}
              rowKey={(s) => s.id as number}
              maxHeight={400}
            />
          </Card>
        </section>

        {/* INTEGRITAS */}
        <section style={{ paddingTop: 28, borderTop: "1px solid #DEDEDA" }}>
          <CategoryHeader color={COLORS.brick} title="Integritas pengerjaan" subtitle="Log tab switch dan keluar dari mode fullscreen selama asesmen" />
          <Card>
            {integrityLog.length === 0 ? (
              <div style={{ fontSize: 13, color: "#8A8A8A", padding: "8px 0" }}>Tidak ada kejadian integritas pada filter yang dipilih.</div>
            ) : (
              <SortableTable
                columns={INTEGRITY_COLS}
                data={integrityLog as unknown as Record<string, unknown>[]}
                rowKey={(s) => s.id as number}
                maxHeight={400}
              />
            )}
          </Card>
        </section>
      </div>

      {modal && <DetailModal item={modal.item} type={modal.type} onClose={() => setModal(null)} />}
    </div>
  );
}