"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { IconClock, IconUserSolo } from "@/components/activity/ActivityIcons";

// ── Color palette ──
const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

// ── Step Definitions: PER NOMOR (12 steps) ──────────────────────
interface StepConfig {
  index: number;
  questionKey: string;
  entryType: "soal" | "refleksi";
  label: string;
  soalText: string;
  aiFeedbackOnly?: boolean;
}

const STEPS: StepConfig[] = [
  { index: 0,  questionKey: "nomor_1",   entryType: "soal",     label: "Nomor 1 — 8!/6!",               soalText: "8!/6! = ?" },
  { index: 1,  questionKey: "nomor_2",   entryType: "soal",     label: "Nomor 2 — 9!/7!",               soalText: "9!/7! = ?" },
  { index: 2,  questionKey: "nomor_3",   entryType: "soal",     label: "Nomor 3 — 10!/8!",              soalText: "10!/8! = ?" },
  { index: 3,  questionKey: "pola",      entryType: "soal",     label: "Pola — n!/(n-2)!",              soalText: "Dari (1)-(3), temukan pola: n!/(n-2)! = ?" },
  { index: 4,  questionKey: "nomor_4",   entryType: "soal",     label: "Nomor 4 — 7!/(3!·4!)",          soalText: "7!/(3!·4!) = ?" },
  { index: 5,  questionKey: "nomor_5",   entryType: "soal",     label: "Nomor 5 — 10!/(2!·8!)",         soalText: "10!/(2!·8!) = ?" },
  { index: 6,  questionKey: "nomor_6",   entryType: "soal",     label: "Nomor 6 — n!/(n-1)!",           soalText: "n!/(n-1)! = ? (dalam bentuk n)" },
  { index: 7,  questionKey: "nomor_7",   entryType: "soal",     label: "Nomor 7 — Cari n (n=7)",        soalText: "Jika n!/(n-2)! = 42, maka n = ?",               aiFeedbackOnly: true },
  { index: 8,  questionKey: "nomor_8",   entryType: "soal",     label: "Nomor 8 — Cari n (n=5)",        soalText: "Jika n!/(n-3)! = 60, maka n = ?",               aiFeedbackOnly: true },
  { index: 9,  questionKey: "diskusi_a", entryType: "refleksi", label: "Diskusi (a) — Alasan",          soalText: "Mengapa cara 'mencoret faktor yang sama' bisa dilakukan secara matematis?", aiFeedbackOnly: true },
  { index: 10, questionKey: "diskusi_b", entryType: "refleksi", label: "Diskusi (b) — Cek Miskonsepsi", soalText: "Apakah 5!/3! = 2! ? Dan apakah 2!×3! = (2×3)! ? Cek kebenarannya!", aiFeedbackOnly: true },
  { index: 11, questionKey: "diskusi_c", entryType: "refleksi", label: "Diskusi (c) — Tips",            soalText: "Tuliskan satu tips cara cepat menyederhanakan ekspresi faktorial.", aiFeedbackOnly: true },
];

const TOTAL_STEPS = STEPS.length;

// ── Grading Helpers ─────────────────────────────────────────────

function normNum(s: string): string {
  return s.replace(/[\s,]/g, "").replace(/^0+(?=\d)/, "");
}

function normPat(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "").replace(/[xX]/g, "×").replace(/\*/g, "×").replace(/\.(?=\()/g, "×").replace(/\^2/g, "²").replace(/−/g, "-");
}

/**
 * Cek jawaban numerik — handle: "56", "8×7", "8x7 = 56", "8*7", dsb.
 */
function checkNumeric(input: string, expected: string): boolean {
  const raw = input.trim();
  if (!raw) return false;
  if (normNum(raw) === normNum(expected)) return true;
  const nums = raw.match(/\d+/g);
  if (nums && nums.some((n) => normNum(n) === normNum(expected))) return true;
  const multMatch = raw.match(/^(\d+)\s*[×xX*·]\s*(\d+)$/);
  if (multMatch && parseInt(multMatch[1], 10) * parseInt(multMatch[2], 10) === parseInt(expected, 10)) return true;
  return false;
}

function checkPolaNMinus2(input: string): boolean {
  const n = normPat(input);
  const parts = n.split("=");
  const valid = ["n×(n-1)", "n(n-1)", "n²-n", "n×n-n"];
  return parts.some((part) => {
    const c = part.replace(/^(pola[:=]?\s*)/, "");
    return valid.some((p) => normPat(p) === c);
  });
}

