"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconClock, IconUserPair } from "@/components/activity/ActivityIcons";

// ── Color palette ──
const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

type YaTidak = "" | "ya" | "tidak";
type StrategiPilihan = "" | "strategi1" | "strategi2";

// ── Spinner ──
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

// ── Reusable Components ──
function TextInput({
  label,
  value,
  onChange,
  placeholder,
  id,
  readOnly = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        className={`border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  id,
  rows = 3,
  readOnly = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

function YaTidakRadio({
  name,
  value,
  onChange,
  readOnly = false,
}: {
  name: string;
  value: YaTidak;
  onChange: (v: YaTidak) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {["ya", "tidak"].map((opt) => (
        <label key={opt} className={`flex items-center gap-1.5 ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt as YaTidak)}
            disabled={readOnly}
            className="accent-green-700"
          />
          <span className="text-sm font-medium capitalize text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function StrategiSelect({
  value,
  onChange,
  readOnly = false,
}: {
  value: StrategiPilihan;
  onChange: (v: StrategiPilihan) => void;
  readOnly?: boolean;
}) {
  return (
    <select
      className={`border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default pointer-events-none" : ""}`}
      style={{ borderColor: C.border }}
      value={value}
      onChange={(e) => onChange(e.target.value as StrategiPilihan)}
      disabled={readOnly}
    >
      <option value="">— pilih —</option>
      <option value="strategi1">Strategi 1 (Kasus per Kasus)</option>
      <option value="strategi2">Strategi 2 (Komplemen)</option>
    </select>
  );
}

function SaveButton({ onClick, isSaving, isCorrect }: { onClick: () => void; isSaving: boolean; isCorrect?: boolean | null }) {
  if (isCorrect === true) return null;
  return (
    <div className="flex justify-end mt-4 pt-3 border-t" style={{ borderColor: `${C.green}26` }}>
      <button
        type="button"
        onClick={onClick}
        disabled={isSaving}
        className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        style={{ backgroundColor: C.green }}
      >
        {isSaving ? (
          <>
            <Spinner /> Menyimpan...
          </>
        ) : (
          "Simpan Jawaban"
        )}
      </button>
    </div>
  );
}

function FeedbackBox({ text, isCorrect }: { text: string; isCorrect?: boolean }) {
  const isWrong = isCorrect === false;
  const bc = isWrong ? "border-[#C44F4F33]" : "border-[#34673933]";
  const bg = isWrong ? "bg-[#C44F4F08]" : "bg-[#34673908]";
  const lc = isWrong ? "text-[#C44F4F]" : "text-[#346739]";
  const ic = isWrong ? "❌" : "✅";
  const title = isWrong ? "Jawaban Kurang Tepat" : "Jawaban Benar!";
  return (
    <div className={`mt-3 rounded-lg border ${bc} ${bg} p-3`}>
      <p className={`mb-1 text-xs font-semibold ${lc}`}>{ic} {title}</p>
      <p className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function SoalBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: C.green }}
      >
        {n}
      </div>
      <span className="text-sm font-bold" style={{ color: C.purple }}>
        {label}
      </span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: C.greenLight }}>
      <p className="text-base font-bold" style={{ color: C.green }}>
        {icon} {title}
      </p>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}

function PertanyaanCard({ children, readOnly }: { children: React.ReactNode; readOnly?: boolean }) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}
    >
      {children}
    </div>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`py-2.5 px-2 align-top ${className}`}>
      {children}
    </td>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── SIMULASI SYARAT (fitur baru) ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

interface OrangSimulasi {
  id: string;
  label: string;
}

interface HasilCekSyarat {
  memenuhi: boolean;
  rincian: string;
}

interface SimulasiState {
  dipilih: string[]; // id orang yang diklik siswa (percobaan saat ini)
  percobaanKe: number; // 0 - 3
  selesai: boolean; // true jika sudah 3 percobaan (summary tampil)
}

function makeSimulasiState(): SimulasiState {
  return { dipilih: [], percobaanKe: 0, selesai: false };
}

