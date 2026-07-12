"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  LEVEL_META,
  SOAL_DATA,
  SoalKepahaman,
} from "@/components/materi/sections/kaidah-pencacahan/contoh-soal-perkalian/latihan";
import { useAssesmentLock } from "@/components/dashboard/assesment-lock-context";
import { useDraftSaver } from "@/hooks/useDraftSaver";
import type { AnswerPair as DraftAnswerPair } from "@/hooks/useDraftSaver";

// ── Config ─────────────────────────────────────────────────────────────────────────────────
const DURASI_DETIK = 120 * 60; // 120 menit

const PETUNJUK = [
  "Baca setiap soal dengan teliti sebelum menjawab.",
  'Tuliskan langkah-langkah cara perhitungan secara lengkap pada kolom "Cara Hitung".',
  'Tuliskan hasil akhir jawaban pada kolom "Jawaban Akhir".',
  "Pastikan semua soal telah dijawab sebelum menekan tombol Submit.",
  "Asesmen ini hanya dapat dikerjakan satu kali dan tidak dapat dibatalkan setelah di-submit.",
];

const BOLEH = ["Menggunakan coretan / kertas buram", "Menghitung secara manual"];
const TIDAK_BOLEH = [
  "Membuka tab atau aplikasi lain",
  "Bekerja sama dengan teman",
  "Menggunakan kalkulator",
];

// ── Types ─────────────────────────────────────────────────────────────────────────────────
type Phase = "intro" | "active" | "submitted";
type AnswerPair = { cara_hitung: string; jawaban_akhir: string };

// ── Helpers ───────────────────────────────────────────────────────────────────────────────
function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function timerColor(secs: number) {
  if (secs > 10 * 60) return "#346739";
  if (secs > 3 * 60) return "#d97706";
  return "#b91c1c";
}

function isAnswered(a: AnswerPair) {
  return a.cara_hitung.trim().length > 0 || a.jawaban_akhir.trim().length > 0;
}