function checkPolaNMinus1(input: string): boolean {
  const n = normPat(input);
  const parts = n.split("=");
  return parts.some((part) => {
    const c = part.replace(/^(pola[:=]?\s*|=\s*)/, "");
    return c === "n";
  });
}

// ── Spinner ──────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

// ── Feedback Box ─────────────────────────────────────────────────
function FeedbackBox({ text, isCorrect }: { text: string; isCorrect?: boolean }) {
  const bc = isCorrect === false ? "border-[#C44F4F33]" : "border-[#34673933]";
  const bg = isCorrect === false ? "bg-[#C44F4F08]" : "bg-[#34673908]";
  const lc = isCorrect === false ? "text-[#C44F4F]" : "text-[#346739]";
  const ic = isCorrect === false ? "❌" : "💬";
  return (
    <div className={`mt-3 rounded-lg border ${bc} ${bg} p-3`}>
      <p className={`mb-1 text-xs font-medium ${lc}`}>{ic} Feedback Kombi</p>
      <p className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">{text}</p>
    </div>
  );
}

// ── Submit Button ────────────────────────────────────────────────
function SubmitButton({ isChecking, isCorrect, onClick }: { isChecking: boolean; isCorrect: boolean | null; onClick: () => void }) {
  if (isCorrect === true) return null;
  return (
    <div className="flex flex-col items-center gap-2 border-t pt-4 mt-4" style={{ borderColor: `${C.green}26` }}>
      <button type="button" onClick={onClick} disabled={isChecking}
        className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        style={{ backgroundColor: C.green }}>
        {isChecking ? <><Spinner /> Mengecek...</> : "Simpan Jawaban"}
      </button>
    </div>
  );
}