function SimulasiSyarat({
  orangPilihan,
  jumlahSlot,
  cekSyarat,
  ringkasanInsight,
  state,
  onChange,
}: {
  orangPilihan: OrangSimulasi[];
  jumlahSlot: number;
  cekSyarat: (idDipilih: string[]) => HasilCekSyarat;
  ringkasanInsight: string;
  state: SimulasiState;
  onChange: (next: SimulasiState) => void;
}) {
  const slotPenuh = state.dipilih.length >= jumlahSlot;
  const hasil = slotPenuh ? cekSyarat(state.dipilih) : null;

  const handlePilihOrang = (id: string) => {
    if (slotPenuh) return;
    if (state.dipilih.includes(id)) return;
    onChange({ ...state, dipilih: [...state.dipilih, id] });
  };

  const handleCobaSusunanLain = () => {
    onChange({ ...state, dipilih: [] });
  };

  const handleSelesaiPercobaan = () => {
    if (!slotPenuh) return;
    const percobaanBaru = state.percobaanKe + 1;
    onChange({
      dipilih: [],
      percobaanKe: percobaanBaru,
      selesai: percobaanBaru >= 3,
    });
  };

  const handleResetSimulasi = () => {
    onChange(makeSimulasiState());
  };

  const labelDipilih = state.dipilih
    .map((id) => orangPilihan.find((o) => o.id === id)?.label ?? id)
    .join(", ");

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ backgroundColor: "#2A5A8C08", border: "1px solid #2A5A8C33" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-bold" style={{ color: "#2A5A8C" }}>
          🎮 Simulasi: Coba Susun Sendiri
        </p>
        {!state.selesai && (
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-1"
            style={{ backgroundColor: "#2A5A8C", color: C.white }}
          >
            Percobaan ke-{Math.min(state.percobaanKe + 1, 3)} / 3
          </span>
        )}
      </div>

      {!state.selesai && (
        <>
          <p className="text-sm text-slate-700">
            Klik {jumlahSlot} orang di bawah ini untuk menyusun satu pilihan, lalu lihat apakah susunanmu memenuhi syarat.
          </p>

          {/* Pilihan orang */}
          <div className="flex flex-wrap gap-2">
            {orangPilihan.map((o) => {
              const sudahDipilih = state.dipilih.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handlePilihOrang(o.id)}
                  disabled={sudahDipilih || slotPenuh}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: sudahDipilih ? C.green : C.white,
                    color: sudahDipilih ? C.white : "#334155",
                    borderColor: sudahDipilih ? C.green : C.border,
                    opacity: !sudahDipilih && slotPenuh ? 0.4 : 1,
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Hasil pilihan + status syarat */}
          {state.dipilih.length > 0 && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Susunan Pilihanmu:
              </p>
              <p className="font-medium text-slate-800 mb-2">{labelDipilih}</p>

              {hasil && (
                <div
                  className="rounded-md px-3 py-2 text-sm font-semibold flex flex-col gap-1"
                  style={{
                    backgroundColor: hasil.memenuhi ? C.greenLight : "#FEE2E2",
                    color: hasil.memenuhi ? C.green : "#B91C1C",
                  }}
                >
                  <span>{hasil.memenuhi ? "✅ Memenuhi Syarat" : "❌ Melanggar Syarat"}</span>
                  <span className="text-xs font-normal" style={{ color: "#334155" }}>
                    {hasil.rincian}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tombol aksi */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {state.dipilih.length > 0 && !slotPenuh && (
              <button
                type="button"
                onClick={() => onChange({ ...state, dipilih: [] })}
                className="rounded-full px-4 py-1.5 text-xs font-medium border"
                style={{ borderColor: C.border, color: "#334155" }}
              >
                Ulangi Pilih
              </button>
            )}
            {slotPenuh && (
              <button
                type="button"
                onClick={handleCobaSusunanLain}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: "#2A5A8C" }}
              >
                🔄 Coba Susunan Lain
              </button>
            )}
            {slotPenuh && (
              <button
                type="button"
                onClick={handleSelesaiPercobaan}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                Selesai, Coba Lagi →
              </button>
            )}
          </div>

          {slotPenuh && (
            <p className="text-xs text-slate-500 italic">
              Tips: coba beberapa susunan berbeda dulu untuk melihat kapan syaratnya terpenuhi
              dan kapan tidak, baru tekan &quot;Selesai, Coba Lagi&quot;.
            </p>
          )}
        </>
      )}

      {/* Summary setelah 3x percobaan */}
      {state.selesai && (
        <div
          className="rounded-lg p-4 space-y-2"
          style={{ backgroundColor: C.greenLight }}
        >
          <p className="text-sm font-bold" style={{ color: C.green }}>
            ✅ Kamu sudah mencoba 3 kali!
          </p>
          <p className="text-sm text-slate-700">{ringkasanInsight}</p>
          <button
            type="button"
            onClick={handleResetSimulasi}
            className="rounded-full px-4 py-1.5 text-xs font-medium border mt-1"
            style={{ borderColor: C.green, color: C.green, backgroundColor: C.white }}
          >
            🔁 Reset Simulasi
          </button>
        </div>
      )}
    </div>
  );
}

// ── Data orang untuk simulasi ──
const ORANG_SOAL_A: OrangSimulasi[] = [
  { id: "L1", label: "L1" },
  { id: "L2", label: "L2" },
  { id: "L3", label: "L3" },
  { id: "L4", label: "L4" },
  { id: "L5", label: "L5" },
  { id: "L6", label: "L6" },
  { id: "P1", label: "P1" },
  { id: "P2", label: "P2" },
  { id: "P3", label: "P3" },
  { id: "P4", label: "P4" },
];

function cekSyaratSoalA(idDipilih: string[]): HasilCekSyarat {
  const jumlahP = idDipilih.filter((id) => id.startsWith("P")).length;
  const jumlahL = idDipilih.length - jumlahP;
  const memenuhi = jumlahP >= 2;
  return {
    memenuhi,
    rincian: `Perempuan terpilih: ${jumlahP} orang, Laki-laki terpilih: ${jumlahL} orang (syarat: minimal 2 perempuan).`,
  };
}

const ORANG_SOAL_B: OrangSimulasi[] = [
  { id: "rian", label: "Rian" },
  { id: "sinta", label: "Sinta" },
  { id: "budi", label: "Budi" },
  { id: "cici", label: "Cici" },
  { id: "dedi", label: "Dedi" },
  { id: "eka", label: "Eka" },
  { id: "fani", label: "Fani" },
  { id: "gita", label: "Gita" },
  { id: "hadi", label: "Hadi" },
];

function cekSyaratSoalB(idDipilih: string[]): HasilCekSyarat {
  const rianMasuk = idDipilih.includes("rian");
  const sintaMasuk = idDipilih.includes("sinta");
  const keduanyaMasuk = rianMasuk && sintaMasuk;
  return {
    memenuhi: !keduanyaMasuk,
    rincian: keduanyaMasuk
      ? "Rian dan Sinta sama-sama masuk dalam tim ini — ini melanggar syarat."
      : "Rian dan Sinta tidak berada bersama dalam tim ini — syarat terpenuhi.",
  };
}

// ── Sequential unlocking: question order ──
const QUESTION_KEYS = [
  "a_langkah0", "a_strategi1", "a_strategi2", "a_verifikasi",
  "b_strategi1", "b_strategi2", "b_verifikasi", "diskusi_pasangan",
];

// ═══════════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AktivitasKombinasi2() {
  // ── Toast ──
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({
    msg: "",
    visible: false,
  });
  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast({ msg: "", visible: false }), 2500);
  };

  // ── Feedback state ──
  const [feedbackMap, setFeedbackMap] = useState<Record<string, { text: string; isCorrect: boolean }>>({});

  // ── Saving ──
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // ── Sequential unlocking ──
  const [currentStep, setCurrentStep] = useState(0);
  const allComplete = currentStep >= QUESTION_KEYS.length;
  function getQuestionIndex(key: string): number {
    return QUESTION_KEYS.indexOf(key);
  }

  // ── Review mode (existing submissions) ──
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<Record<string, boolean>>({});
  const [loadingAnswer, setLoadingAnswer] = useState<Record<string, boolean>>({});
  const [prefilledKeys, setPrefilledKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/aktivitas-siswa?concept_id=kombinasi&activity_key=aktivitas_2");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.hasSubmissions && data.submissions) {
          const allCorrect = QUESTION_KEYS.every((key) => data.submissions[key]?.isCorrect === true);
          if (allCorrect) {
            setHasExistingSubmissions(true);
          } else {
            let firstUnanswered = QUESTION_KEYS.length;
            const preFilled: Record<string, { text: string; isCorrect: boolean }> = {};
            for (let i = 0; i < QUESTION_KEYS.length; i++) {
              const key = QUESTION_KEYS[i];
              const sub = data.submissions[key];
              if (sub) {
                preFilled[key] = {
                  text: `📝 Jawaban kamu:\n${sub.answer}\n\n💬 Feedback:\n${sub.feedback ?? "Jawaban sudah tersimpan."}`,
                  isCorrect: sub.isCorrect,
                };
                if (!sub.isCorrect && firstUnanswered > i) firstUnanswered = i;
              } else if (firstUnanswered > i) {
                firstUnanswered = i;
              }
            }
            if (Object.keys(preFilled).length > 0) {
              setFeedbackMap(preFilled);
              setPrefilledKeys(new Set(Object.keys(preFilled)));
            }
            setCurrentStep(firstUnanswered);
          }
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setIsLoadingExisting(false); }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: normalize numeric answer ──
  function normNum(s: string): string {
    return s.replace(/[\s,.]/g, "").replace(/^0+(?=\d)/, "");
  }

  // ── Flexible match: accepts expressions like "210-95=115" → extracts last number ──
  function flexMatch(raw: string, expected: string): boolean {
    if (normNum(raw) === expected) return true;
    // Extract last number from expression
    const lastNum = raw.replace(/\s/g, "").match(/(\d+)\s*$/);
    return lastNum !== null && normNum(lastNum[1]) === expected;
  }

  // ── Rule-based grading per question key ──
  function gradeByKey(key: string): { isCorrect: boolean; feedback: string } | null {
    const fbOk = (msg: string) => ({ isCorrect: true, feedback: msg });
    const fbNo = (msg: string) => ({ isCorrect: false, feedback: msg });

    switch (key) {
      // ── No. 2: Soal A — Strategi 1 ──
      case "a_strategi1": {
        const ok2p = flexMatch(s1_2p, "90");
        const ok3p = flexMatch(s1_3p, "24");
        const ok4p = flexMatch(s1_4p, "1");
        const okTotal = flexMatch(s1_total, "115");
        if (!s1_2p.trim() || !s1_3p.trim() || !s1_4p.trim() || !s1_total.trim()) return null; // belum diisi
        if (ok2p && ok3p && ok4p && okTotal) return fbOk("🎯 Tepat! C(4,2)×C(6,2)=90 + C(4,3)×C(6,1)=24 + C(4,4)×C(6,0)=1 → Total = 115.");
        let fb = "🤔 Ada yang perlu dicek:\n";
        if (!ok2p) fb += "• Tepat 2P: C(4,2) × C(6,2). Hitung masing-masing lalu kalikan.\n";
        if (!ok3p) fb += "• Tepat 3P: C(4,3) × C(6,1). Hitung masing-masing lalu kalikan.\n";
        if (!ok4p) fb += "• Tepat 4P: C(4,4) × C(6,0). Hitung masing-masing lalu kalikan.\n";
        if (!okTotal) fb += "• Total = jumlahkan ketiga subtotal di atas.\n";
        return fbNo(fb);
      }
      // ── No. 3: Soal A — Strategi 2 ──
      case "a_strategi2": {
        const okSemua = flexMatch(s2_totalSemua, "210");
        const ok0pCalc = /C\s*\(\s*4\s*,\s*0\s*\)\s*[×xX*·]\s*C\s*\(\s*6\s*,\s*4\s*\)/.test(s2_0p.replace(/\s/g, ""));
        const ok0p = flexMatch(s2_0pSub, "15");
        const ok1pCalc = /C\s*\(\s*4\s*,\s*1\s*\)\s*[×xX*·]\s*C\s*\(\s*6\s*,\s*3\s*\)/.test(s2_1p.replace(/\s/g, ""));
        const ok1p = flexMatch(s2_1pSub, "80");
        const okMelanggar = flexMatch(s2_totalMelanggar, "95");
        const okMemenuhi = flexMatch(s2_totalMemenuhi, "115");
        const allFilled = s2_totalSemua.trim() && s2_0p.trim() && s2_0pSub.trim() && s2_1p.trim() && s2_1pSub.trim() && s2_totalMelanggar.trim() && s2_totalMemenuhi.trim();
        if (!allFilled) return null;
        if (okSemua && ok0p && ok1p && okMelanggar && okMemenuhi)
          return fbOk("🎯 Tepat! C(10,4)=210. Pelanggar: 0P=15 + 1P=80 = 95. Memenuhi = 210−95 = 115. Hasil sama dengan Strategi 1!");
        let fb = "🤔 Ada yang perlu dicek:\n";
        if (!okSemua) fb += "• Total semua tanpa syarat: C(10,4). Hitung dengan teliti.\n";
        if (!ok0pCalc || !ok0p) fb += "• 0P: pilih 0 dari 4 perempuan DAN 4 dari 6 laki-laki → C(4,0) × C(6,4).\n";
        if (!ok1pCalc || !ok1p) fb += "• 1P: pilih 1 dari 4 perempuan DAN 3 dari 6 laki-laki → C(4,1) × C(6,3).\n";
        if (!okMelanggar) fb += "• Total melanggar = subtotal 0P + subtotal 1P.\n";
        if (!okMemenuhi) fb += "• Memenuhi = Total semua − Total melanggar.\n";
        return fbNo(fb);
      }
      // ── No. 5: Soal B — Strategi 1 ──
      case "b_strategi1": {
        const okRian = flexMatch(b1_rian, "21");
        const okSinta = flexMatch(b1_sinta, "21");
        const okKeduanya = flexMatch(b1_keduanya, "35");
        const okTotal = flexMatch(b1_total, "77");
        if (!b1_rian.trim() || !b1_sinta.trim() || !b1_keduanya.trim() || !b1_total.trim()) return null;
        if (okRian && okSinta && okKeduanya && okTotal) return fbOk("🎯 Tepat! C(7,2)=21 + C(7,2)=21 + C(7,3)=35 → Total = 77.");
        let fb = "🤔 Ada yang perlu dicek:\n";
        if (!okRian) fb += "• Rian masuk, Sinta tidak: pilih 2 dari 7 sisa → C(7,2).\n";
        if (!okSinta) fb += "• Sinta masuk, Rian tidak: pilih 2 dari 7 sisa → C(7,2).\n";
        if (!okKeduanya) fb += "• Keduanya tidak: pilih 3 dari 7 sisa → C(7,3).\n";
        if (!okTotal) fb += "• Total = jumlahkan ketiga subtotal.\n";
        return fbNo(fb);
      }
      // ── No. 6: Soal B — Strategi 2 ──
      case "b_strategi2": {
        const okSemua = flexMatch(b2_totalSemua, "84");
        const okMelanggar = /C\s*\(\s*7\s*,\s*1\s*\)\s*=\s*7|7/.test(b2_melanggarCalc.replace(/\s/g, ""));
        const okMemenuhi = flexMatch(b2_totalMemenuhi, "77");
        if (!b2_totalSemua.trim() || !b2_melanggarCalc.trim() || !b2_totalMemenuhi.trim()) return null;
        if (okSemua && okMelanggar && okMemenuhi) return fbOk("🎯 Tepat! C(9,3)=84. Pelanggar: C(7,1)=7. Memenuhi = 84−7 = 77. Hasil sama dengan Strategi 1!");
        let fb = "🤔 Ada yang perlu dicek:\n";
        if (!okSemua) fb += "• Total semua tanpa syarat: C(9,3). Hitung dengan teliti.\n";
        if (!okMelanggar) fb += "• Rian & Sinta pasti masuk → pilih 1 dari 7 sisa → C(7,1).\n";
        if (!okMemenuhi) fb += "• Memenuhi = Total semua − Melanggar.\n";
        return fbNo(fb);
      }
      // ── No. 7: Soal B — Verifikasi ──
      case "b_verifikasi": {
        if (soalB_verifikasi === "" || soalB_cepat === "") return null;
        const okVerif = soalB_verifikasi === "ya";
        const okCepat = soalB_cepat === "strategi2";
        if (okVerif && okCepat) return fbOk("🎯 Tepat! Hasilnya sama. Untuk soal 'tidak boleh bersama', strategi Komplemen biasanya lebih cepat karena hanya perlu menghitung satu kasus pelanggaran.");
        let fb = "🤔 Belum tepat:\n";
        if (!okVerif) fb += "• Hasil Strategi 1 dan Strategi 2 seharusnya sama. Coba hitung ulang keduanya.\n";
        if (!okCepat) fb += "• Untuk 'tidak boleh bersama', pikirkan: berapa kasus pelanggaran yang perlu dihitung? Strategi mana yang paling sedikit langkahnya?\n";
        return fbNo(fb);
      }
      // ── No. 8: Diskusi Pasangan ──
      case "diskusi_pasangan": {
        if (panduan1 === "" || panduan2 === "" || panduan3 === "") return null;
        const ok1 = panduan1 === "strategi2";
        const ok2 = panduan2 === "strategi2";
        const ok3 = panduan3 === "strategi2";
        if (ok1 && ok2 && ok3) return fbOk("🎯 Tepat! Secara umum: kalau pengecualian lebih sedikit, gunakan Komplemen. Kalau kasusnya sedikit dan jelas, Kasus per Kasus bisa lebih mudah.");
        let fb = "🤔 Panduan memilih strategi:\n";
        if (!ok1) fb += "• Syarat 'minimal' → banyak sub-kasus → strategi mana yang menghindari banyak sub-kasus?\n";
        if (!ok2) fb += "• Syarat 'tidak boleh bersama' → cukup 1 kasus pelanggaran → strategi mana yang lebih sedikit langkahnya?\n";
        if (!ok3) fb += "• Pengecualian lebih sedikit dari yang diminta → strategi mana yang lebih praktis?\n";
        return fbNo(fb);
      }
      default:
        return null;
    }
  }

  // ── Build jawaban text for DB saving ──
  function buildJawaban(key: string): string {
    switch (key) {
      case "a_strategi1": return `2P:${s1_2p} 3P:${s1_3p} 4P:${s1_4p} Total:${s1_total}`;
      case "a_strategi2": return `C(10,4):${s2_totalSemua} 0P:${s2_0p}=${s2_0pSub} 1P:${s2_1p}=${s2_1pSub} Melanggar:${s2_totalMelanggar} Memenuhi:${s2_totalMemenuhi}`;
      case "b_strategi1": return `Rian:${b1_rian} Sinta:${b1_sinta} Keduanya:${b1_keduanya} Total:${b1_total}`;
      case "b_strategi2": return `C(9,3):${b2_totalSemua} Melanggar:${b2_melanggarCalc}=${b2_melanggarVal} Memenuhi:${b2_totalMemenuhi}`;
      case "b_verifikasi": return `Sama:${soalB_verifikasi} Cepat:${soalB_cepat}`;
      case "diskusi_pasangan": return `Panduan1:${panduan1} Panduan2:${panduan2} Panduan3:${panduan3}`;
      default: return "";
    }
  }

  // ── Handle save ──
  const handleSave = async (key: string) => {
    setSaving((p) => ({ ...p, [key]: true }));

    try {
      // No. 1 & No. 4 → AI
      if (key === "a_langkah0" || key === "a_verifikasi") {
        await new Promise((r) => setTimeout(r, 800));
        let soalText = "";
        let jawaban = "";
        if (key === "a_langkah0") {
          soalText = "Dari 6 siswa laki-laki dan 4 siswa perempuan, akan dipilih 4 orang panitia dengan minimal 2 perempuan. Mengapa soal ini tidak bisa langsung dihitung dengan C(10,4)?";
          jawaban = soalA_langkah0;
        } else {
          soalText = "Soal A Verifikasi: Apakah kedua strategi menghasilkan jawaban yang sama? Strategi mana yang lebih efisien? Mengapa?";
          jawaban = `Verifikasi: ${soalA_verifikasi}\nStrategi efisien: ${soalA_efisien}\nAlasan: ${soalA_alasan}`;
        }
        if (!jawaban.trim()) {
          setFeedbackMap((p) => ({ ...p, [key]: { text: "⚠️ Isi jawabanmu dulu ya sebelum menyimpan!", isCorrect: false } }));
        } else {
          try {
            const res = await fetch("/api/aktivitas-siswa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                concept_id: "kombinasi",
                activity_key: "aktivitas_2",
                entry_type: "refleksi",
                question_key: key,
                soal: soalText,
                jawaban,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const isCorrect = data.isCorrect ?? true;
              setFeedbackMap((p) => ({ ...p, [key]: { text: data.feedback ?? "💬 Jawaban sudah tersimpan.", isCorrect } }));
              showToast("Jawaban tersimpan! ✅");
              if (isCorrect) {
                const idx = getQuestionIndex(key);
                if (idx >= 0) setCurrentStep((prev) => Math.max(prev, idx + 1));
              }
            } else {
              setFeedbackMap((p) => ({ ...p, [key]: { text: "⚠️ Gagal menyimpan. Coba lagi nanti.", isCorrect: false } }));
            }
          } catch {
            setFeedbackMap((p) => ({ ...p, [key]: { text: "💬 Jawabanmu sudah tercatat. Feedback AI akan muncul setelah guru memeriksa.", isCorrect: true } }));
            showToast("Jawaban tersimpan! ✅");
            const idx = getQuestionIndex(key);
            if (idx >= 0) setCurrentStep((prev) => Math.max(prev, idx + 1));
          }
        }
      } else {
        // No. 2,3,5,6,7,8 → Rule-based
        const result = gradeByKey(key);
        await new Promise((r) => setTimeout(r, 500));
        if (result === null) {
          setFeedbackMap((p) => ({ ...p, [key]: { text: "⚠️ Lengkapi semua isian dulu ya sebelum menyimpan!", isCorrect: false } }));
        } else {
          // Save to DB
          const soalText = `Kombinasi Aktivitas 2 — ${key}`;
          const jawaban = buildJawaban(key);
          fetch("/api/aktivitas-siswa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              concept_id: "kombinasi",
              activity_key: "aktivitas_2",
              entry_type: "soal",
              question_key: key,
              soal: soalText,
              jawaban,
              rule_based: { isCorrect: result.isCorrect, feedback: result.feedback },
            }),
          }).catch(() => {/* silent */});

          setFeedbackMap((p) => ({ ...p, [key]: { text: result.feedback, isCorrect: result.isCorrect } }));
          if (result.isCorrect) {
            showToast("Jawaban benar! ✅");
            const idx = getQuestionIndex(key);
            if (idx >= 0) setCurrentStep((prev) => Math.max(prev, idx + 1));
          }
        }
      }
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  };

  // ── Apply stored answer back into form state ──────────────────
  function applyAnswerToState(key: string, rawAnswer: string) {
    const parts = rawAnswer.split(" ");
    if (key === "a_langkah0") setSoalA_langkah0(rawAnswer);
    else if (key === "a_strategi1") {
      const m2p = rawAnswer.match(/2P:(\S+)/); if (m2p) setS1_2p(m2p[1]);
      const m3p = rawAnswer.match(/3P:(\S+)/); if (m3p) setS1_3p(m3p[1]);
      const m4p = rawAnswer.match(/4P:(\S+)/); if (m4p) setS1_4p(m4p[1]);
      const mt = rawAnswer.match(/Total:(\S+)/); if (mt) setS1_total(mt[1]);
    } else if (key === "a_strategi2") {
      const mC = rawAnswer.match(/C\(10,4\):(\S+)/); if (mC) setS2_totalSemua(mC[1]);
      const m0 = rawAnswer.match(/0P:(\S+)=(\S+)/); if (m0) { setS2_0p(m0[1]); setS2_0pSub(m0[2]); }
      const m1 = rawAnswer.match(/1P:(\S+)=(\S+)/); if (m1) { setS2_1p(m1[1]); setS2_1pSub(m1[2]); }
      const mM = rawAnswer.match(/Melanggar:(\S+)/); if (mM) setS2_totalMelanggar(mM[1]);
      const mMe = rawAnswer.match(/Memenuhi:(\S+)/); if (mMe) setS2_totalMemenuhi(mMe[1]);
    } else if (key === "a_verifikasi") {
      const mV = rawAnswer.match(/Verifikasi:\s*(\S+)/); if (mV) setSoalA_verifikasi(mV[1] as YaTidak);
      const mE = rawAnswer.match(/Strategi efisien:\s*(\S+)/); if (mE) setSoalA_efisien(mE[1] as StrategiPilihan);
      const mA = rawAnswer.match(/Alasan:\s*([\s\S]+)/); if (mA) setSoalA_alasan(mA[1].trim());
    } else if (key === "b_strategi1") {
      const mR = rawAnswer.match(/Rian:(\S+)/); if (mR) setB1_rian(mR[1]);
      const mS = rawAnswer.match(/Sinta:(\S+)/); if (mS) setB1_sinta(mS[1]);
      const mK = rawAnswer.match(/Keduanya:(\S+)/); if (mK) setB1_keduanya(mK[1]);
      const mT = rawAnswer.match(/Total:(\S+)/); if (mT) setB1_total(mT[1]);
    } else if (key === "b_strategi2") {
      const mC = rawAnswer.match(/C\(9,3\):(\S+)/); if (mC) setB2_totalSemua(mC[1]);
      const mM = rawAnswer.match(/Melanggar:(\S+)=(\S+)/); if (mM) { setB2_melanggarCalc(mM[1]); setB2_melanggarVal(mM[2]); }
      const mMe = rawAnswer.match(/Memenuhi:(\S+)/); if (mMe) setB2_totalMemenuhi(mMe[1]);
    } else if (key === "b_verifikasi") {
      const mS = rawAnswer.match(/Sama:(\S+)/); if (mS) setSoalB_verifikasi(mS[1] as YaTidak);
      const mC = rawAnswer.match(/Cepat:(\S+)/); if (mC) setSoalB_cepat(mC[1] as StrategiPilihan);
    } else if (key === "diskusi_pasangan") {
      const m1 = rawAnswer.match(/Panduan1:(\S+)/); if (m1) setPanduan1(m1[1] as StrategiPilihan);
      const m2 = rawAnswer.match(/Panduan2:(\S+)/); if (m2) setPanduan2(m2[1] as StrategiPilihan);
      const m3 = rawAnswer.match(/Panduan3:(\S+)/); if (m3) setPanduan3(m3[1] as StrategiPilihan);
    }
  }

  // ── Reveal answer for review mode ──────────────────────────────
  const handleRevealAnswer = useCallback(async (key: string) => {
    if (revealedSteps[key]) return;
    setLoadingAnswer((p) => ({ ...p, [key]: true }));
    try {
      const res = await fetch(
        `/api/aktivitas-siswa?concept_id=kombinasi&activity_key=aktivitas_2&question_key=${encodeURIComponent(key)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.submission) {
        applyAnswerToState(key, data.submission.answer);
        setFeedbackMap((p) => ({
          ...p,
          [key]: {
            text: `📝 Jawaban kamu:\n${data.submission.answer}\n\n💬 Feedback:\n${data.submission.feedback ?? "Jawaban sudah tersimpan."}`,
            isCorrect: data.submission.isCorrect,
          },
        }));
        setRevealedSteps((p) => ({ ...p, [key]: true }));
      }
    } catch { /* silent */ }
    finally { setLoadingAnswer((p) => ({ ...p, [key]: false })); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedSteps]);

  // ── Question labels for review mode ────────────────────────────
  const QUESTION_LABELS: Record<string, string> = {
    a_langkah0: "Soal A — Langkah 0 (Sebelum menghitung)",
    a_strategi1: "Soal A — Strategi 1 (Kasus per Kasus)",
    a_strategi2: "Soal A — Strategi 2 (Komplemen)",
    a_verifikasi: "Soal A — Verifikasi & Efisiensi",
    b_strategi1: "Soal B — Strategi 1 (Kasus per Kasus)",
    b_strategi2: "Soal B — Strategi 2 (Komplemen)",
    b_verifikasi: "Soal B — Verifikasi & Efisiensi",
    diskusi_pasangan: "Diskusi Pasangan — Panduan Memilih Strategi",
  };

  // ── Question full text for review mode ─────────────────────────
  const QUESTION_SOAL: Record<string, string> = {
    a_langkah0: "Dari 6 siswa laki-laki dan 4 siswa perempuan, akan dipilih 4 orang anggota panitia yang terdiri dari minimal 2 perempuan. Mengapa soal ini tidak bisa langsung dihitung dengan C(10,4)?",
    a_strategi1: "Lengkapi tabel Kasus per Kasus: Tepat 2P, Tepat 3P, Tepat 4P — hitung masing-masing dan jumlahkan.",
    a_strategi2: "Lengkapi perhitungan Komplemen: total semua C(10,4), total melanggar (0P + 1P), lalu total memenuhi = total semua − total melanggar.",
    a_verifikasi: "Apakah kedua strategi menghasilkan jawaban yang sama? Strategi mana yang lebih efisien? Mengapa?",
    b_strategi1: "Dari 9 anggota, pilih tim 3 orang. Rian dan Sinta tidak boleh bersama. Hitung dengan Kasus per Kasus.",
    b_strategi2: "Soal B dengan strategi Komplemen: total semua C(9,3), total melanggar (Rian & Sinta masuk), total memenuhi.",
    b_verifikasi: "Apakah hasil Strategi 1 dan 2 sama? Untuk soal seperti ini, strategi mana yang lebih cepat?",
    diskusi_pasangan: "Berdasarkan pengalaman Soal A dan B, lengkapi panduan memilih strategi: kapan gunakan Kasus per Kasus, kapan gunakan Komplemen?",
  };

  // ── Simulasi (fitur baru) ──
  const [simulasiA, setSimulasiA] = useState<SimulasiState>(makeSimulasiState());
  const [simulasiB, setSimulasiB] = useState<SimulasiState>(makeSimulasiState());

  // ═══════════════════════════════════════════════
  // SOAL A
  // ═══════════════════════════════════════════════
  const [soalA_langkah0, setSoalA_langkah0] = useState("");
  // Strategi 1
  const [s1_2p, setS1_2p] = useState(""); // tepat 2P subtotal
  const [s1_3p, setS1_3p] = useState(""); // tepat 3P subtotal
  const [s1_4p, setS1_4p] = useState(""); // tepat 4P subtotal
  const [s1_total, setS1_total] = useState("");
  // Strategi 2
  const [s2_totalSemua, setS2_totalSemua] = useState(""); // C(10,4)
  const [s2_0p, setS2_0p] = useState(""); // 0 perempuan calc
  const [s2_0pSub, setS2_0pSub] = useState(""); // 0 perempuan subtotal
  const [s2_1p, setS2_1p] = useState(""); // 1 perempuan calc
  const [s2_1pSub, setS2_1pSub] = useState(""); // 1 perempuan subtotal
  const [s2_totalMelanggar, setS2_totalMelanggar] = useState("");
  const [s2_totalMemenuhi, setS2_totalMemenuhi] = useState("");
  // Verifikasi & efisiensi
  const [soalA_verifikasi, setSoalA_verifikasi] = useState<YaTidak>("");
  const [soalA_efisien, setSoalA_efisien] = useState<StrategiPilihan>("");
  const [soalA_alasan, setSoalA_alasan] = useState("");

  // ═══════════════════════════════════════════════
  // SOAL B
  // ═══════════════════════════════════════════════
  // Strategi 1
  const [b1_rian, setB1_rian] = useState(""); // Rian masuk, Sinta tidak
  const [b1_sinta, setB1_sinta] = useState(""); // Sinta masuk, Rian tidak
  const [b1_keduanya, setB1_keduanya] = useState(""); // Keduanya tidak
  const [b1_total, setB1_total] = useState("");
  // Strategi 2
  const [b2_totalSemua, setB2_totalSemua] = useState(""); // C(9,3)
  const [b2_melanggarCalc, setB2_melanggarCalc] = useState(""); // C(_,_)×C(_,_)
  const [b2_melanggarVal, setB2_melanggarVal] = useState(""); // hasil
  const [b2_totalMemenuhi, setB2_totalMemenuhi] = useState("");
  // Verifikasi & efisiensi
  const [soalB_verifikasi, setSoalB_verifikasi] = useState<YaTidak>("");
  const [soalB_cepat, setSoalB_cepat] = useState<StrategiPilihan>("");

  // ═══════════════════════════════════════════════
  // DISKUSI PASANGAN — Panduan Memilih Strategi
  // ═══════════════════════════════════════════════
  const [panduan1, setPanduan1] = useState<StrategiPilihan>("");
  const [panduan2, setPanduan2] = useState<StrategiPilihan>("");
  const [panduan3, setPanduan3] = useState<StrategiPilihan>("");

  // ── Feedback display: "Lihat jawabanku" for resumed, normal for fresh ──
  function FeedbackOrReveal({ qKey, fb }: { qKey: string; fb: { text: string; isCorrect: boolean } }) {
    if (prefilledKeys.has(qKey) && !revealedSteps[qKey]) {
      return (
        <div className="flex justify-end mt-3">
          <button type="button" onClick={() => setRevealedSteps(p => ({ ...p, [qKey]: true }))}
            className="rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: C.green }}>
            💬 Lihat jawabanku
          </button>
        </div>
      );
    }
    return <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: C.white }}>
      <div className="max-w-[800px] mx-auto">
        {/* ── Back link ── */}
        <Link
          href="/siswa/activity/kombinasi"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline"
          style={{ color: C.green }}
        >
          ← Kembali ke daftar aktivitas
        </Link>

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: C.greenLight, color: C.green }}
            >
              <IconUserPair />
              PASANGAN
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: C.green, color: C.white }}
            >
              <IconClock />
              25 menit
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: C.purple }}>
            Aktivitas 2 — “Kasus Per Kasus vs Komplemen — Pilih Strategimu!”
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Pilar:</span>
            {[
              { label: "Joyful", color: "#C9962B" },
              { label: "Mindful", color: "#2A5A8C" },
            ].map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: p.color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── LOADING ── */}
        {isLoadingExisting && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
            <span className="ml-3 text-sm text-slate-500">Memuat aktivitas...</span>
          </div>
        )}

        {/* ── REVIEW MODE ── */}
        {!isLoadingExisting && hasExistingSubmissions && (
          <>
            <div className="rounded-xl p-4 text-center mb-6" style={{ backgroundColor: C.greenLight }}>
              <p className="font-bold text-base" style={{ color: C.green }}>✅ Kamu sudah menyelesaikan aktivitas ini!</p>
              <p className="text-sm text-slate-600 mt-1">Klik &ldquo;Lihat jawabanku&rdquo; di setiap nomor untuk melihat jawaban dan feedback.</p>
            </div>
            <div className="space-y-6">
              {QUESTION_KEYS.map((key, idx) => {
                const isRevealed = revealedSteps[key] === true;
                const isLoading = loadingAnswer[key] === true;
                const fb = feedbackMap[key];
                const soalText = QUESTION_SOAL[key] ?? "";
                return (
                  <div key={key}>
                    {/* ── Collapsed header ── */}
                    <div className="rounded-xl border p-4" style={{ borderColor: isRevealed ? C.green : C.border, background: isRevealed ? C.white : C.bg }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                            style={{ backgroundColor: isRevealed ? C.green : C.purple }}>
                            {isRevealed ? "✓" : idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: C.purple }}>{QUESTION_LABELS[key] ?? key}</p>
                            {soalText && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{soalText}</p>
                            )}
                          </div>
                        </div>
                        {!isRevealed && (
                          <button
                            type="button"
                            onClick={() => handleRevealAnswer(key)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0"
                            style={{ backgroundColor: C.green }}
                          >
                            {isLoading ? <><Spinner /> Memuat...</> : "Lihat jawabanku"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Expanded: full question + answer + feedback ── */}
                    {isRevealed && (
                      <div className="mt-4 space-y-4">
                        {/* ── a_langkah0 ── */}
                        {key === "a_langkah0" && (
                          <>
                            <SoalBadge n={1} label="Soal A — Langkah 0 (Sebelum menghitung)" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800">
                                Mengapa soal ini tidak bisa langsung dihitung dengan C(10,4)?
                              </p>
                              <TextArea value={soalA_langkah0} onChange={setSoalA_langkah0} rows={3} readOnly />
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── a_strategi1 ── */}
                        {key === "a_strategi1" && (
                          <>
                            <SoalBadge n={2} label="Soal A — Strategi 1 (Kasus per Kasus)" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-700">Lengkapi tabel berikut:</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="border-b" style={{ borderColor: C.border }}>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kasus</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perempuan</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Laki-laki</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perhitungan</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2 px-2">Tepat 2P</td>
                                      <td className="py-2 px-2">2 dari 4</td>
                                      <td className="py-2 px-2">2 dari 6</td>
                                      <td className="py-2 px-2 text-xs text-slate-500">C(4,2)×C(6,2)</td>
                                      <td className="py-2 px-2"><TextInput value={s1_2p} onChange={setS1_2p} readOnly /></td>
                                    </tr>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2 px-2">Tepat 3P</td>
                                      <td className="py-2 px-2">3 dari 4</td>
                                      <td className="py-2 px-2">1 dari 6</td>
                                      <td className="py-2 px-2 text-xs text-slate-500">C(4,3)×C(6,1)</td>
                                      <td className="py-2 px-2"><TextInput value={s1_3p} onChange={setS1_3p} readOnly /></td>
                                    </tr>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2 px-2">Tepat 4P</td>
                                      <td className="py-2 px-2">4 dari 4</td>
                                      <td className="py-2 px-2">0 dari 6</td>
                                      <td className="py-2 px-2 text-xs text-slate-500">C(4,4)×C(6,0)</td>
                                      <td className="py-2 px-2"><TextInput value={s1_4p} onChange={setS1_4p} readOnly /></td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-2 font-bold text-slate-700" colSpan={4}>Total</td>
                                      <td className="py-2 px-2"><TextInput value={s1_total} onChange={setS1_total} readOnly /></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── a_strategi2 ── */}
                        {key === "a_strategi2" && (
                          <>
                            <SoalBadge n={3} label="Soal A — Strategi 2 (Komplemen)" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-700 mb-3">Lengkapi perhitungan berikut:</p>
                              <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: "#f1f5f9" }}>
                                <p className="text-sm text-slate-700">Total semua panitia tanpa syarat = C(10,4) =</p>
                                <TextInput value={s2_totalSemua} onChange={setS2_totalSemua} readOnly />
                              </div>
                              <p className="text-sm font-medium text-slate-700 mb-2">Panitia yang <strong>melanggar syarat</strong> (kurang dari 2 perempuan):</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="border-b" style={{ borderColor: C.border }}>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kasus</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perhitungan</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2 px-2">0 perempuan</td>
                                      <td className="py-2 px-2"><TextInput value={s2_0p} onChange={setS2_0p} readOnly /></td>
                                      <td className="py-2 px-2"><TextInput value={s2_0pSub} onChange={setS2_0pSub} readOnly /></td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-2">1 perempuan</td>
                                      <td className="py-2 px-2"><TextInput value={s2_1p} onChange={setS2_1p} readOnly /></td>
                                      <td className="py-2 px-2"><TextInput value={s2_1pSub} onChange={setS2_1pSub} readOnly /></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className="space-y-2 mt-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-700">Total yang melanggar =</span>
                                  <div className="w-32"><TextInput value={s2_totalMelanggar} onChange={setS2_totalMelanggar} readOnly /></div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm text-slate-700">Total memenuhi syarat = C(10,4) − Total melanggar =</span>
                                  <div className="w-32"><TextInput value={s2_totalMemenuhi} onChange={setS2_totalMemenuhi} readOnly /></div>
                                </div>
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── a_verifikasi ── */}
                        {key === "a_verifikasi" && (
                          <>
                            <SoalBadge n={4} label="Soal A — Verifikasi & Efisiensi" />
                            <PertanyaanCard readOnly>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium text-slate-700 mb-2">Apakah kedua strategi menghasilkan jawaban yang sama?</p>
                                  <YaTidakRadio name="a_verifikasi_review" value={soalA_verifikasi} onChange={setSoalA_verifikasi} readOnly />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700 mb-2">Strategi mana yang lebih efisien?</p>
                                  <StrategiSelect value={soalA_efisien} onChange={setSoalA_efisien} readOnly />
                                </div>
                                <TextArea label="Mengapa?" value={soalA_alasan} onChange={setSoalA_alasan} rows={3} readOnly />
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── b_strategi1 ── */}
                        {key === "b_strategi1" && (
                          <>
                            <SoalBadge n={5} label="Soal B — Strategi 1 (Kasus per Kasus)" />
                            <PertanyaanCard readOnly>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="border-b" style={{ borderColor: C.border }}>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kasus</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kondisi</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perhitungan</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2 px-2">Rian masuk, Sinta tidak</td>
                                      <td className="py-2 px-2">Pilih 2 dari 7 sisa</td>
                                      <td className="py-2 px-2 text-xs text-slate-500">C(7,2)</td>
                                      <td className="py-2 px-2"><TextInput value={b1_rian} onChange={setB1_rian} readOnly /></td>
                                    </tr>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2 px-2">Sinta masuk, Rian tidak</td>
                                      <td className="py-2 px-2">Pilih 2 dari 7 sisa</td>
                                      <td className="py-2 px-2 text-xs text-slate-500">C(7,2)</td>
                                      <td className="py-2 px-2"><TextInput value={b1_sinta} onChange={setB1_sinta} readOnly /></td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-2">Keduanya tidak masuk</td>
                                      <td className="py-2 px-2">Pilih 3 dari 7 sisa</td>
                                      <td className="py-2 px-2 text-xs text-slate-500">C(7,3)</td>
                                      <td className="py-2 px-2"><TextInput value={b1_keduanya} onChange={setB1_keduanya} readOnly /></td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-2 font-bold text-slate-700" colSpan={3}>Total</td>
                                      <td className="py-2 px-2"><TextInput value={b1_total} onChange={setB1_total} readOnly /></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── b_strategi2 ── */}
                        {key === "b_strategi2" && (
                          <>
                            <SoalBadge n={6} label="Soal B — Strategi 2 (Komplemen)" />
                            <PertanyaanCard readOnly>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-700">Total tim tanpa syarat = C(9,3) =</span>
                                  <div className="w-24"><TextInput value={b2_totalSemua} onChange={setB2_totalSemua} readOnly /></div>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">Tim yang melanggar (Rian dan Sinta keduanya masuk):</p>
                                  <TextInput value={b2_melanggarCalc} onChange={setB2_melanggarCalc} readOnly />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-700">Total memenuhi =</span>
                                  <div className="w-24"><TextInput value={b2_totalMemenuhi} onChange={setB2_totalMemenuhi} readOnly /></div>
                                </div>
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── b_verifikasi ── */}
                        {key === "b_verifikasi" && (
                          <>
                            <SoalBadge n={7} label="Soal B — Verifikasi & Efisiensi" />
                            <PertanyaanCard readOnly>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium text-slate-700 mb-2">Apakah hasilnya sama?</p>
                                  <YaTidakRadio name="b_verifikasi_review" value={soalB_verifikasi} onChange={setSoalB_verifikasi} readOnly />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700 mb-2">Untuk soal seperti ini (ada dua orang yang tidak boleh bersama), strategi mana yang lebih cepat?</p>
                                  <StrategiSelect value={soalB_cepat} onChange={setSoalB_cepat} readOnly />
                                </div>
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── diskusi_pasangan ── */}
                        {key === "diskusi_pasangan" && (
                          <>
                            <SoalBadge n={8} label="Diskusi Pasangan" />
                            <PertanyaanCard readOnly>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="border-b" style={{ borderColor: C.border }}>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kondisi Soal</th>
                                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Strategi yang Lebih Efisien</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2.5 px-2 text-slate-700">Syarat &quot;minimal&quot; atau &quot;paling sedikit&quot; dan kasusnya banyak</td>
                                      <td className="py-2.5 px-2"><StrategiSelect value={panduan1} onChange={setPanduan1} readOnly /></td>
                                    </tr>
                                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                                      <td className="py-2.5 px-2 text-slate-700">Syarat &quot;tidak boleh bersama&quot; atau &quot;pengecualian sederhana&quot;</td>
                                      <td className="py-2.5 px-2"><StrategiSelect value={panduan2} onChange={setPanduan2} readOnly /></td>
                                    </tr>
                                    <tr>
                                      <td className="py-2.5 px-2 text-slate-700">Syarat yang pengecualiannya lebih sedikit dari yang diminta</td>
                                      <td className="py-2.5 px-2"><StrategiSelect value={panduan3} onChange={setPanduan3} readOnly /></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Feedback ── */}
                        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── FRESH MODE ── */}
        {!isLoadingExisting && !hasExistingSubmissions && (
        <>
        {/* ── Outer border ── */}
        <div
          className="rounded-2xl border-2 p-6 md:p-8 space-y-10"
          style={{ borderColor: C.greenLight }}
        >
          {/* Petunjuk */}
          <SectionHeader
            icon="🧭"
            title="Petunjuk"
            subtitle="Setiap soal di bawah ini bisa diselesaikan dengan dua strategi berbeda. Bersama pasanganmu: (1) Identifikasi kedua strategi, (2) Selesaikan dengan keduanya, (3) Verifikasi bahwa hasilnya sama, (4) Tentukan mana yang lebih efisien."
          />

          {/* ═══════════════════════════════════════════════
              SOAL A
              ═══════════════════════════════════════════════ */}
          <SectionHeader
            icon="📝"
            title="Soal A"
            subtitle="Dari 6 siswa laki-laki dan 4 siswa perempuan, akan dipilih 4 orang anggota panitia yang terdiri dari minimal 2 perempuan."
          />

          {/* Langkah 0 */}
          {currentStep >= 0 && (
          <div>
            <SoalBadge n={1} label="Soal A — Langkah 0 (Sebelum menghitung)" />
            <PertanyaanCard>
              {/* Simulasi (fitur baru) — sebelum siswa menjawab */}
              <SimulasiSyarat
                orangPilihan={ORANG_SOAL_A}
                jumlahSlot={4}
                cekSyarat={cekSyaratSoalA}
                ringkasanInsight="Dari 3 percobaan, kamu menemukan bahwa tidak semua susunan 4 orang otomatis memenuhi syarat minimal 2 perempuan — itu sebabnya soal ini tidak bisa langsung dihitung dengan C(10,4), dan butuh strategi khusus."
                state={simulasiA}
                onChange={setSimulasiA}
              />

              <p className="text-sm font-medium text-slate-800">
                Mengapa soal ini tidak bisa langsung dihitung dengan C(10,4)?
              </p>
              <TextArea
                value={soalA_langkah0}
                onChange={setSoalA_langkah0}
                placeholder="Tulis alasanmu..."
                rows={3}
              />
              {feedbackMap["a_langkah0"] && (
                <FeedbackOrReveal qKey="a_langkah0" fb={feedbackMap["a_langkah0"]} />
              )}
              <SaveButton
                onClick={() => handleSave("a_langkah0")}
                isSaving={saving["a_langkah0"] ?? false}
                isCorrect={feedbackMap["a_langkah0"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* Strategi 1 */}
          {currentStep >= 1 && (
          <div>
            <SoalBadge n={2} label="Soal A — Strategi 1 (Kasus per Kasus)" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-700">
                Lengkapi tabel berikut:
              </p>
              <p className="text-[11px] text-slate-400 italic mb-2">💡 Kolom "Subtotal" dan "Total": cukup masukkan jawaban akhirnya saja.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: C.border }}
                    >
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kasus</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perempuan</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Laki-laki</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perhitungan</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2 px-2">Tepat 2P</td>
                      <td className="py-2 px-2">2 dari 4</td>
                      <td className="py-2 px-2">2 dari 6</td>
                      <td className="py-2 px-2 text-xs text-slate-500">C(4,2)×C(6,2)</td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s1_2p}
                          onChange={setS1_2p}
                          placeholder="Subtotal..."
                        />
                      </td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2 px-2">Tepat 3P</td>
                      <td className="py-2 px-2">3 dari 4</td>
                      <td className="py-2 px-2">1 dari 6</td>
                      <td className="py-2 px-2 text-xs text-slate-500">C(4,3)×C(6,1)</td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s1_3p}
                          onChange={setS1_3p}
                          placeholder="Subtotal..."
                        />
                      </td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2 px-2">Tepat 4P</td>
                      <td className="py-2 px-2">4 dari 4</td>
                      <td className="py-2 px-2">0 dari 6</td>
                      <td className="py-2 px-2 text-xs text-slate-500">C(4,4)×C(6,0)</td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s1_4p}
                          onChange={setS1_4p}
                          placeholder="Subtotal..."
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="py-2 px-2 font-bold text-slate-700"
                        colSpan={4}
                      >
                        Total
                      </td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s1_total}
                          onChange={setS1_total}
                          placeholder="Total..."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {feedbackMap["a_strategi1"] && (
                <FeedbackOrReveal qKey="a_strategi1" fb={feedbackMap["a_strategi1"]} />
              )}
              <SaveButton
                onClick={() => handleSave("a_strategi1")}
                isSaving={saving["a_strategi1"] ?? false}
                isCorrect={feedbackMap["a_strategi1"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* Strategi 2 */}
          {currentStep >= 2 && (
          <div>
            <SoalBadge n={3} label="Soal A — Strategi 2 (Komplemen)" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-700 mb-3">
                Lengkapi perhitungan berikut:
              </p>

              <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: "#f1f5f9" }}>
                <p className="text-sm text-slate-700">
                  Total semua panitia tanpa syarat = C(10,4) =
                </p>
                <TextInput
                  value={s2_totalSemua}
                  onChange={setS2_totalSemua}
                  placeholder="Hasil C(10,4)..."
                />
                <p className="text-[11px] text-slate-400 italic mt-1">💡 Cukup masukkan jawaban akhirnya saja.</p>
              </div>

              <p className="text-sm font-medium text-slate-700 mb-2">
                Panitia yang <strong>melanggar syarat</strong> (kurang dari 2 perempuan):
              </p>
              <p className="text-[11px] text-slate-400 italic -mt-1 mb-2">💡 Kolom "Perhitungan" isi rumusnya, kolom "Subtotal" isi hasil akhirnya saja.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.border }}>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kasus</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perhitungan</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2 px-2">0 perempuan</td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s2_0p}
                          onChange={setS2_0p}
                          placeholder="C(...,...) × C(...,...)..."
                        />
                      </td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s2_0pSub}
                          onChange={setS2_0pSub}
                          placeholder="Subtotal..."
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">1 perempuan</td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s2_1p}
                          onChange={setS2_1p}
                          placeholder="C(...,...) × C(...,...)..."
                        />
                      </td>
                      <td className="py-2 px-2">
                        <TextInput
                          value={s2_1pSub}
                          onChange={setS2_1pSub}
                          placeholder="Subtotal..."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 mt-3">
                <p className="text-[11px] text-slate-400 italic">💡 Cukup masukkan jawaban akhirnya saja, tidak perlu tulis cara.</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700">Total yang melanggar =</span>
                  <div className="w-32">
                    <TextInput
                      value={s2_totalMelanggar}
                      onChange={setS2_totalMelanggar}
                      placeholder="Total..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-700">
                    Total memenuhi syarat = C(10,4) − Total melanggar =
                  </span>
                  <div className="w-32">
                    <TextInput
                      value={s2_totalMemenuhi}
                      onChange={setS2_totalMemenuhi}
                      placeholder="Hasil..."
                    />
                  </div>
                </div>
              </div>

              {feedbackMap["a_strategi2"] && (
                <FeedbackOrReveal qKey="a_strategi2" fb={feedbackMap["a_strategi2"]} />
              )}
              <SaveButton
                onClick={() => handleSave("a_strategi2")}
                isSaving={saving["a_strategi2"] ?? false}
                isCorrect={feedbackMap["a_strategi2"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* Verifikasi + Efisiensi Soal A */}
          {currentStep >= 3 && (
          <div>
            <SoalBadge n={4} label="Soal A — Verifikasi & Efisiensi" />
            <PertanyaanCard>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Apakah kedua strategi menghasilkan jawaban yang sama?
                  </p>
                  <YaTidakRadio
                    name="a_verifikasi"
                    value={soalA_verifikasi}
                    onChange={setSoalA_verifikasi}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Strategi mana yang lebih efisien?
                  </p>
                  <StrategiSelect value={soalA_efisien} onChange={setSoalA_efisien} />
                </div>
                <TextArea
                  label="Mengapa?"
                  value={soalA_alasan}
                  onChange={setSoalA_alasan}
                  placeholder="Jelaskan alasanmu..."
                  rows={3}
                />
              </div>
              {feedbackMap["a_verifikasi"] && (
                <FeedbackOrReveal qKey="a_verifikasi" fb={feedbackMap["a_verifikasi"]} />
              )}
              <SaveButton
                onClick={() => handleSave("a_verifikasi")}
                isSaving={saving["a_verifikasi"] ?? false}
                isCorrect={feedbackMap["a_verifikasi"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* ═══════════════════════════════════════════════
              SOAL B
              ═══════════════════════════════════════════════ */}
          {currentStep >= 4 && (
          <>
          <SectionHeader
            icon="📝"
            title="Soal B"
            subtitle="Dari 9 anggota komunitas fotografi, akan dipilih tim inti 3 orang. Diketahui bahwa Rian dan Sinta tidak bisa bekerja sama (tidak boleh berada dalam tim yang sama)."
          />

          {/* Strategi 1 */}
          <div>
            <SoalBadge n={5} label="Soal B — Strategi 1 (Kasus per Kasus)" />
            <PertanyaanCard>
              {/* Simulasi (fitur baru) — sebelum tabel strategi */}
              <SimulasiSyarat
                orangPilihan={ORANG_SOAL_B}
                jumlahSlot={3}
                cekSyarat={cekSyaratSoalB}
                ringkasanInsight="Dari 3 percobaan, kamu menemukan bahwa tim yang berisi Rian dan Sinta sekaligus akan melanggar syarat — itu sebabnya soal ini perlu memisahkan kasus (Rian masuk/Sinta tidak, Sinta masuk/Rian tidak, atau keduanya tidak masuk) atau menghitung komplemen dari tim yang berisi keduanya."
                state={simulasiB}
                onChange={setSimulasiB}
              />

              <p className="text-[11px] text-slate-400 italic mb-2 mt-3">💡 Kolom "Subtotal" dan "Total": cukup masukkan jawaban akhirnya saja.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.border }}>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kasus</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Kondisi</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Perhitungan</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2 px-2">Rian masuk, Sinta tidak</td>
                      <td className="py-2 px-2">Pilih 2 dari 7 sisa</td>
                      <td className="py-2 px-2 text-xs text-slate-500">C(7,2)</td>
                      <td className="py-2 px-2">
                        <TextInput value={b1_rian} onChange={setB1_rian} placeholder="Subtotal..." />
                      </td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2 px-2">Sinta masuk, Rian tidak</td>
                      <td className="py-2 px-2">Pilih 2 dari 7 sisa</td>
                      <td className="py-2 px-2 text-xs text-slate-500">C(7,2)</td>
                      <td className="py-2 px-2">
                        <TextInput value={b1_sinta} onChange={setB1_sinta} placeholder="Subtotal..." />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">Keduanya tidak masuk</td>
                      <td className="py-2 px-2">Pilih 3 dari 7 sisa</td>
                      <td className="py-2 px-2 text-xs text-slate-500">C(7,3)</td>
                      <td className="py-2 px-2">
                        <TextInput value={b1_keduanya} onChange={setB1_keduanya} placeholder="Subtotal..." />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-bold text-slate-700" colSpan={3}>
                        Total
                      </td>
                      <td className="py-2 px-2">
                        <TextInput value={b1_total} onChange={setB1_total} placeholder="Total..." />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {feedbackMap["b_strategi1"] && (
                <FeedbackOrReveal qKey="b_strategi1" fb={feedbackMap["b_strategi1"]} />
              )}
              <SaveButton
                onClick={() => handleSave("b_strategi1")}
                isSaving={saving["b_strategi1"] ?? false}
                isCorrect={feedbackMap["b_strategi1"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>

          {/* Strategi 2 */}
          {currentStep >= 5 && (
          <div>
            <SoalBadge n={6} label="Soal B — Strategi 2 (Komplemen)" />
            <PertanyaanCard>
              <p className="text-[11px] text-slate-400 italic mb-3">💡 Cukup masukkan jawaban akhirnya saja, tidak perlu tulis cara panjang.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700">Total tim tanpa syarat = C(9,3) =</span>
                  <div className="w-24">
                    <TextInput
                      value={b2_totalSemua}
                      onChange={setB2_totalSemua}
                      placeholder="Hasil..."
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-1">
                    Tim yang melanggar (Rian dan Sinta keduanya masuk):
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    (Jika Rian dan Sinta sudah pasti masuk, pilih 1 lagi dari sisa)
                  </p>
                  <TextInput
                    value={b2_melanggarCalc}
                    onChange={setB2_melanggarCalc}
                    placeholder="Tulis jawaban akhir saja..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700">Total memenuhi =</span>
                  <div className="w-24">
                    <TextInput
                      value={b2_totalMemenuhi}
                      onChange={setB2_totalMemenuhi}
                      placeholder="Hasil..."
                    />
                  </div>
                </div>
              </div>
              {feedbackMap["b_strategi2"] && (
                <FeedbackOrReveal qKey="b_strategi2" fb={feedbackMap["b_strategi2"]} />
              )}
              <SaveButton
                onClick={() => handleSave("b_strategi2")}
                isSaving={saving["b_strategi2"] ?? false}
                isCorrect={feedbackMap["b_strategi2"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* Verifikasi Soal B */}
          {currentStep >= 6 && (
          <div>
            <SoalBadge n={7} label="Soal B — Verifikasi & Efisiensi" />
            <PertanyaanCard>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Apakah hasilnya sama?
                  </p>
                  <YaTidakRadio
                    name="b_verifikasi"
                    value={soalB_verifikasi}
                    onChange={setSoalB_verifikasi}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Untuk soal seperti ini (ada dua orang yang tidak boleh bersama), strategi mana yang lebih cepat?
                  </p>
                  <StrategiSelect value={soalB_cepat} onChange={setSoalB_cepat} />
                </div>
              </div>
              {feedbackMap["b_verifikasi"] && (
                <FeedbackOrReveal qKey="b_verifikasi" fb={feedbackMap["b_verifikasi"]} />
              )}
              <SaveButton
                onClick={() => handleSave("b_verifikasi")}
                isSaving={saving["b_verifikasi"] ?? false}
                isCorrect={feedbackMap["b_verifikasi"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}
          </>
          )}

          {/* ═══════════════════════════════════════════════
              DISKUSI PASANGAN
              ═══════════════════════════════════════════════ */}
          {currentStep >= 7 && (
          <>
          <SectionHeader
            icon="💬"
            title="Diskusi Pasangan — Panduan Memilih Strategi"
            subtitle="Berdasarkan pengalaman mengerjakan Soal A dan B, lengkapi panduan berikut:"
          />

          <div>
            <SoalBadge n={8} label="Diskusi Pasangan" />
            <PertanyaanCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.border }}>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">
                        Kondisi Soal
                      </th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">
                        Strategi yang Lebih Efisien
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2.5 px-2 text-slate-700">
                        Syarat &quot;minimal&quot; atau &quot;paling sedikit&quot; dan kasusnya banyak
                      </td>
                      <td className="py-2.5 px-2">
                        <StrategiSelect value={panduan1} onChange={setPanduan1} />
                      </td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: `${C.border}80` }}>
                      <td className="py-2.5 px-2 text-slate-700">
                        Syarat &quot;tidak boleh bersama&quot; atau &quot;pengecualian sederhana&quot;
                      </td>
                      <td className="py-2.5 px-2">
                        <StrategiSelect value={panduan2} onChange={setPanduan2} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 text-slate-700">
                        Syarat yang pengecualiannya lebih sedikit dari yang diminta
                      </td>
                      <td className="py-2.5 px-2">
                        <StrategiSelect value={panduan3} onChange={setPanduan3} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {feedbackMap["diskusi_pasangan"] && (
                <FeedbackOrReveal qKey="diskusi_pasangan" fb={feedbackMap["diskusi_pasangan"]} />
              )}
              <SaveButton
                onClick={() => handleSave("diskusi_pasangan")}
                isSaving={saving["diskusi_pasangan"] ?? false}
                isCorrect={feedbackMap["diskusi_pasangan"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          </>
          )}
        </div>
        </>  
        )}

        {/* ── Completion Banner ── */}
        {!isLoadingExisting && !hasExistingSubmissions && allComplete && (
          <div
            className="mt-8 rounded-2xl border-2 p-6 text-center space-y-3"
            style={{ borderColor: C.green, backgroundColor: C.greenLight }}
          >
            <p className="text-2xl">🎉</p>
            <p className="text-lg font-bold" style={{ color: C.green }}>
              Kamu sudah menyelesaikan aktivitas ini!
            </p>
            <p className="text-sm text-slate-600">
              Semua soal telah dijawab dengan benar. Kamu sudah memahami strategi
              Kasus per Kasus dan Komplemen dengan baik!
            </p>
            <Link
              href="/siswa/activity/kombinasi"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline mt-2"
              style={{ color: C.green }}
            >
              ← Kembali ke daftar aktivitas
            </Link>
          </div>
        )}

        {/* ── Toast ── */}
        {toast.visible && (
          <div
            className="fixed bottom-6 right-6 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg transition-all z-50"
            style={{ backgroundColor: C.green }}
          >
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}