// ── Page ────────────────────────────────────────────────────────────────────────────────────
export default function AsesmenKaidahPencacahanPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<AnswerPair[]>(
    SOAL_DATA.map(() => ({ cara_hitung: "", jawaban_akhir: "" }))
  );
  const [timeLeft, setTimeLeft] = useState(DURASI_DETIK);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedRef = useRef(false);
  const handleSubmitRef = useRef<() => void>(() => {});
  const { setLocked } = useAssesmentLock();

  // ── Draft auto-save hook ──────────────────────────────────────────────────────
  const { isRestoring, saveAllDrafts } = useDraftSaver({
    answers,
    moduleSlug: "kaidah-pencacahan",
    questionCount: SOAL_DATA.length,
    onRestore: useCallback((restored: DraftAnswerPair[]) => {
      setAnswers(restored);
    }, []),
  });

  useEffect(() => {
    setLocked(phase === "active");
    return () => setLocked(false);
  }, [phase, setLocked]);

  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // Trigger submit via ref (auto-submit on timer expiry)
          setTimeout(() => handleSubmitRef.current(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  function handleStart() { setPhase("active"); }

  async function handleSubmit() {
    // Prevent double-submit
    if (hasSubmittedRef.current || isSubmitting) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Save drafts one last time before submitting
      await saveAllDrafts();

      // Build the answers payload
      const answersPayload = answers.map((a, i) => ({
        question_number: i + 1,
        cara_mengerjakan: a.cara_hitung,
        jawaban_akhir: a.jawaban_akhir,
      }));

      const res = await fetch("/api/asesmen-formatif/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_slug: "kaidah-pencacahan",
          answers: answersPayload,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Gagal menyimpan jawaban");
      }

      setPhase("submitted");
    } catch (err: any) {
      setSubmitError(err.message ?? "Gagal menyimpan jawaban. Silakan coba lagi.");
      hasSubmittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }

  // Keep ref in sync so timer auto-submit can call the latest handleSubmit
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  function updateAnswer(idx: number, field: keyof AnswerPair, value: string) {
    setAnswers((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  }

  if (phase === "intro") {
    if (isRestoring) {
      return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "#6b8f6d" }}>Memulihkan jawaban yang tersimpan...</p>
        </div>
      );
    }
    return <IntroScreen onStart={handleStart} />;
  }
  if (phase === "submitted") return <SubmittedScreen answers={answers} />;
  return (
    <ActiveScreen
      answers={answers}
      timeLeft={timeLeft}
      onUpdateAnswer={updateAnswer}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
}

// ── Intro Screen ────────────────────────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#346739", opacity: 0.7, margin: "0 0 6px" }}>
        Asesmen Formatif
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a3d1c", margin: "0 0 28px" }}>
        Kaidah Pencacahan
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "⏱", label: "Durasi", value: "120 Menit", color: "#346739", bg: "#DBFFD5" },
          { icon: "📄", label: "Jumlah Soal", value: "10 Soal", color: "#346739", bg: "#DBFFD5" },
          { icon: "✍️", label: "Jenis", value: "Uraian", color: "#663362", bg: "#f3e8f2" },
          { icon: "🔒", label: "Pengerjaan", value: "Sekali", color: "#663362", bg: "#f3e8f2" },
        ].map((info) => (
          <div key={info.label} style={{ backgroundColor: info.bg, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{info.icon}</div>
            <div style={{ fontSize: 10, color: info.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>{info.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: info.color }}>{info.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#f8fdf8", borderRadius: 12, border: "1px solid #d4e8d4", padding: "18px 20px", marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#346739", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Petunjuk Pengerjaan
        </h3>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {PETUNJUK.map((p, i) => (
            <li key={i} style={{ fontSize: 14, color: "#3b5e3d", lineHeight: 1.7, marginBottom: i < PETUNJUK.length - 1 ? 6 : 0 }}>{p}</li>
          ))}
        </ol>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        <RuleBox title="Yang Diperbolehkan" items={BOLEH} type="allowed" />
        <RuleBox title="Yang Tidak Diperbolehkan" items={TIDAK_BOLEH} type="forbidden" />
      </div>

      <div style={{ textAlign: "center" }}>
        <button onClick={onStart} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 40px", backgroundColor: "#346739", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>
          Siap, Mulai Asesmen
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <p style={{ marginTop: 10, fontSize: 12, color: "#9aada0" }}>Timer akan mulai berjalan setelah kamu klik tombol di atas.</p>
      </div>
    </div>
  );
}

function RuleBox({ title, items, type }: { title: string; items: string[]; type: "allowed" | "forbidden" }) {
  const ok = type === "allowed";
  const color = ok ? "#346739" : "#b91c1c";
  const bg = ok ? "#f0faf0" : "#fff5f5";
  const border = ok ? "#c3e6c3" : "#fecaca";
  return (
    <div style={{ backgroundColor: bg, borderRadius: 12, border: `1.5px solid ${border}`, padding: "14px 16px" }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, color, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 13, color, display: "flex", gap: 8, marginBottom: i < items.length - 1 ? 8 : 0, alignItems: "flex-start" }}>
            <span style={{ fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{ok ? "✓" : "✕"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Active Screen ─────────────────────────────────────────────────────────────────────────────
interface ActiveScreenProps {
  answers: AnswerPair[];
  timeLeft: number;
  onUpdateAnswer: (idx: number, field: keyof AnswerPair, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

function ActiveScreen({ answers, timeLeft, onUpdateAnswer, onSubmit, isSubmitting, submitError }: ActiveScreenProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const color = timerColor(timeLeft);
  const pct = (timeLeft / DURASI_DETIK) * 100;
  const answeredCount = answers.filter(isAnswered).length;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 48px" }}>
      {/* Sticky Timer */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#fff", borderBottom: "1.5px solid #e2ede2", paddingTop: 10, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#346739", opacity: 0.7, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Asesmen Formatif — Kaidah Pencacahan
            </p>
            <p style={{ fontSize: 12, color: "#6b8f6d", margin: "2px 0 0" }}>{answeredCount}/{SOAL_DATA.length} soal terjawab</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, backgroundColor: color + "18", borderRadius: 10, padding: "8px 14px", border: `1.5px solid ${color}30` }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 20, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div style={{ height: 3, backgroundColor: "#e2ede2", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", backgroundColor: color, borderRadius: 99, width: `${pct}%`, transition: "width 1s linear, background-color 0.5s" }} />
        </div>
      </div>

      {/* Question Navigator */}
      <div style={{ marginBottom: 24, backgroundColor: "#f8fdf8", borderRadius: 12, border: "1px solid #e2ede2", padding: "14px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Navigasi Soal</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SOAL_DATA.map((soal, i) => {
            const answered = isAnswered(answers[i]);
            return (
              <a key={soal.question_number} href={`#soal-${i + 1}`} title={LEVEL_META[soal.level].label}
                style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, textDecoration: "none", backgroundColor: answered ? "#346739" : "#fff", color: answered ? "#fff" : "#346739", border: `2px solid ${answered ? "#346739" : "#d4e8d4"}`, transition: "all 0.15s ease" }}>
                {i + 1}
              </a>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          {Object.entries(LEVEL_META).map(([key, meta]) => (
            <span key={key} style={{ fontSize: 11, fontWeight: 600, backgroundColor: meta.bg, color: meta.text, padding: "2px 8px", borderRadius: 99 }}>{meta.label}</span>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SOAL_DATA.map((soal, i) => {
          const answered = isAnswered(answers[i]);
          const lm = LEVEL_META[soal.level];
          return (
            <div key={soal.question_number} id={`soal-${i + 1}`}
              style={{ backgroundColor: "#fff", borderRadius: 14, border: `2px solid ${answered ? "#346739" : "#e2ede2"}`, overflow: "hidden", transition: "border-color 0.2s ease" }}>
              <div style={{ height: 4, backgroundColor: answered ? "#346739" : "#e2ede2", transition: "background-color 0.2s ease" }} />
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", backgroundColor: "#346739", flexShrink: 0 }}>
                    {soal.question_number}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: lm.bg, color: lm.text, padding: "3px 10px", borderRadius: 99 }}>{lm.label}</span>
                  {answered && <span style={{ fontSize: 11, color: "#346739", fontWeight: 700, marginLeft: "auto" }}>✓ Terjawab</span>}
                </div>
                <p style={{ fontSize: 15, color: "#2C2C2A", lineHeight: 1.75, margin: "0 0 18px", fontWeight: 500 }}>{soal.question}</p>
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor={`cara-hitung-${i}`} style={{ fontSize: 12, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Cara Hitung</label>
                  <textarea
                    id={`cara-hitung-${i}`}
                    value={answers[i].cara_hitung}
                    onChange={(e) => onUpdateAnswer(i, "cara_hitung", e.target.value)}
                    placeholder="Tuliskan langkah-langkah perhitunganmu di sini..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed text-[#2C2C2A] resize-y border border-[#d4e8d4] bg-[#fafffe] placeholder:text-[#b0c4b1] focus:outline-none focus:ring-2 focus:ring-[#346739]/30 focus:border-[#346739] transition-all"
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label htmlFor={`jawaban-akhir-${i}`} style={{ fontSize: 12, fontWeight: 700, color: "#663362", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Jawaban Akhir</label>
                  <input
                    id={`jawaban-akhir-${i}`}
                    type="text"
                    value={answers[i].jawaban_akhir}
                    onChange={(e) => onUpdateAnswer(i, "jawaban_akhir", e.target.value)}
                    placeholder="Tulis jawaban akhirmu di sini..."
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-[#2C2C2A] border border-[#e8d4e8] bg-[#fdf8fd] placeholder:text-[#c4a8c2] focus:outline-none focus:ring-2 focus:ring-[#663362]/25 focus:border-[#663362] transition-all"
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1.5px solid #e2ede2" }}>
        {!showConfirm ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#6b8f6d", marginBottom: 12 }}>Sudah yakin dengan jawabanmu? Asesmen hanya bisa dikerjakan satu kali.</p>
            <button onClick={() => setShowConfirm(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", backgroundColor: "#346739", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Submit Jawaban
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", backgroundColor: "#fff5f5", borderRadius: 12, border: "1.5px solid #fecaca", padding: "20px 24px" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#b91c1c", margin: "0 0 6px" }}>Konfirmasi Submit</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
              Kamu telah menjawab <strong style={{ color: "#1a3d1c" }}>{answeredCount}</strong> dari <strong>{SOAL_DATA.length}</strong> soal. Setelah di-submit, jawaban tidak dapat diubah.
            </p>
            {submitError && (
              <p style={{ fontSize: 12, color: "#b91c1c", margin: "0 0 12px", backgroundColor: "#fff2f0", padding: "8px 12px", borderRadius: 8 }}>{submitError}</p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setShowConfirm(false)} disabled={isSubmitting} style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid #d1d5db", backgroundColor: "#fff", fontSize: 14, fontWeight: 600, color: "#6b7280", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}>Batal</button>
              <button onClick={onSubmit} disabled={isSubmitting} style={{ padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "#b91c1c", fontSize: 14, fontWeight: 700, color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Mengirim..." : "Ya, Submit Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Submitted Screen ────────────────────────────────────────────────────────────────────────
function SubmittedScreen({ answers }: { answers: AnswerPair[] }) {
  const answeredCount = answers.filter(isAnswered).length;
  const allAnswered = answeredCount === SOAL_DATA.length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 48px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#DBFFD5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#346739" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a3d1c", margin: "0 0 8px" }}>Jawaban Terkirim!</h1>
        <p style={{ fontSize: 15, color: "#5a7d5c", margin: 0, lineHeight: 1.7 }}>
          {allAnswered ? "Semua soal telah kamu jawab. Terima kasih telah menyelesaikan asesmen ini!" : `Kamu menjawab ${answeredCount} dari ${SOAL_DATA.length} soal. Jawaban telah dikirimkan.`}
        </p>

        {/* Status: jawaban tersimpan & sedang dikoreksi */}
        <div style={{ marginTop: 20, backgroundColor: "#f0faf0", borderRadius: 10, border: "1px solid #c3e6c3", padding: "14px 18px", textAlign: "left" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#346739" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a3d1c", margin: "0 0 4px" }}>Jawaban sudah tersimpan</p>
              <p style={{ fontSize: 12, color: "#5a7d5c", margin: 0, lineHeight: 1.6 }}>
                Jawabanmu sedang dilakukan proses koreksi. Kembali lagi ke menu asesmen setelah beberapa jam untuk mendapatkan nilai hasil asesmen.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px" }}>
        Ringkasan Jawaban
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, pointerEvents: "none" }}>
        {SOAL_DATA.map((soal, i) => {
          const answered = isAnswered(answers[i]);
          return (
            <div key={soal.question_number}>
              {answers[i].cara_hitung.trim() && (
                <div style={{ backgroundColor: "#f8fdf8", borderRadius: "8px 8px 0 0", border: "1px solid #d4e8d4", borderBottom: "none", padding: "10px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Cara Hitung</p>
                  <p style={{ fontSize: 13, color: "#3b5e3d", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{answers[i].cara_hitung}</p>
                </div>
              )}
              <div style={answers[i].cara_hitung.trim() ? { borderRadius: "0 0 12px 12px", overflow: "hidden" } : {}}>
                <SoalKepahaman
                  question_number={soal.question_number}
                  level={soal.level}
                  question={soal.question}
                  answer={soal.answer}
                  hideCheckButton={true}
                  value={answered ? answers[i].jawaban_akhir || "—" : "—"}
                  onChange={() => {}}
                  checked={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link href="/siswa/ulangan" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", backgroundColor: "#346739", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          ← Kembali ke Daftar Asesmen
        </Link>
      </div>
    </div>
  );
}
