"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconClock, IconUserGroup } from "@/components/activity/ActivityIcons";

// ── Color palette ──
const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

type Jenis = "" | "permutasi" | "kombinasi";

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

function JenisRadio({
  name,
  value,
  onChange,
  readOnly = false,
}: {
  name: string;
  value: Jenis;
  onChange: (v: Jenis) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {[
        { val: "permutasi", label: "Permutasi" },
        { val: "kombinasi", label: "Kombinasi" },
      ].map((opt) => (
        <label key={opt.val} className={`flex items-center gap-1.5 ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
          <input
            type="radio"
            name={name}
            value={opt.val}
            checked={value === opt.val}
            onChange={() => onChange(opt.val as Jenis)}
            disabled={readOnly}
            className="accent-green-700"
          />
          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
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

// ═══════════════════════════════════════════════════════════════════
// ── SIMULASI TIM GABUNGAN (fitur baru) ───────────────────────────
// ═══════════════════════════════════════════════════════════════════

interface OrangSimulasi {
  id: string;
  label: string;
}

interface TahapSimulasi {
  key: "matematika" | "fisika" | "kimia";
  label: string;
  orangPilihan: OrangSimulasi[];
  jumlahSlot: number;
}

const TAHAP_SIMULASI: TahapSimulasi[] = [
  {
    key: "matematika",
    label: "Matematika (pilih 2 dari 5)",
    orangPilihan: [
      { id: "m1", label: "M1" },
      { id: "m2", label: "M2" },
      { id: "m3", label: "M3" },
      { id: "m4", label: "M4" },
      { id: "m5", label: "M5" },
    ],
    jumlahSlot: 2,
  },
  {
    key: "fisika",
    label: "Fisika (pilih 2 dari 4)",
    orangPilihan: [
      { id: "f1", label: "F1" },
      { id: "f2", label: "F2" },
      { id: "f3", label: "F3" },
      { id: "f4", label: "F4" },
    ],
    jumlahSlot: 2,
  },
  {
    key: "kimia",
    label: "Kimia (pilih 2 dari 3)",
    orangPilihan: [
      { id: "k1", label: "K1" },
      { id: "k2", label: "K2" },
      { id: "k3", label: "K3" },
    ],
    jumlahSlot: 2,
  },
];

interface SimulasiState {
  dipilih: { matematika: string[]; fisika: string[]; kimia: string[] };
  percobaanKe: number; // 0 - 3
  selesai: boolean; // true jika sudah 3 percobaan (summary tampil)
}

function makeSimulasiState(): SimulasiState {
  return { dipilih: { matematika: [], fisika: [], kimia: [] }, percobaanKe: 0, selesai: false };
}

function SimulasiTimGabungan({
  state,
  onChange,
}: {
  state: SimulasiState;
  onChange: (next: SimulasiState) => void;
}) {
  const semuaTahapPenuh = TAHAP_SIMULASI.every(
    (t) => state.dipilih[t.key].length >= t.jumlahSlot
  );

  const handlePilihOrang = (tahapKey: TahapSimulasi["key"], id: string) => {
    const current = state.dipilih[tahapKey];
    const tahapDef = TAHAP_SIMULASI.find((t) => t.key === tahapKey)!;
    if (current.length >= tahapDef.jumlahSlot) return;
    if (current.includes(id)) return;
    onChange({
      ...state,
      dipilih: { ...state.dipilih, [tahapKey]: [...current, id] },
    });
  };

  const handleCobaSusunanLain = () => {
    onChange({ ...state, dipilih: { matematika: [], fisika: [], kimia: [] } });
  };

  const handleSelesaiPercobaan = () => {
    if (!semuaTahapPenuh) return;
    const percobaanBaru = state.percobaanKe + 1;
    onChange({
      dipilih: { matematika: [], fisika: [], kimia: [] },
      percobaanKe: percobaanBaru,
      selesai: percobaanBaru >= 3,
    });
  };

  const handleResetSimulasi = () => {
    onChange(makeSimulasiState());
  };

  const labelOrang = (tahapKey: TahapSimulasi["key"], id: string) => {
    const tahapDef = TAHAP_SIMULASI.find((t) => t.key === tahapKey)!;
    return tahapDef.orangPilihan.find((o) => o.id === id)?.label ?? id;
  };

  // Tahap aktif: tahap pertama yang belum penuh
  const tahapAktifIdx = TAHAP_SIMULASI.findIndex(
    (t) => state.dipilih[t.key].length < t.jumlahSlot
  );

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ backgroundColor: "#2A5A8C08", border: "1px solid #2A5A8C33" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-bold" style={{ color: "#2A5A8C" }}>
          🎮 Simulasi: Susun Tim Olimpiademu
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
            Pilih anggota tim untuk masing-masing bidang secara berurutan.
          </p>

          {/* Tahap-tahap pemilihan */}
          <div className="space-y-3">
            {TAHAP_SIMULASI.map((tahap, ti) => {
              const dipilihTahap = state.dipilih[tahap.key];
              const tahapPenuh = dipilihTahap.length >= tahap.jumlahSlot;
              const tahapAktif = ti === tahapAktifIdx;
              const tahapTerkunci = !tahapPenuh && !tahapAktif;

              return (
                <div
                  key={tahap.key}
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: C.white,
                    border: `1px solid ${C.border}`,
                    opacity: tahapTerkunci ? 0.5 : 1,
                  }}
                >
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    {tahap.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tahap.orangPilihan.map((o) => {
                      const sudahDipilih = dipilihTahap.includes(o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => handlePilihOrang(tahap.key, o.id)}
                          disabled={sudahDipilih || tahapPenuh || tahapTerkunci}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: sudahDipilih ? C.green : C.white,
                            color: sudahDipilih ? C.white : "#334155",
                            borderColor: sudahDipilih ? C.green : C.border,
                            opacity: !sudahDipilih && (tahapPenuh || tahapTerkunci) ? 0.4 : 1,
                          }}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ringkasan tim jika semua tahap penuh */}
          {semuaTahapPenuh && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{ backgroundColor: C.greenLight }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: C.green }}>
                🏆 Tim Olimpiade Terpilih:
              </p>
              <p className="font-medium" style={{ color: C.green }}>
                Matematika: {state.dipilih.matematika.map((id) => labelOrang("matematika", id)).join(", ")}
                {" · "}
                Fisika: {state.dipilih.fisika.map((id) => labelOrang("fisika", id)).join(", ")}
                {" · "}
                Kimia: {state.dipilih.kimia.map((id) => labelOrang("kimia", id)).join(", ")}
              </p>
            </div>
          )}

          {/* Tombol aksi */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {semuaTahapPenuh && (
              <button
                type="button"
                onClick={handleCobaSusunanLain}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: "#2A5A8C" }}
              >
                🔄 Coba Susunan Lain
              </button>
            )}
            {semuaTahapPenuh && (
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

          {semuaTahapPenuh && (
            <p className="text-xs text-slate-500 italic">
              Tips: coba beberapa susunan tim yang berbeda untuk merasakan bahwa
              setiap bidang dipilih secara terpisah, lalu digabung jadi satu tim.
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
          <p className="text-sm text-slate-700">
            Dari 3 percobaan, kamu melihat bahwa memilih tim Matematika, Fisika, dan
            Kimia adalah 3 keputusan terpisah yang terjadi bersamaan — itu sebabnya
            jumlah caranya dikalikan (aturan perkalian), bukan dijumlahkan.
          </p>
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

// ── Sequential unlocking: question order ──
const QUESTION_KEYS = ["q1", "q2", "q3"];

// ═══════════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AktivitasKombinasi3() {
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
        const res = await fetch("/api/aktivitas-siswa?concept_id=kombinasi&activity_key=aktivitas_3");
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

  // ── Helper ──
  function normNum(s: string): string {
    return s.replace(/[\s,.]/g, "").replace(/^0+(?=\d)/, "");
  }

  // ── Rule-based grading for No. 2 ──
  function gradeQ2(): { isCorrect: boolean; feedback: string } {
    const okMatN = normNum(q2_mat_n) === "5";
    const okMatR = normNum(q2_mat_r) === "2";
    const okMatH = normNum(q2_mat_hasil) === "10";
    const okFisN = normNum(q2_fis_n) === "4";
    const okFisR = normNum(q2_fis_r) === "2";
    const okFisH = normNum(q2_fis_hasil) === "6";
    const okKimN = normNum(q2_kim_n) === "3";
    const okKimR = normNum(q2_kim_r) === "2";
    const okKimH = normNum(q2_kim_hasil) === "3";
    const okTotal = normNum(q2_total) === "180";

    const allFilled = q2_mat_n.trim() && q2_mat_r.trim() && q2_mat_hasil.trim() &&
      q2_fis_n.trim() && q2_fis_r.trim() && q2_fis_hasil.trim() &&
      q2_kim_n.trim() && q2_kim_r.trim() && q2_kim_hasil.trim() && q2_total.trim();

    if (!allFilled) return { isCorrect: false, feedback: "⚠️ Lengkapi semua isian dulu ya sebelum menyimpan!" };

    if (okMatN && okMatR && okMatH && okFisN && okFisR && okFisH && okKimN && okKimR && okKimH && okTotal) {
      return { isCorrect: true, feedback: "🎯 Tepat! C(5,2)=10, C(4,2)=6, C(3,2)=3. Total = 10×6×3 = 180 cara. Ini adalah kombinasi karena urutan pemilihan dalam satu bidang tidak penting, lalu hasil tiap bidang dikalikan (aturan perkalian)." };
    }

    let fb = "🤔 Ada yang perlu dicek:\n";
    if (!okMatN || !okMatR || !okMatH) fb += "• Matematika: pilih r dari n yang tersedia. Gunakan C(n,r) — pastikan n dan r benar.\n";
    if (!okFisN || !okFisR || !okFisH) fb += "• Fisika: pilih r dari n yang tersedia. Gunakan C(n,r) — pastikan n dan r benar.\n";
    if (!okKimN || !okKimR || !okKimH) fb += "• Kimia: pilih r dari n yang tersedia. Gunakan C(n,r) — pastikan n dan r benar.\n";
    if (!okTotal) fb += "• Total = kalikan ketiga hasil (aturan perkalian: setiap bidang dipilih secara bersamaan).\n";
    return { isCorrect: false, feedback: fb };
  }

  // ── Handle save ──
  const handleSave = async (key: string) => {
    setSaving((p) => ({ ...p, [key]: true }));

    try {
      // No. 1 & No. 3 → AI
      if (key === "q1" || key === "q3") {
        await new Promise((r) => setTimeout(r, 800));
        let soalText = "";
        let jawaban = "";
        if (key === "q1") {
          soalText = "Sekolah memiliki 12 siswa berbakat: 5 hanya Matematika, 4 hanya Fisika, 3 hanya Kimia. Masing-masing bidang mengirim 2 siswa. Apakah ini soal permutasi atau kombinasi? Jelaskan alasanmu!";
          jawaban = `Jenis: ${q1_jenis}\nAlasan: ${q1_alasan}`;
        } else {
          soalText = "Mengapa ketiga pemilihan (Matematika, Fisika, Kimia) dikalikan, bukan dijumlahkan?";
          jawaban = q3_alasan;
        }
        if (!jawaban.trim() || (key === "q1" && q1_jenis === "")) {
          setFeedbackMap((p) => ({ ...p, [key]: { text: "⚠️ Isi jawabanmu dulu ya sebelum menyimpan!", isCorrect: false } }));
        } else {
          try {
            const res = await fetch("/api/aktivitas-siswa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                concept_id: "kombinasi",
                activity_key: "aktivitas_3",
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
        // No. 2 → Rule-based
        const result = gradeQ2();
        await new Promise((r) => setTimeout(r, 500));
        
        // Save to DB
        const soalText = "Kombinasi Aktivitas 3 — Hitung banyak cara memilih tim olimpiade lengkap";
        const jawaban = `Mat:C(${q2_mat_n},${q2_mat_r})=${q2_mat_hasil} Fis:C(${q2_fis_n},${q2_fis_r})=${q2_fis_hasil} Kim:C(${q2_kim_n},${q2_kim_r})=${q2_kim_hasil} Total:${q2_total}`;
        fetch("/api/aktivitas-siswa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concept_id: "kombinasi",
            activity_key: "aktivitas_3",
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
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  };

  // ── Apply stored answer back into form state ──────────────────
  function applyAnswerToState(key: string, rawAnswer: string) {
    if (key === "q1") {
      const mJ = rawAnswer.match(/Jenis:\s*(\S+)/);
      const mA = rawAnswer.match(/Alasan:\s*([\s\S]+)/);
      if (mJ) setQ1_jenis(mJ[1] as Jenis);
      if (mA) setQ1_alasan(mA[1].trim());
    } else if (key === "q2") {
      const mMat = rawAnswer.match(/Mat:C\((\S+),(\S+)\)=(\S+)/);
      const mFis = rawAnswer.match(/Fis:C\((\S+),(\S+)\)=(\S+)/);
      const mKim = rawAnswer.match(/Kim:C\((\S+),(\S+)\)=(\S+)/);
      const mTot = rawAnswer.match(/Total:(\S+)/);
      if (mMat) { setQ2_mat_n(mMat[1]); setQ2_mat_r(mMat[2]); setQ2_mat_hasil(mMat[3]); }
      if (mFis) { setQ2_fis_n(mFis[1]); setQ2_fis_r(mFis[2]); setQ2_fis_hasil(mFis[3]); }
      if (mKim) { setQ2_kim_n(mKim[1]); setQ2_kim_r(mKim[2]); setQ2_kim_hasil(mKim[3]); }
      if (mTot) setQ2_total(mTot[1]);
    } else if (key === "q3") {
      setQ3_alasan(rawAnswer);
    }
  }

  // ── Reveal answer for review mode ──────────────────────────────
  const handleRevealAnswer = useCallback(async (key: string) => {
    if (revealedSteps[key]) return;
    setLoadingAnswer((p) => ({ ...p, [key]: true }));
    try {
      const res = await fetch(
        `/api/aktivitas-siswa?concept_id=kombinasi&activity_key=aktivitas_3&question_key=${encodeURIComponent(key)}`
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
    q1: "Pertanyaan 1 — Permutasi atau Kombinasi?",
    q2: "Pertanyaan 2 — Hitung Banyak Cara",
    q3: "Pertanyaan 3 — Mengapa Dikalikan?",
  };

  // ── Question full text for review mode ─────────────────────────
  const QUESTION_SOAL: Record<string, string> = {
    q1: "Sekolah memiliki 12 siswa berbakat: 5 hanya Matematika, 4 hanya Fisika, 3 hanya Kimia. Masing-masing bidang mengirim 2 siswa. Apakah ini soal permutasi atau kombinasi? Jelaskan alasanmu!",
    q2: "Hitung berapa banyak cara memilih tim olimpiade lengkap (2 Matematika + 2 Fisika + 2 Kimia).",
    q3: "Mengapa ketiga pemilihan (Matematika, Fisika, Kimia) dikalikan, bukan dijumlahkan?",
  };

  // ── Simulasi (fitur baru) ──
  const [simulasi, setSimulasi] = useState<SimulasiState>(makeSimulasiState());

  // ── Pertanyaan 1 ──
  const [q1_jenis, setQ1_jenis] = useState<Jenis>("");
  const [q1_alasan, setQ1_alasan] = useState("");

  // ── Pertanyaan 2 ──
  const [q2_mat_n, setQ2_mat_n] = useState("");
  const [q2_mat_r, setQ2_mat_r] = useState("");
  const [q2_mat_hasil, setQ2_mat_hasil] = useState("");
  const [q2_fis_n, setQ2_fis_n] = useState("");
  const [q2_fis_r, setQ2_fis_r] = useState("");
  const [q2_fis_hasil, setQ2_fis_hasil] = useState("");
  const [q2_kim_n, setQ2_kim_n] = useState("");
  const [q2_kim_r, setQ2_kim_r] = useState("");
  const [q2_kim_hasil, setQ2_kim_hasil] = useState("");
  const [q2_total, setQ2_total] = useState("");

  // ── Pertanyaan 3 ──
  const [q3_alasan, setQ3_alasan] = useState("");

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
              <IconUserGroup />
              KELOMPOK KECIL (4 Orang)
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: C.green, color: C.white }}
            >
              <IconClock />
              35 menit
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: C.purple }}>
            Aktivitas 3 — “Tim Konsultan Sekolah”
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Pilar:</span>
            {[
              { label: "Joyful", color: "#C9962B" },
              { label: "Meaningful", color: "#4CAF50" },
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
                        {/* ── Q1 ── */}
                        {key === "q1" && (
                          <>
                            <SoalBadge n={1} label="Pertanyaan 1" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800">
                                Apakah ini soal permutasi atau kombinasi? Jelaskan alasanmu!
                              </p>
                              <JenisRadio
                                name="q1_jenis_review"
                                value={q1_jenis}
                                onChange={setQ1_jenis}
                                readOnly
                              />
                              <TextArea
                                label="Alasan:"
                                value={q1_alasan}
                                onChange={setQ1_alasan}
                                rows={4}
                                readOnly
                              />
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Q2 ── */}
                        {key === "q2" && (
                          <>
                            <SoalBadge n={2} label="Pertanyaan 2" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800 mb-3">
                                Hitung berapa banyak cara memilih tim olimpiade lengkap
                                (2 Matematika + 2 Fisika + 2 Kimia):
                              </p>
                              <div className="space-y-4">
                                {/* Matematika */}
                                <div className="rounded-lg p-3" style={{ backgroundColor: "#f1f5f9" }}>
                                  <p className="text-sm font-medium text-slate-700 mb-2">Pilih 2 Matematika dari 5:</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-slate-500">C(</span>
                                    <div className="w-14"><TextInput value={q2_mat_n} onChange={setQ2_mat_n} placeholder="n" readOnly /></div>
                                    <span className="text-sm text-slate-500">,</span>
                                    <div className="w-14"><TextInput value={q2_mat_r} onChange={setQ2_mat_r} placeholder="r" readOnly /></div>
                                    <span className="text-sm text-slate-500">) =</span>
                                    <div className="w-24"><TextInput value={q2_mat_hasil} onChange={setQ2_mat_hasil} placeholder="Hasil" readOnly /></div>
                                  </div>
                                </div>
                                {/* Fisika */}
                                <div className="rounded-lg p-3" style={{ backgroundColor: "#f1f5f9" }}>
                                  <p className="text-sm font-medium text-slate-700 mb-2">Pilih 2 Fisika dari 4:</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-slate-500">C(</span>
                                    <div className="w-14"><TextInput value={q2_fis_n} onChange={setQ2_fis_n} placeholder="n" readOnly /></div>
                                    <span className="text-sm text-slate-500">,</span>
                                    <div className="w-14"><TextInput value={q2_fis_r} onChange={setQ2_fis_r} placeholder="r" readOnly /></div>
                                    <span className="text-sm text-slate-500">) =</span>
                                    <div className="w-24"><TextInput value={q2_fis_hasil} onChange={setQ2_fis_hasil} placeholder="Hasil" readOnly /></div>
                                  </div>
                                </div>
                                {/* Kimia */}
                                <div className="rounded-lg p-3" style={{ backgroundColor: "#f1f5f9" }}>
                                  <p className="text-sm font-medium text-slate-700 mb-2">Pilih 2 Kimia dari 3:</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-slate-500">C(</span>
                                    <div className="w-14"><TextInput value={q2_kim_n} onChange={setQ2_kim_n} placeholder="n" readOnly /></div>
                                    <span className="text-sm text-slate-500">,</span>
                                    <div className="w-14"><TextInput value={q2_kim_r} onChange={setQ2_kim_r} placeholder="r" readOnly /></div>
                                    <span className="text-sm text-slate-500">) =</span>
                                    <div className="w-24"><TextInput value={q2_kim_hasil} onChange={setQ2_kim_hasil} placeholder="Hasil" readOnly /></div>
                                  </div>
                                </div>
                                {/* Total */}
                                <div className="rounded-lg p-3" style={{ borderColor: `${C.green}66`, borderWidth: "2px" }}>
                                  <p className="text-sm font-bold text-slate-700 mb-2">Total cara:</p>
                                  <TextInput value={q2_total} onChange={setQ2_total} placeholder="Tulis total perhitungan..." readOnly />
                                </div>
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Q3 ── */}
                        {key === "q3" && (
                          <>
                            <SoalBadge n={3} label="Pertanyaan 3" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800">
                                Mengapa ketiga pemilihan di atas dikalikan, bukan dijumlahkan?
                              </p>
                              <TextArea
                                value={q3_alasan}
                                onChange={setQ3_alasan}
                                placeholder="Jelaskan alasanmu di sini..."
                                rows={4}
                                readOnly
                              />
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
          {/* Konteks */}
          <SectionHeader
            icon="🏫"
            title="Konteks"
            subtitle="Kelompokmu adalah tim konsultan yang diminta sekolah untuk membantu tiga departemen yang masing-masing punya masalah pencacahan. Setiap masalah membutuhkan analisis mendalam — bukan sekadar menghitung."
          />

          {/* Masalah */}
          <div
            className="rounded-xl p-4 border-2"
            style={{
              borderColor: `${C.purple}33`,
              backgroundColor: `${C.purple}08`,
            }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: C.purple }}>
              📋 Masalah — Departemen Akademik: Pembentukan Tim Olimpiade
            </p>
            <p className="text-sm text-slate-700 mb-3">
              Sekolah memiliki <strong>12 siswa berbakat</strong> yang akan dikirim ke olimpiade sains.
              Tersedia 3 bidang: <strong>Matematika, Fisika, dan Kimia</strong> — masing-masing mengirim{" "}
              <strong>2 siswa</strong>.
            </p>
            <p className="text-sm text-slate-700">Diketahui:</p>
            <ul className="text-sm text-slate-700 list-disc list-inside space-y-1 mt-1">
              <li>5 siswa hanya bisa ikut olimpiade Matematika</li>
              <li>4 siswa hanya bisa ikut olimpiade Fisika</li>
              <li>3 siswa hanya bisa ikut olimpiade Kimia</li>
            </ul>
          </div>

          {/* ═══════════════════════════════════════
              PERTANYAAN 1
              ═══════════════════════════════════════ */}
          {currentStep >= 0 && (
          <div>
            <SoalBadge n={1} label="Pertanyaan 1" />
            <PertanyaanCard>
              {/* Simulasi (fitur baru) — sebelum siswa menjawab */}
              <SimulasiTimGabungan state={simulasi} onChange={setSimulasi} />

              <p className="text-sm font-medium text-slate-800">
                Apakah ini soal permutasi atau kombinasi? Jelaskan alasanmu!
              </p>
              <div className="space-y-3">
                <JenisRadio
                  name="q1_jenis"
                  value={q1_jenis}
                  onChange={setQ1_jenis}
                />
                <TextArea
                  label="Alasan:"
                  value={q1_alasan}
                  onChange={setQ1_alasan}
                  placeholder="Jelaskan alasanmu di sini..."
                  rows={4}
                />
              </div>
              {feedbackMap["q1"] && (
                <FeedbackOrReveal qKey="q1" fb={feedbackMap["q1"]} />
              )}
              <SaveButton
                onClick={() => handleSave("q1")}
                isSaving={saving["q1"] ?? false}
                isCorrect={feedbackMap["q1"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* ═══════════════════════════════════════
              PERTANYAAN 2
              ═══════════════════════════════════════ */}
          {currentStep >= 1 && (
          <div>
            <SoalBadge n={2} label="Pertanyaan 2" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-800 mb-3">
                Hitung berapa banyak cara memilih tim olimpiade lengkap
                (2 Matematika + 2 Fisika + 2 Kimia):
              </p>

              <div className="space-y-4">
                {/* Matematika */}
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "#f1f5f9" }}
                >
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Pilih 2 Matematika dari 5:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500">C(</span>
                    <div className="w-14">
                      <TextInput
                        value={q2_mat_n}
                        onChange={setQ2_mat_n}
                        placeholder="n"
                      />
                    </div>
                    <span className="text-sm text-slate-500">,</span>
                    <div className="w-14">
                      <TextInput
                        value={q2_mat_r}
                        onChange={setQ2_mat_r}
                        placeholder="r"
                      />
                    </div>
                    <span className="text-sm text-slate-500">) =</span>
                    <div className="w-24">
                      <TextInput
                        value={q2_mat_hasil}
                        onChange={setQ2_mat_hasil}
                        placeholder="Hasil"
                      />
                    </div>
                  </div>
                </div>

                {/* Fisika */}
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "#f1f5f9" }}
                >
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Pilih 2 Fisika dari 4:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500">C(</span>
                    <div className="w-14">
                      <TextInput
                        value={q2_fis_n}
                        onChange={setQ2_fis_n}
                        placeholder="n"
                      />
                    </div>
                    <span className="text-sm text-slate-500">,</span>
                    <div className="w-14">
                      <TextInput
                        value={q2_fis_r}
                        onChange={setQ2_fis_r}
                        placeholder="r"
                      />
                    </div>
                    <span className="text-sm text-slate-500">) =</span>
                    <div className="w-24">
                      <TextInput
                        value={q2_fis_hasil}
                        onChange={setQ2_fis_hasil}
                        placeholder="Hasil"
                      />
                    </div>
                  </div>
                </div>

                {/* Kimia */}
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "#f1f5f9" }}
                >
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Pilih 2 Kimia dari 3:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500">C(</span>
                    <div className="w-14">
                      <TextInput
                        value={q2_kim_n}
                        onChange={setQ2_kim_n}
                        placeholder="n"
                      />
                    </div>
                    <span className="text-sm text-slate-500">,</span>
                    <div className="w-14">
                      <TextInput
                        value={q2_kim_r}
                        onChange={setQ2_kim_r}
                        placeholder="r"
                      />
                    </div>
                    <span className="text-sm text-slate-500">) =</span>
                    <div className="w-24">
                      <TextInput
                        value={q2_kim_hasil}
                        onChange={setQ2_kim_hasil}
                        placeholder="Hasil"
                      />
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    borderColor: `${C.green}66`,
                    borderWidth: "2px",
                  }}
                >
                  <p className="text-sm font-bold text-slate-700 mb-2">
                    Total cara:
                  </p>
                  <TextInput
                    value={q2_total}
                    onChange={setQ2_total}
                    placeholder="Tulis total perhitungan..."
                  />
                </div>
              </div>

              {feedbackMap["q2"] && (
                <FeedbackOrReveal qKey="q2" fb={feedbackMap["q2"]} />
              )}
              <SaveButton
                onClick={() => handleSave("q2")}
                isSaving={saving["q2"] ?? false}
                isCorrect={feedbackMap["q2"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* ═══════════════════════════════════════
              PERTANYAAN 3
              ═══════════════════════════════════════ */}
          {currentStep >= 2 && (
          <div>
            <SoalBadge n={3} label="Pertanyaan 3" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-800">
                Mengapa ketiga pemilihan di atas dikalikan, bukan dijumlahkan?
              </p>
              <TextArea
                value={q3_alasan}
                onChange={setQ3_alasan}
                placeholder="Jelaskan alasanmu di sini..."
                rows={4}
              />
              {feedbackMap["q3"] && (
                <FeedbackOrReveal qKey="q3" fb={feedbackMap["q3"]} />
              )}
              <SaveButton
                onClick={() => handleSave("q3")}
                isSaving={saving["q3"] ?? false}
                isCorrect={feedbackMap["q3"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
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
              Semua soal telah dijawab dengan benar. Kamu sudah memahami
              kombinasi dengan aturan perkalian dengan baik!
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