"use client"

import React, { useState, useMemo, ReactNode } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell, Legend
} from "recharts";

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
  kelas: string;
  materi: string;
}

type ModalType = "diag" | "form";

interface ModalState {
  student: Student;
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
const SECTION_KEYS: { key: SectionKey; label: string }[] = [
  { key: "apersepsi", label: "Apersepsi" },
  { key: "eksplorasi", label: "Eksplorasi" },
  { key: "deepLearning", label: "Deep learning" },
  { key: "contohSoal", label: "Contoh soal" },
  { key: "refleksi", label: "Refleksi mini" },
  { key: "aktivitas", label: "Aktivitas siswa" },
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
  label: string;
  value: number;
  icon: ReactNode;
}

function SingleValueCard({ label, value, icon }: SingleValueCardProps) {
  return (
    <Card span={1}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12.5, color: "#6B6B6B", fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.green, marginTop: 6 }}>{value}</div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: COLORS.greenLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.green,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

function FilterBar({ filters, setFilters }: FilterBarProps) {
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
        <select style={selectStyle} value={filters.kelas} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, kelas: e.target.value })}>
          <option value="all">Semua kelas</option>
          {KELAS_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
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
        <select style={selectStyle} defaultValue="terakhir">
          <option value="terakhir">Terakhir</option>
          <option value="1">Percobaan 1</option>
          <option value="2">Percobaan 2</option>
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
  student: Student | null;
  type: ModalType | undefined;
  onClose: () => void;
}

function DetailModal({ student, type, onClose }: DetailModalProps) {
  if (!student) return null;
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
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1F1F1F" }}>{student.nama}</div>
            <div style={{ fontSize: 12.5, color: "#6B6B6B" }}>
              {student.kelas} &middot; {isDiag ? "Asesmen diagnostik" : "Asesmen formatif"} &middot; percobaan {isDiag ? student.diagAttempt : student.formAttempt}
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
          {isDiag
            ? DIAG_SOAL.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: idx < DIAG_SOAL.length - 1 ? "1px solid #EFEFEF" : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.purple, marginBottom: 6 }}>Soal {idx + 1}</div>
                  <div style={{ fontSize: 13.5, color: "#333", marginBottom: 10, lineHeight: 1.6 }}>{item.soal}</div>
                  <div style={{ fontSize: 13, color: "#555", background: "#FAFAFA", padding: "10px 12px", borderRadius: 6 }}>
                    <span style={{ fontWeight: 500 }}>Jawaban siswa: </span>{item.jawaban}
                  </div>
                </div>
              ))
            : FORM_SOAL.map((item, idx) => (
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
              ))}
        </div>
      </div>
    </div>
  );
}