// ── Progress Indicator ───────────────────────────────────────────
function ProgressIndicator({ currentStep, feedbackMap }: { currentStep: number; feedbackMap: Record<number, { text: string; isCorrect: boolean }> }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium mb-3" style={{ color: C.purple }}>Nomor {currentStep + 1} dari {TOTAL_STEPS}</p>
      <div className="flex items-center gap-0.5 flex-wrap">
        {STEPS.map((step) => {
          const fb = feedbackMap[step.index];
          const done = fb?.isCorrect === true;
          const active = step.index === currentStep;
          const locked = step.index > currentStep;
          let dBg = "bg-[#E5E5E0]", dBd = "border-[#C5C5C0]", dTx = "text-[#9E9D99]";
          if (done) { dBg = "bg-[#346739]"; dBd = "border-[#346739]"; dTx = "text-white"; }
          else if (active) { dBg = "bg-white"; dBd = "border-[#346739]"; dTx = "text-[#346739]"; }
          return (
            <React.Fragment key={step.index}>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${dBd} ${dBg} ${dTx} text-[9px] font-bold transition-colors`}
                title={locked ? `Terkunci: ${step.label}` : step.label}>{done ? "✓" : step.index + 1}</div>
              {step.index < TOTAL_STEPS - 1 && <div className={`h-0.5 w-2 rounded transition-colors ${done ? "bg-[#346739]" : "bg-[#E5E5E0]"}`} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Reusable Components ──────────────────────────────────────────
function TextInput({ label, value, onChange, placeholder, id, readOnly = false }:
  { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; id?: string; readOnly?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-slate-500">{label}</label>}
      <input id={id} type="text"
        className={`border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
        style={{ borderColor: C.border }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly} />
    </div>
  );
}

function NumBadge({ n, isCompleted }: { n: number; isCompleted?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: isCompleted ? C.green : C.purple }}>{isCompleted ? "✓" : n}</div>
      <h2 className="text-base font-bold" style={{ color: C.purple }}>Nomor {n}</h2>
    </div>
  );
}

function formatJawaban(raw: string): string {
  return raw.replace(/ \| /g, "\n• ");
}

// ═══════════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AktivitasFaktorial1() {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { text: string; isCorrect: boolean }>>({});

  // Jawaban per nomor
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [pola, setPola] = useState("");
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");
  const [q7n, setQ7n] = useState("");
  const [q7langkah, setQ7langkah] = useState("");
  const [q8n, setQ8n] = useState("");
  const [q8langkah, setQ8langkah] = useState("");
  const [diskA, setDiskA] = useState("");
  const [diskB, setDiskB] = useState("");
  const [diskC, setDiskC] = useState("");

  // Load existing
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/aktivitas-siswa?concept_id=faktorial&activity_key=aktivitas_1");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.hasSubmissions && data.submissions) {
          setHasExistingSubmissions(true);
          const fb: Record<number, { text: string; isCorrect: boolean }> = {};
          for (const step of STEPS) {
            const sub = data.submissions[step.questionKey];
            if (sub) fb[step.index] = { text: `📝 Jawaban kamu:\n${formatJawaban(sub.answer)}\n\n💬 Feedback:\n${sub.feedback ?? "Jawaban sudah tersimpan."}`, isCorrect: sub.isCorrect };
          }
          setFeedbackMap(fb);
          setCurrentStep(TOTAL_STEPS - 1);
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setIsLoadingExisting(false); }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allComplete = currentStep >= TOTAL_STEPS - 1 && feedbackMap[TOTAL_STEPS - 1]?.isCorrect === true;

  // ── Build jawaban per step ─────────────────────────────────────
  function buildJawaban(idx: number): { jawaban: string; alasan: string } {
    switch (idx) {
      case 0:  return { jawaban: q1 || "(belum diisi)", alasan: "8!/6! = 8×7" };
      case 1:  return { jawaban: q2 || "(belum diisi)", alasan: "9!/7! = 9×8" };
      case 2:  return { jawaban: q3 || "(belum diisi)", alasan: "10!/8! = 10×9" };
      case 3:  return { jawaban: pola || "(belum diisi)", alasan: "n!/(n-2)! = n×(n-1)" };
      case 4:  return { jawaban: q4 || "(belum diisi)", alasan: "7!/(3!·4!) = (7×6×5×4!)/(6×4!)" };
      case 5:  return { jawaban: q5 || "(belum diisi)", alasan: "10!/(2!·8!) = (10×9×8!)/(2×8!)" };
      case 6:  return { jawaban: q6 || "(belum diisi)", alasan: "n! = n×(n-1)! → n!/(n-1)! = n" };
      case 7:  return { jawaban: `n=${q7n || "?"} | Langkah: ${q7langkah || "(belum)"}`, alasan: "n(n-1)=42 → n=7" };
      case 8:  return { jawaban: `n=${q8n || "?"} | Langkah: ${q8langkah || "(belum)"}`, alasan: "n(n-1)(n-2)=60 → n=5" };
      case 9:  return { jawaban: diskA || "(belum diisi)", alasan: "" };
      case 10: return { jawaban: diskB || "(belum diisi)", alasan: "" };
      case 11: return { jawaban: diskC || "(belum diisi)", alasan: "" };
      default: return { jawaban: "", alasan: "" };
    }
  }

  // ── Validate per step ──────────────────────────────────────────
  function validateStep(idx: number): string | null {
    const m: Record<number, [string, string]> = {
      0: [q1, "nomor 1"], 1: [q2, "nomor 2"], 2: [q3, "nomor 3"],
      3: [pola, "polanya"], 4: [q4, "nomor 4"], 5: [q5, "nomor 5"], 6: [q6, "nomor 6"],
    };
    if (idx in m) { if (!m[idx][0].trim()) return `Jawab ${m[idx][1]} dulu ya!`; }
    if (idx === 7 && (!q7n.trim() || !q7langkah.trim())) return "Isi nilai n dan langkah berpikir untuk nomor 7 ya!";
    if (idx === 8 && (!q8n.trim() || !q8langkah.trim())) return "Isi nilai n dan langkah berpikir untuk nomor 8 ya!";
    if (idx === 9 && !diskA.trim()) return "Tulis hasil diskusi (a) dulu ya!";
    if (idx === 10 && !diskB.trim()) return "Tulis hasil diskusi (b) dulu ya!";
    if (idx === 11 && !diskC.trim()) return "Tulis tips (c) dulu ya!";
    return null;
  }

  // ── Rule-based grading PER NOMOR ───────────────────────────────
  function gradeByIndex(idx: number): { isCorrect: boolean; feedback: string } | null {
    const fbOk = (msg: string) => ({ isCorrect: true, feedback: msg });
    const fbNo = (msg: string) => ({ isCorrect: false, feedback: msg });
    switch (idx) {
      case 0: return checkNumeric(q1, "56") ? fbOk("🎯 Benar! 8!/6! = 8×7 = 56. Lanjut ke nomor 2!") : fbNo("🤔 8!/6! = (8×7×6!)/6! = 8×7 = ? Coba hitung lagi.");
      case 1: return checkNumeric(q2, "72") ? fbOk("🎯 Tepat! 9!/7! = 9×8 = 72. Lanjut nomor 3!") : fbNo("🤔 9!/7! = (9×8×7!)/7! = 9×8 = ?");
      case 2: return checkNumeric(q3, "90") ? fbOk("🎯 Mantap! 10!/8! = 10×9 = 90. Sekarang temukan polanya!") : fbNo("🤔 10!/8! = (10×9×8!)/8! = 10×9 = ?");
      case 3: return checkPolaNMinus2(pola) ? fbOk("🎯 Keren! n!/(n-2)! = n×(n-1). Lanjut ke nomor 4!") : fbNo("🤔 Perhatikan: 8!/6!=8×7, 9!/7!=9×8, 10!/8!=10×9. Jadi n!/(n-2)! = n × (n-1). Coba lagi.");
      case 4: return checkNumeric(q4, "35") ? fbOk("🎯 Tepat! 7!/(3!·4!) = 35. Lanjut nomor 5!") : fbNo("🤔 7!/(3!·4!) = (7×6×5×4!)/(3×2×1×4!) = 210/6 = ?");
      case 5: return checkNumeric(q5, "45") ? fbOk("🎯 Benar! 10!/(2!·8!) = 45. Lanjut nomor 6!") : fbNo("🤔 10!/(2!·8!) = (10×9×8!)/(2×1×8!) = 90/2 = ?");
      case 6: return checkPolaNMinus1(q6) ? fbOk("🎯 Sempurna! n!/(n-1)! = n. Lanjut ke Bagian C — cari nilai n!") : fbNo("🤔 n! = n×(n-1)!, jadi n!/(n-1)! = n. Tulis jawabannya.");
      default: return null;
    }
  }

  // ── Handle Submit ──────────────────────────────────────────────
  const handleStepSubmit = useCallback(async () => {
    const step = STEPS[currentStep];
    const vMsg = validateStep(currentStep);
    if (vMsg) { setFeedbackMap((p) => ({ ...p, [currentStep]: { text: vMsg, isCorrect: false } })); return; }

    setCheckingStep(currentStep);
    try {
      const { jawaban, alasan } = buildJawaban(currentStep);
      const isAi = step.aiFeedbackOnly === true;
      const ruleResult = !isAi ? gradeByIndex(currentStep) : null;

      const body: Record<string, unknown> = {
        concept_id: "faktorial", activity_key: "aktivitas_1",
        entry_type: step.entryType, question_key: step.questionKey,
        soal: step.soalText, jawaban, alasan,
      };
      if (ruleResult) body.rule_based = { isCorrect: ruleResult.isCorrect, feedback: ruleResult.feedback };

      const res = await fetch("/api/aktivitas-siswa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const effectiveOk = isAi ? true : (data.isCorrect ?? false);
      const fb = { text: data.feedback ?? "Jawaban tersimpan.", isCorrect: effectiveOk };
      setFeedbackMap((p) => ({ ...p, [currentStep]: fb }));
      if (fb.isCorrect && currentStep < TOTAL_STEPS - 1) setCurrentStep((p) => p + 1);
    } catch {
      setFeedbackMap((p) => ({ ...p, [currentStep]: { text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false } }));
    } finally { setCheckingStep(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, q1, q2, q3, pola, q4, q5, q6, q7n, q7langkah, q8n, q8langkah, diskA, diskB, diskC]);

  // ── Render visible steps ───────────────────────────────────────
  function renderVisibleSteps() {
    const els: React.ReactNode[] = [];
    for (let i = 0; i <= currentStep; i++) {
      const fb = feedbackMap[i];
      const done = fb?.isCorrect === true;
      els.push(<div key={`s-${i}`} className={i > 0 ? "mt-8" : ""}>{renderStep(i, done, i === currentStep)}</div>);
    }
    return els;
  }

  function renderStep(idx: number, readOnly: boolean, isCur: boolean) {
    const fb = feedbackMap[idx];
    const showSubmit = isCur && !readOnly;

    const renderNum = (n: number, label: string, val: string, set: (v: string) => void, ph: string) => (
      <div>
        <NumBadge n={n} isCompleted={readOnly} />
        <div className="rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
          <TextInput label={label} value={val} onChange={set} placeholder={ph} readOnly={readOnly} />
        </div>
        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
      </div>
    );

    switch (idx) {
      case 0: return renderNum(1, "(1) 8!/6! =", q1, setQ1, "Tulis jawabanmu (misal: 56 atau 8×7)...");
      case 1: return renderNum(2, "(2) 9!/7! =", q2, setQ2, "Tulis jawabanmu (misal: 72 atau 9×8)...");
      case 2: return renderNum(3, "(3) 10!/8! =", q3, setQ3, "Tulis jawabanmu (misal: 90 atau 10×9)...");

      case 3: return (
        <div>
          <NumBadge n={4} isCompleted={readOnly} />
          <div className="rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
            <p className="text-sm font-semibold" style={{ color: C.green }}>Dari ketiga soal di atas, temukan polanya:</p>
            <TextInput label="n!/(n-2)! =" value={pola} onChange={setPola} placeholder="Tulis polanya, misal: n×(n-1)..." readOnly={readOnly} />
          </div>
          {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
          {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
        </div>
      );

      case 4: return renderNum(5, "(4) 7!/(3!·4!) =", q4, setQ4, "Tulis jawabanmu...");
      case 5: return renderNum(6, "(5) 10!/(2!·8!) =", q5, setQ5, "Tulis jawabanmu...");

      case 6: return (
        <div>
          <NumBadge n={7} isCompleted={readOnly} />
          <div className="rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
            <TextInput label="(6) n!/(n-1)! = … (dalam bentuk n)" value={q6} onChange={setQ6} placeholder="Tulis dalam bentuk n..." readOnly={readOnly} />
          </div>
          {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
          {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
        </div>
      );

      case 7: return (
        <div>
          <NumBadge n={8} isCompleted={readOnly} />
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: C.greenLight }}>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">💡 AI akan memberi feedback proses berpikirmu</p>
            <p className="text-sm text-slate-700">Tulis langkah berpikirmu selengkap mungkin — AI akan mengoreksi dan memberi masukan.</p>
          </div>
          <div className="rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
            <p className="text-sm font-semibold" style={{ color: C.green }}>(7) Jika n!/(n-2)! = 42, maka n = …</p>
            <TextInput label="Nilai n:" value={q7n} onChange={setQ7n} placeholder="n = ..." readOnly={readOnly} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Langkah berpikirku:</label>
              <textarea className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
                style={{ borderColor: C.border }} value={q7langkah} onChange={(e) => setQ7langkah(e.target.value)} placeholder="Tulis langkah berpikirmu di sini..." readOnly={readOnly} />
            </div>
          </div>
          {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
          {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
        </div>
      );

      case 8: return (
        <div>
          <NumBadge n={9} isCompleted={readOnly} />
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: C.greenLight }}>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">💡 AI akan memberi feedback proses berpikirmu</p>
            <p className="text-sm text-slate-700">Tulis langkah berpikirmu selengkap mungkin.</p>
          </div>
          <div className="rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
            <p className="text-sm font-semibold" style={{ color: C.green }}>(8) Jika n!/(n-3)! = 60, maka n = …</p>
            <TextInput label="Nilai n:" value={q8n} onChange={setQ8n} placeholder="n = ..." readOnly={readOnly} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Langkah berpikirku:</label>
              <textarea className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
                style={{ borderColor: C.border }} value={q8langkah} onChange={(e) => setQ8langkah(e.target.value)} placeholder="Tulis langkah berpikirmu di sini..." readOnly={readOnly} />
            </div>
          </div>
          {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
          {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
        </div>
      );

      // Diskusi (a)(b)(c) — indices 9,10,11
      default: {
        const d = idx - 9;
        const labels = [
          "(a) Mengapa cara \"mencoret faktor yang sama\" bisa dilakukan? Apa yang membolehkan hal itu secara matematis?",
          "(b) Apakah 5!/3! sama dengan (5−3)! = 2!? Dan apakah 2!×3! = (2×3)!? Cek kebenarannya!",
          "(c) Tuliskan satu tips cara cepat menyederhanakan ekspresi faktorial yang akan kamu bagikan ke temanmu:",
        ];
        const states = [diskA, diskB, diskC];
        const setters = [setDiskA, setDiskB, setDiskC];
        return (
          <div>
            <NumBadge n={idx + 1} isCompleted={readOnly} />
            <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: C.greenLight }}>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">👥 Diskusi Pasangan — Bagian D</p>
              <p className="text-sm text-slate-700">AI akan memberikan feedback terhadap hasil diskusi kalian.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">{labels[d]}</label>
              <textarea className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[72px] ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
                style={{ borderColor: C.border }} value={states[d]} onChange={(e) => setters[d](e.target.value)} placeholder="Tuliskan diskusi kalian..." readOnly={readOnly} />
            </div>
            {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
            {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
          </div>
        );
      }
    }
  }

  // ── MAIN RENDER ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="border-2 rounded-2xl p-6 space-y-6" style={{ borderColor: C.greenLight }}>

          {/* HEADER */}
          <div>
            <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: C.green }}>
              <Link href="/siswa/activity/faktorial" className="hover:underline font-medium opacity-70">Faktorial</Link>
              <span className="opacity-40">›</span>
              <span className="font-semibold">Aktivitas 1</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.greenLight, color: C.green }}><IconUserSolo /> INDIVIDU & PASANGAN</span>
              <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.green, color: C.white }}><IconClock /> 35 menit</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#C9962B" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C9962B" }} /> Joyful</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2A5A8C" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5A8C" }} /> Mindful</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: C.purple }}>&ldquo;Membangun Pemahaman dari Pola&rdquo;</h1>
          </div>

          {/* PETUNJUK */}
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: C.greenLight }}>
            <p className="text-sm font-bold" style={{ color: C.green }}>📋 Petunjuk</p>
            <p className="text-sm text-slate-700">Faktorial tumbuh sangat cepat. Tapi dalam soal, faktorial sering muncul dalam bentuk pecahan. Jika langsung dihitung semua faktorialnya, butuh waktu lama dan rawan salah.</p>
            <p className="text-sm text-slate-700">Aktivitas ini melatihmu menemukan cara cepat dan cermat menyederhanakan ekspresi faktorial.</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">🎯 Tujuan</p>
            <p className="text-sm text-slate-700">Setelah menyelesaikan aktivitas ini, kamu mampu menjelaskan konsep faktorial sebagai notasi matematis yang muncul secara alami dari Kaidah Perkalian, menghitung nilainya secara efisien, dan memahami alasan 0! = 1 — bukan sekadar menghafalnya.</p>
          </div>

          {/* CONTOH */}
          <div className="rounded-xl p-4" style={{ backgroundColor: C.greenLight }}>
            <p className="text-sm font-bold mb-2" style={{ color: C.green }}>📖 Contoh</p>
            <p className="text-sm text-slate-700">6!/4! = (6×5×4!)/4! = 6×5 = <strong>30</strong></p>
            <p className="text-xs text-slate-500 mt-1">Tanpa menghitung 6! dan 4! secara penuh, hasilnya langsung diperoleh dengan mencoret faktor yang sama.</p>
          </div>

          {/* PROGRESS */}
          <ProgressIndicator currentStep={currentStep} feedbackMap={feedbackMap} />

          {/* LOADING */}
          {isLoadingExisting && <div className="flex items-center justify-center py-12"><Spinner /><span className="ml-3 text-sm text-slate-500">Memuat aktivitas...</span></div>}

          {/* ALREADY COMPLETED */}
          {!isLoadingExisting && hasExistingSubmissions && (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: C.greenLight }}>
              <p className="font-bold text-base" style={{ color: C.green }}>✅ Kamu sudah menyelesaikan aktivitas ini!</p>
              <p className="text-sm text-slate-600 mt-1">Berikut jawaban dan feedback dari AI. Tidak perlu menjawab ulang.</p>
            </div>
          )}

          {/* ALL COMPLETE */}
          {!isLoadingExisting && !hasExistingSubmissions && allComplete && (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: C.greenLight }}>
              <p className="font-bold text-base" style={{ color: C.green }}>🎉 Semua langkah selesai!</p>
              <p className="text-sm text-slate-600 mt-1">Semua jawabanmu sudah tersimpan. Lanjutkan ke materi berikutnya ya!</p>
            </div>
          )}

          {/* SEQUENTIAL STEPS */}
          {!isLoadingExisting && renderVisibleSteps()}

        </div>
      </div>
    </div>
  );
}