export default function KombinaraDashboard() {
  const [filters, setFilters] = useState<Filters>({ kelas: "all", materi: "all" });
  const [modal, setModal] = useState<ModalState | null>(null);

  const filtered = useMemo(() => {
    return STUDENTS.filter((s) => {
      if (filters.kelas !== "all" && s.kelas !== filters.kelas) return false;
      if (filters.materi !== "all" && s.materi !== filters.materi) return false;
      return true;
    });
  }, [filters]);

  const kelasDistribusi = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((s) => { map[s.kelas] = (map[s.kelas] || 0) + 1; });
    return Object.entries(map).map(([kelas, total]) => ({ kelas, total }));
  }, [filtered]);

  const diagBar = useMemo(() => {
    const buckets: { range: string; min: number; max: number; total: number }[] = [
      { range: "0-39", min: 0, max: 39, total: 0 },
      { range: "40-59", min: 40, max: 59, total: 0 },
      { range: "60-69", min: 60, max: 69, total: 0 },
      { range: "70-84", min: 70, max: 84, total: 0 },
      { range: "85-100", min: 85, max: 100, total: 0 },
    ];
    filtered.forEach((s) => {
      const b = buckets.find((b) => s.diagNilai >= b.min && s.diagNilai <= b.max);
      if (b) b.total++;
    });
    return buckets;
  }, [filtered]);

  const formBar = useMemo(() => {
    const buckets: { range: string; min: number; max: number; total: number }[] = [
      { range: "0-39", min: 0, max: 39, total: 0 },
      { range: "40-59", min: 40, max: 59, total: 0 },
      { range: "60-69", min: 60, max: 69, total: 0 },
      { range: "70-84", min: 70, max: 84, total: 0 },
      { range: "85-100", min: 85, max: 100, total: 0 },
    ];
    filtered.forEach((s) => {
      const b = buckets.find((b) => s.formNilai >= b.min && s.formNilai <= b.max);
      if (b) b.total++;
    });
    return buckets;
  }, [filtered]);

  const diagAttemptDist = useMemo(() => {
    const map: Record<number, number> = {};
    filtered.forEach((s) => { map[s.diagAttempt] = (map[s.diagAttempt] || 0) + 1; });
    return Object.entries(map).map(([attempt, total]) => ({ attempt: `Percobaan ${attempt}`, total })).sort((a, b) => a.attempt.localeCompare(b.attempt));
  }, [filtered]);

  const formAttemptDist = useMemo(() => {
    const map: Record<number, number> = {};
    filtered.forEach((s) => { map[s.formAttempt] = (map[s.formAttempt] || 0) + 1; });
    return Object.entries(map).map(([attempt, total]) => ({ attempt: `Percobaan ${attempt}`, total })).sort((a, b) => a.attempt.localeCompare(b.attempt));
  }, [filtered]);

  const scatterDiag = useMemo(() => filtered.slice(0, 80).map((s) => ({ x: s.diagDurasi, y: s.diagNilai, passed: s.diagPassed })), [filtered]);
  const scatterForm = useMemo(() => filtered.slice(0, 80).map((s) => ({ x: s.formDurasi, y: s.formNilai, passed: s.formPassed })), [filtered]);

  const totalKelas = new Set(filtered.map((s) => s.kelas)).size || KELAS_LIST.length;
  const totalSiswa = filtered.length;

  const integrityLog = useMemo(() => filtered.filter((s) => s.integrityEvents > 0).slice(0, 12), [filtered]);

  const journeyRows = filtered.slice(0, 14);
  const diagTableRows = filtered.slice(0, 10);
  const formTableRows = filtered.slice(0, 10);
  const siswaTableRows = filtered.slice(0, 10);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 60 }}>
      <FilterBar filters={filters} setFilters={setFilters} />

      <div>

        {/* OVERVIEW */}
        <section style={{ marginBottom: 36 }}>
          <CategoryHeader color={COLORS.green} title="Ringkasan" subtitle="Gambaran umum kelas dan siswa" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <SingleValueCard label="Total kelas" value={totalKelas} icon={<i className="ti ti-school" />} />
            <SingleValueCard label="Total siswa" value={totalSiswa} icon={<i className="ti ti-users" />} />
            <Card span={2}>
              <CardTitle>Distribusi kelas</CardTitle>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={kelasDistribusi} dataKey="total" nameKey="kelas" innerRadius={35} outerRadius={58} paddingAngle={2}>
                    {kelasDistribusi.map((_, i) => (
                      <Cell key={i} fill={[COLORS.green, COLORS.purple, COLORS.greenLight, COLORS.brickLight, "#4A8A50", "#8A5387", "#D9A5D5"][i % 7]} stroke={COLORS.white} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <Card>
              <CardTitle>Daftar siswa</CardTitle>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#8A8A8A", fontWeight: 500 }}>
                      <th style={{ padding: "6px 8px", borderBottom: "1px solid #E8E8E8" }}>Nama</th>
                      <th style={{ padding: "6px 8px", borderBottom: "1px solid #E8E8E8" }}>Kelas</th>
                      <th style={{ padding: "6px 8px", borderBottom: "1px solid #E8E8E8" }}>Tanggal join</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 8).map((s) => (
                      <tr key={s.id}>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid #F2F2F2", color: "#333" }}>{s.nama}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.kelas}</td>
                        <td style={{ padding: "7px 8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.tanggalJoin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardTitle>Progress belajar siswa</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {filtered.slice(0, 8).map((s) => (
                  <div key={s.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: "#333" }}>{s.nama}</span>
                      <span style={{ color: "#8A8A8A" }}>{s.progressPct}%</span>
                    </div>
                    <div style={{ height: 7, background: "#EDEDED", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${s.progressPct}%`, height: "100%", background: s.progressPct >= 70 ? COLORS.green : s.progressPct >= 40 ? COLORS.purple : COLORS.brick }} />
                    </div>
                  </div>
                ))}
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
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <CardTitle>Durasi vs nilai</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                  <XAxis dataKey="x" name="Durasi (menit)" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} />
                  <YAxis dataKey="y" name="Nilai" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} />
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
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="attempt" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.green} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card>
            <CardTitle>Detail hasil diagnostik per siswa</CardTitle>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#8A8A8A", fontWeight: 500 }}>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Nama</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Kelas</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Nilai</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Percobaan</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Durasi</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Status</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}></th>
                </tr>
              </thead>
              <tbody>
                {diagTableRows.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#333" }}>{s.nama}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.kelas}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#333", fontWeight: 500 }}>{s.diagNilai}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.diagAttempt}x</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.diagDurasi} menit</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2" }}>
                      <StatusBadge ok={s.diagPassed} label={s.diagPassed ? "Lulus" : "Belum lulus"} />
                    </td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2" }}>
                      <button
                        onClick={() => setModal({ student: s, type: "diag" })}
                        style={{ fontSize: 12, color: COLORS.purple, background: "transparent", border: `1px solid ${COLORS.purple}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                      >
                        Lihat jawaban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* PROGRESS PER MATERI */}
        <section style={{ marginBottom: 36, paddingTop: 28, borderTop: "1px solid #DEDEDA" }}>
          <CategoryHeader color={COLORS.green} title="Journey siswa per materi" subtitle="Progress tiap siswa melalui enam tahap pembelajaran" />
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 720 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#8A8A8A", fontWeight: 500 }}>
                    <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Nama</th>
                    <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Materi</th>
                    {SECTION_KEYS.map((s) => (
                      <th key={s.key} style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8", textAlign: "center" }}>{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {journeyRows.map((s) => (
                    <tr key={s.id}>
                      <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#333" }}>{s.nama}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.materi}</td>
                      {SECTION_KEYS.map((sk) => (
                        <td key={sk.key} style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: s.sections[sk.key] ? COLORS.green : "#E0E0E0",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <CardTitle>Durasi vs nilai</CardTitle>
              <ResponsiveContainer width="100%" height={160}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                  <XAxis dataKey="x" name="Durasi (menit)" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={{ stroke: "#DDD" }} tickLine={false} />
                  <YAxis dataKey="y" name="Nilai" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} />
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
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="attempt" tick={{ fontSize: 11, fill: "#8A8A8A" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E2E2" }} />
                  <Bar dataKey="total" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card>
            <CardTitle>Detail hasil formatif per siswa</CardTitle>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#8A8A8A", fontWeight: 500 }}>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Nama</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Kelas</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Nilai</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Percobaan</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Durasi</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Status</th>
                  <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}></th>
                </tr>
              </thead>
              <tbody>
                {formTableRows.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#333" }}>{s.nama}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.kelas}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#333", fontWeight: 500 }}>{s.formNilai}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.formAttempt}x</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.formDurasi} menit</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2" }}>
                      <StatusBadge ok={s.formPassed} label={s.formPassed ? "Lulus" : "Belum lulus"} />
                    </td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2" }}>
                      <button
                        onClick={() => setModal({ student: s, type: "form" })}
                        style={{ fontSize: 12, color: COLORS.purple, background: "transparent", border: `1px solid ${COLORS.purple}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                      >
                        Lihat jawaban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* INTEGRITAS */}
        <section style={{ paddingTop: 28, borderTop: "1px solid #DEDEDA" }}>
          <CategoryHeader color={COLORS.brick} title="Integritas pengerjaan" subtitle="Log tab switch dan keluar dari mode fullscreen selama asesmen" />
          <Card>
            {integrityLog.length === 0 ? (
              <div style={{ fontSize: 13, color: "#8A8A8A", padding: "8px 0" }}>Tidak ada kejadian integritas pada filter yang dipilih.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#8A8A8A", fontWeight: 500 }}>
                    <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Nama</th>
                    <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Kelas</th>
                    <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Materi</th>
                    <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}>Jumlah kejadian</th>
                    <th style={{ padding: "7px 8px", borderBottom: "1px solid #E8E8E8" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {integrityLog.map((s) => (
                    <tr key={s.id}>
                      <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#333" }}>{s.nama}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.kelas}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#666" }}>{s.materi}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2" }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.brick, background: COLORS.brickLight, padding: "2px 8px", borderRadius: 4 }}>
                          {s.integrityEvents}x
                        </span>
                      </td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #F2F2F2", color: "#8A8A8A", fontSize: 11.5 }}>Tab switch / keluar fullscreen</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </section>
      </div>

      {modal && <DetailModal student={modal.student} type={modal.type} onClose={() => setModal(null)} />}
    </div>
  );
}