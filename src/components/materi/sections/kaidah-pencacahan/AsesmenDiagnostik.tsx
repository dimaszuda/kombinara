"use client";

import React, { useCallback, useRef, useState } from "react";
import { RichText } from "@/components/shared/RichText";
import { useAsesmenDiagnostik } from "@/hooks/useAsesmenDiagnostik";
import type { GradingResult } from "@/lib/data/asesmen-diagnostik";

const inputBase =
    "border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent px-1 py-0.5 transition-colors placeholder:text-gray-300 text-sm";

function BlockHeader({
    label,
    title,
    subtitle,
}: {
    label: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex flex-col gap-0.5 pl-3 py-1 border-l-4 border-[#663362]">
            <span className="text-xs font-bold uppercase tracking-widest text-[#663362]">
                {label}
            </span>
            <h3 className="kp-greeting">{title}</h3>
            <p className="text-xs text-gray-400 italic">{subtitle}</p>
        </div>
    );
}

function QuestionNumber({ n }: { n: number }) {
    return (
        <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mt-0.5">
            {n}
        </span>
    );
}

function QuestionRow({
    number,
    children,
}: {
    number: number;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <QuestionNumber n={number} />
            <div className="flex flex-col gap-2 flex-1 min-w-0">{children}</div>
        </div>
    );
}

function RadioGroup({
    name,
    value,
    onChange,
}: {
    name: string;
    value?: string;
    onChange?: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                <input
                    type="radio"
                    name={name}
                    value="ya"
                    checked={value === "ya"}
                    onChange={() => onChange?.("ya")}
                    className="accent-blue-500"
                />
                Ya
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                <input
                    type="radio"
                    name={name}
                    value="tidak"
                    checked={value === "tidak"}
                    onChange={() => onChange?.("tidak")}
                    className="accent-blue-500"
                />
                Tidak
            </label>
        </div>
    );
}

function AnswerTextarea({
    placeholder = "Tulis jawabanmu di sini...",
    value,
    onChange,
}: {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}) {
    return (
        <textarea
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none transition-colors placeholder:text-gray-300"
        />
    );
}

function MathInputRow({
    latex,
    value,
    onChange,
}: {
    latex: string;
    value?: string;
    onChange?: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <RichText>{latex}</RichText>
            <input
                type="text"
                inputMode="numeric"
                placeholder="..."
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                className={`${inputBase} w-16 text-center`}
            />
        </div>
    );
}

interface AsesmenDiagnostikProps {
    onPass?: (passed: boolean) => void;
}

/** Format detik ke "X menit Y detik" */
function formatCooldown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m} menit ${s} detik`;
    return `${s} detik`;
}

export default function AsesmenDiagnostik({ onPass }: AsesmenDiagnostikProps) {
    const {
        answers,
        setAnswer,
        submitAnswers,
        isSubmitting,
        lastResult,
        reset,
        isLoadingDraft,
        diagnosticStatus,
        isLoadingStatus,
        cooldownRemaining,
    } = useAsesmenDiagnostik();

    const [showResult, setShowResult] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Helper: dapatkan jawaban untuk sub-soal tertentu
    const getAnswer = useCallback(
        (q: number, sub: number) => answers[`${q}-${sub}`] ?? "",
        [answers]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setShowResult(false);

            // Bangun merged answers: state + FormData (radio buttons)
            const merged = { ...answers };
            if (formRef.current) {
                const fd = new FormData(formRef.current);
                for (const [key, val] of fd.entries()) {
                    const match = key.match(/^q(\d+)-(\d+)$/);
                    if (match && typeof val === "string" && val.trim() !== "") {
                        merged[key] = val;
                    }
                }
            }

            const result: GradingResult = await submitAnswers(merged);
            setShowResult(true);

            if (result.isPass) {
                onPass?.(true);
            }
        },
        [answers, submitAnswers, onPass]
    );

    const handleRetry = useCallback(() => {
        if (cooldownRemaining !== null && cooldownRemaining > 0) return;
        reset();
        setShowResult(false);
        onPass?.(false);
    }, [reset, onPass, cooldownRemaining]);

    // ── Loading state ───────────────────────────────────────────────
    if (isLoadingStatus || isLoadingDraft) {
        return (
            <article
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "32px",
                    border: "1px solid #346739",
                }}
                className="flex flex-col items-center gap-4"
            >
                <div className="w-8 h-8 border-4 border-gray-200 border-t-[#346739] rounded-full animate-spin" />
                <p style={{ fontSize: "14px", color: "#888" }}>
                    Memuat asesmen diagnostik...
                </p>
            </article>
        );
    }

    // ── SUDAH LULUS: tampilkan hanya ringkasan skor ─────────────────
    const hasPassed =
        diagnosticStatus?.status === "passed" ||
        (lastResult?.isPass ?? false);

    // ── COOLDOWN: status failed & timer masih jalan (contoh: setelah reload) ──
    const isInCooldown =
        diagnosticStatus?.status === "failed" &&
        cooldownRemaining !== null &&
        cooldownRemaining > 0;

    if (isInCooldown) {
        return (
            <article
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "32px",
                    border: "1px solid #346739",
                }}
                className="flex flex-col gap-6"
            >
                <h2 className="kp-subtitle" style={{ color: "#346739" }}>
                    Asesmen Diagnostik
                </h2>
                <CooldownScreen cooldownRemaining={cooldownRemaining} />
            </article>
        );
    }

    // ── SUDAH LULUS: tampilkan hanya ringkasan skor ─────────────────
    if (hasPassed && lastResult) {
        return (
            <article
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "32px",
                    border: "1px solid #346739",
                }}
                className="flex flex-col gap-6"
            >
                <h2 className="kp-subtitle" style={{ color: "#346739" }}>
                    Asesmen Diagnostik
                </h2>
                <PassedSummary result={lastResult} />
            </article>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <article
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "32px",
                    border: "1px solid #346739",
                }}
                className="flex flex-col gap-8"
            >
                <h2 className="kp-subtitle" style={{ color: "#346739" }}>
                    Asesmen Diagnostik
                </h2>

                <div className="flex flex-col gap-3">
                    <blockquote className="kp-quote">
                        <strong>Untuk Guru:</strong> Laksanakan asesmen ini sebelum
                        memulai pembelajaran Kaidah Pencacahan — idealnya di akhir
                        pertemuan sebelumnya atau 15 menit pertama pertemuan pertama.
                        Hasilnya bukan untuk nilai, melainkan untuk memetakan kesiapan
                        siswa dan menentukan apakah perlu jeda review prasyarat.
                    </blockquote>
                    <blockquote className="kp-quote">
                        <strong>Untuk Siswa:</strong> Kerjakan soal berikut secara
                        mandiri dan jujur dalam waktu 15 menit. Tidak ada nilai yang
                        diambil dari sini — ini hanya untuk membantu gurumu memahami
                        kesiapanmu belajar.
                    </blockquote>
                </div>

                {/* ═══════════════ Blok A ═══════════════ */}
                <section className="flex flex-col gap-5">
                    <BlockHeader
                        label="Blok A"
                        title="Operasi dan Penyederhanaan Bilangan"
                        subtitle="Prasyarat: Faktorial dan Rumus Permutasi/Kombinasi"
                    />

                    <QuestionRow number={1}>
                        <p className="kp-body">
                            Hitunglah hasil perkalian berikut tanpa kalkulator.
                        </p>
                        <div className="flex flex-col gap-3 pl-1">
                            <MathInputRow
                                latex={"$6 \\times 5 \\times 4 = $"}
                                value={getAnswer(1, 0)}
                                onChange={(v) => setAnswer(1, 0, v)}
                            />
                            <MathInputRow
                                latex={"$\\dfrac{7\\times6\\times5}{3\\times2\\times1} = $"}
                                value={getAnswer(1, 1)}
                                onChange={(v) => setAnswer(1, 1, v)}
                            />
                            <MathInputRow
                                latex={
                                    "$\\dfrac{10\\times9\\times8\\times7}{4\\times3\\times2\\times1} = $"
                                }
                                value={getAnswer(1, 2)}
                                onChange={(v) => setAnswer(1, 2, v)}
                            />
                        </div>
                    </QuestionRow>

                    <QuestionRow number={2}>
                        <p className="kp-body">
                            Sederhanakan pecahan berikut — tidak perlu dihitung sampai
                            habis, <strong>cukup coret yang sama</strong>.
                        </p>
                        <div className="flex flex-col gap-3 pl-1">
                            <MathInputRow
                                latex={
                                    "$\\dfrac{8\\times7\\times6\\times5\\times4\\times3\\times2\\times1}{5\\times4\\times3\\times2\\times1} = $"
                                }
                                value={getAnswer(2, 0)}
                                onChange={(v) => setAnswer(2, 0, v)}
                            />
                            <MathInputRow
                                latex={
                                    "$\\dfrac{8\\times7\\times6\\times5!}{5!\\times3\\times2\\times1} = $"
                                }
                                value={getAnswer(2, 1)}
                                onChange={(v) => setAnswer(2, 1, v)}
                            />
                        </div>
                    </QuestionRow>
                </section>

                {/* ═══════════════ Blok B ═══════════════ */}
                <section className="flex flex-col gap-5">
                    <BlockHeader
                        label="Blok B"
                        title="Persamaan Sederhana"
                        subtitle="Prasyarat: Mencari nilai n pada soal permutasi"
                    />

                    <QuestionRow number={3}>
                        <p className="kp-body">
                            Temukan nilai <em>n</em> (bilangan bulat positif) yang
                            memenuhi:
                        </p>
                        <div className="flex flex-col gap-3 pl-1">
                            <MathInputRow
                                latex={"$n\\times(n-1)=20 \\Rightarrow n = $"}
                                value={getAnswer(3, 0)}
                                onChange={(v) => setAnswer(3, 0, v)}
                            />
                            <MathInputRow
                                latex={
                                    "$n\\times(n-1)\\times(n-2)=60 \\Rightarrow n = $"
                                }
                                value={getAnswer(3, 1)}
                                onChange={(v) => setAnswer(3, 1, v)}
                            />
                        </div>
                    </QuestionRow>

                    <QuestionRow number={4}>
                        <div className="flex items-center gap-2 flex-wrap">
                            <RichText>
                                {"Jika $n - r = 2$ dan $n = 7$, maka nilai $r$ adalah"}
                            </RichText>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="..."
                                name="q4-0"
                                value={getAnswer(4, 0)}
                                onChange={(e) => setAnswer(4, 0, e.target.value)}
                                className={`${inputBase} w-16 text-center`}
                            />
                        </div>
                    </QuestionRow>
                </section>

                {/* ═══════════════ Blok C ═══════════════ */}
                <section className="flex flex-col gap-5">
                    <BlockHeader
                        label="Blok C"
                        title="Konsep Himpunan"
                        subtitle='Prasyarat: Memahami "memilih dari sekumpulan objek" pada kombinasi'
                    />

                    <QuestionRow number={5}>
                        <RichText>
                            {"Diketahui himpunan $A = \\{1, 2, 3, 4, 5\\}$."}
                        </RichText>
                        <div className="flex flex-col gap-3 pl-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <RichText>
                                    {"Berapa banyak anggota himpunan $A$?"}
                                </RichText>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="..."
                                    name="q5-0"
                                    value={getAnswer(5, 0)}
                                    onChange={(e) => setAnswer(5, 0, e.target.value)}
                                    className={`${inputBase} w-16 text-center`}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <RichText>
                                    {
                                        "Sebutkan semua himpunan bagian (subset) dari $\\{a, b\\}$:"
                                    }
                                </RichText>
                                <input
                                    type="text"
                                    placeholder="Contoh: {}, {a}, {b}, {a,b}"
                                    name="q5-1"
                                    value={getAnswer(5, 1)}
                                    onChange={(e) => setAnswer(5, 1, e.target.value)}
                                    className={`${inputBase} w-full max-w-sm`}
                                />
                            </div>
                        </div>
                    </QuestionRow>

                    <QuestionRow number={6}>
                        <RichText>
                            {
                                "Apakah $\\{\\text{Ari, Budi}\\}$ dan $\\{\\text{Budi, Ari}\\}$ adalah himpunan yang sama atau berbeda?"
                            }
                        </RichText>
                        <div className="flex flex-col gap-2 pl-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-20 flex-shrink-0">
                                    Jawaban:
                                </span>
                                <div className="flex gap-4">
                                    {["Sama", "Berbeda"].map((opt) => (
                                        <label
                                            key={opt}
                                            className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700"
                                        >
                                            <input
                                                type="radio"
                                                name="q6-0"
                                                value={opt.toLowerCase()}
                                                checked={getAnswer(6, 0) === opt.toLowerCase()}
                                                onChange={(e) => setAnswer(6, 0, e.target.value)}
                                                className="accent-blue-500"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-20 flex-shrink-0">
                                    Alasan:
                                </span>
                                <input
                                    type="text"
                                    placeholder="Tulis alasanmu..."
                                    name="q6-1"
                                    value={getAnswer(6, 1)}
                                    onChange={(e) => setAnswer(6, 1, e.target.value)}
                                    className={`${inputBase} flex-1`}
                                />
                            </div>
                        </div>
                    </QuestionRow>
                </section>

                {/* ═══════════════ Blok D ═══════════════ */}
                <section className="flex flex-col gap-5">
                    <BlockHeader
                        label="Blok D"
                        title='Logika "Atau / Dan"'
                        subtitle="Prasyarat: Aturan penjumlahan dan perkalian"
                    />

                    <QuestionRow number={7}>
                        <p className="kp-body">
                            Lengkapi tabel berikut berdasarkan intuisimu:
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#B8E6BC] border-b border-gray-200">
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 w-3/5">
                                            Situasi
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600 w-1/5">
                                            Operasi
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600 w-1/5">
                                            Hasil
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        "Athar ingin membeli minuman berupa jus atau susu. Di kantin sekolah tersedia 3 jenis jus (jeruk, mangga, jambu) dan 2 jenis susu (putih, cokelat). Athar hanya akan membeli 1 minuman saja. Berapa banyak pilihan minuman yang dapat dipilih Athar?",
                                        "Ada 3 pilihan baju dan 4 pilihan celana. Berapa kombinasi pakaian yang bisa dikenakan?",
                                        "Ada 5 rute dari A ke B dan 3 rute dari B ke C. Berapa cara dari A ke C?",
                                    ].map((situation, i) => (
                                        <tr
                                            key={i}
                                            className={i % 2 === 1 ? "bg-gray-50/60" : ""}
                                        >
                                            <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                                                {situation}
                                            </td>
                                            <td className="px-4 py-3 text-center border-t border-gray-100">
                                                <select
                                                    name={`q7-op-${i}`}
                                                    value={getAnswer(7, i + 3)}
                                                    onChange={(e) => setAnswer(7, i + 3, e.target.value)}
                                                    className={`${inputBase} w-16 text-center mx-auto block cursor-pointer appearance-none text-gray-500`}
                                                    style={{ color: getAnswer(7, i + 3) ? undefined : "#d1d5db" }}
                                                >
                                                    <option value="" disabled className="text-gray-300">
                                                        + / ×
                                                    </option>
                                                    <option value="+" className="text-gray-700">
                                                        +
                                                    </option>
                                                    <option value="×" className="text-gray-700">
                                                        ×
                                                    </option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-center border-t border-gray-100">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="..."
                                                    name={`q7-${i}`}
                                                    value={getAnswer(7, i)}
                                                    onChange={(e) => setAnswer(7, i, e.target.value)}
                                                    className={`${inputBase} w-14 text-center mx-auto block`}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </QuestionRow>

                    <QuestionRow number={8}>
                        <p className="kp-body">
                            Dari situasi di atas, apa pola yang kamu temukan?
                        </p>
                        <div className="flex flex-col gap-2 pl-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 flex-shrink-0">
                                    Kata &quot;Atau&quot; &rarr; operasi
                                </span>
                                <input
                                    type="text"
                                    placeholder="..."
                                    name="q8-0"
                                    value={getAnswer(8, 0)}
                                    onChange={(e) => setAnswer(8, 0, e.target.value)}
                                    className={`${inputBase} w-32`}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 flex-shrink-0">
                                    Kata &quot;Dan&quot; &rarr; operasi
                                </span>
                                <input
                                    type="text"
                                    placeholder="..."
                                    name="q8-1"
                                    value={getAnswer(8, 1)}
                                    onChange={(e) => setAnswer(8, 1, e.target.value)}
                                    className={`${inputBase} w-32`}
                                />
                            </div>
                        </div>
                    </QuestionRow>
                </section>

                {/* ═══════════════ Blok E ═══════════════ */}
                <section className="flex flex-col gap-5">
                    <BlockHeader
                        label="Blok E"
                        title="Membaca Soal Cerita"
                        subtitle="Prasyarat: Menafsirkan konteks soal kombinatorika"
                    />

                    <p className="text-xs text-gray-400 italic -mt-2 pl-9">
                        Jawab pertanyaan berikut tanpa menghitung — cukup analisis
                        situasinya.
                    </p>

                    <QuestionRow number={9}>
                        <p className="kp-body">
                            Dari 10 siswa akan dipilih Ketua, Sekretaris, dan Bendahara
                            OSIS. Apakah susunan &quot;Ari=Ketua, Nina=Sekretaris&quot; sama
                            dengan &quot;Nina=Ketua, Ari=Sekretaris&quot;?
                        </p>
                        <div className="flex flex-col gap-3 pl-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-20 flex-shrink-0">
                                    Jawaban:
                                </span>
                                <RadioGroup
                                    name="q9-0"
                                    value={getAnswer(9, 0)}
                                    onChange={(v) => setAnswer(9, 0, v)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-gray-500">Mengapa?</span>
                                <AnswerTextarea
                                    value={getAnswer(9, 1)}
                                    onChange={(v) => setAnswer(9, 1, v)}
                                />
                            </div>
                        </div>
                    </QuestionRow>

                    <QuestionRow number={10}>
                        <p className="kp-body">
                            Dari 10 siswa akan dipilih 3 orang sebagai perwakilan lomba
                            cerdas cermat. Apakah &quot;Rani, Dedi, Revan&quot; sama dengan
                            &quot;Dedi, Revan, Rani&quot;?
                        </p>
                        <div className="flex flex-col gap-3 pl-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-20 flex-shrink-0">
                                    Jawaban:
                                </span>
                                <RadioGroup
                                    name="q10-0"
                                    value={getAnswer(10, 0)}
                                    onChange={(v) => setAnswer(10, 0, v)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-gray-500">
                                    Apa perbedaan mendasar antara soal nomor 9 dan 10?
                                </span>
                                <AnswerTextarea
                                    value={getAnswer(10, 1)}
                                    onChange={(v) => setAnswer(10, 1, v)}
                                />
                            </div>
                        </div>
                    </QuestionRow>
                </section>

                {/* ═══════════════ Submit & Feedback ═══════════════ */}
                <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-100">
                    {!showResult ? (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "14px 32px",
                                borderRadius: "30px",
                                fontSize: "16px",
                                fontWeight: 600,
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                background: isSubmitting ? "#a0c4a0" : "#346739",
                                color: "white",
                                border: "none",
                                opacity: isSubmitting ? 0.7 : 1,
                                transition: "background-color 0.2s",
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Memeriksa jawaban...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    ) : (
                        <ResultFeedback
                            result={lastResult!}
                            onRetry={handleRetry}
                            cooldownRemaining={cooldownRemaining}
                        />
                    )}
                </div>
            </article>
        </form>
    );
}

/**
 * Layar cooldown saat siswa gagal dan harus menunggu sebelum mencoba lagi.
 * Ditampilkan saat reload halaman ketika timer cooldown masih berjalan.
 */
function CooldownScreen({
    cooldownRemaining,
}: {
    cooldownRemaining: number;
}) {
    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div
                style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    border: "6px solid #dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    background: "#fef2f2",
                }}
            >
                <span
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#dc2626",
                        lineHeight: 1,
                    }}
                >
                    ⏳
                </span>
            </div>

            <div className="text-center">
                <p
                    style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#dc2626",
                        margin: 0,
                    }}
                >
                    Belum Lulus, Tetap Semangat! 💪
                </p>
                <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>
                    Silakan coba lagi dalam{" "}
                    <strong style={{ color: "#dc2626" }}>
                        {formatCooldown(cooldownRemaining)}
                    </strong>
                </p>
            </div>

            <p style={{ fontSize: "13px", color: "#888" }}>
                📚 Pelajari dulu materi prasyarat agar lebih siap.
            </p>
        </div>
    );
}

/**
 * Ringkasan untuk siswa yang sudah lulus — hanya skor, tanpa soal.
 */
function PassedSummary({ result }: { result: GradingResult }) {
    const { correctCount, totalQuestions, score } = result;

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Score ring */}
            <div
                style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    border: "6px solid #346739",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    background: "#f0faf0",
                }}
            >
                <span
                    style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#346739",
                        lineHeight: 1,
                    }}
                >
                    {score}
                </span>
                <span style={{ fontSize: "11px", color: "#888" }}>dari 100</span>
            </div>

            <div className="text-center">
                <p
                    style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#346739",
                        margin: 0,
                    }}
                >
                    Selamat! Kamu Lulus! 🎉
                </p>
                <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>
                    {correctCount} dari {totalQuestions} nomor benar — Kamu siap
                    melanjutkan ke materi berikutnya.
                </p>
            </div>
        </div>
    );
}

/**
 * Komponen feedback hasil grading.
 * Dipisahkan agar tidak membebani main component.
 */
function ResultFeedback({
    result,
    onRetry,
    cooldownRemaining,
}: {
    result: GradingResult;
    onRetry: () => void;
    cooldownRemaining: number | null;
}) {
    const { isPass, correctCount, totalQuestions, score, questions, feedback } =
        result;

    const isInCooldown = cooldownRemaining !== null && cooldownRemaining > 0;

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Score ring */}
            <div
                style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    border: `6px solid ${isPass ? "#346739" : "#dc2626"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    background: isPass ? "#f0faf0" : "#fef2f2",
                }}
            >
                <span
                    style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: isPass ? "#346739" : "#dc2626",
                        lineHeight: 1,
                    }}
                >
                    {score}
                </span>
                <span style={{ fontSize: "11px", color: "#888" }}>dari 100</span>
            </div>

            {/* Status */}
            <div className="text-center">
                <p
                    style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: isPass ? "#346739" : "#dc2626",
                        margin: 0,
                    }}
                >
                    {isPass
                        ? "Selamat! Kamu Lulus! 🎉"
                        : "Belum Lulus, Tetap Semangat! 💪"}
                </p>
                <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>
                    {correctCount} dari {totalQuestions} nomor benar
                    {isPass
                        ? " — Kamu siap melanjutkan ke materi berikutnya."
                        : ` — Butuh minimal 7 benar. Kurang ${7 - correctCount} nomor lagi.`}
                </p>
            </div>

            {/* Feedback tindak lanjut (hanya jika belum lulus & ada feedback) */}
            {!isPass && feedback && (
                <div
                    style={{
                        width: "100%",
                        maxWidth: "460px",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        background: "#fffbeb",
                        border: "1px solid #fcd34d",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        color: "#92400e",
                    }}
                >
                    <span style={{ fontWeight: 600 }}>💡 Tindak lanjut: </span>
                    {feedback}
                </div>
            )}

            {/* Pesan belajar prasyarat (hanya jika belum lulus) */}
            {!isPass && (
                <div
                    style={{
                        width: "100%",
                        maxWidth: "460px",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        background: "#eff6ff",
                        border: "1px solid #93c5fd",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        color: "#1e40af",
                        textAlign: "center",
                    }}
                >
                    <span style={{ fontWeight: 600 }}>📚 Sebelum mencoba lagi: </span>
                    pelajari dulu materi prasyarat agar lebih siap.
                </div>
            )}

            {/* Per-nomor breakdown */}
            <div className="w-full max-w-md flex flex-col gap-1.5 mt-2">
                {questions.map((q) => (
                    <div
                        key={q.number}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: q.correct ? "#f0faf0" : "#fef2f2",
                            fontSize: "13px",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 600,
                                color: q.correct ? "#346739" : "#dc2626",
                                minWidth: "60px",
                            }}
                        >
                            Nomor {q.number}
                        </span>
                        <span
                            style={{ color: q.correct ? "#346739" : "#dc2626" }}
                        >
                            {q.correct ? "✓ Benar" : "✗ Salah"}
                        </span>
                        {!q.correct && (
                            <span
                                style={{
                                    fontSize: "11px",
                                    color: "#999",
                                    marginLeft: "auto",
                                }}
                            >
                                {q.details.filter((d) => !d.correct).length} sub
                                salah
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Retry / cooldown section (only if not passed) */}
            {!isPass && (
                <div className="flex flex-col items-center gap-2">
                    {isInCooldown ? (
                        <>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "#888",
                                    margin: 0,
                                }}
                            >
                                ⏳ Silakan coba lagi dalam{" "}
                                <strong style={{ color: "#dc2626" }}>
                                    {formatCooldown(cooldownRemaining!)}
                                </strong>
                            </p>
                            <button
                                type="button"
                                disabled
                                style={{
                                    padding: "10px 24px",
                                    borderRadius: "24px",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: "not-allowed",
                                    background: "#e5e7eb",
                                    color: "#9ca3af",
                                    border: "2px solid #d1d5db",
                                }}
                            >
                                Coba Lagi
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onRetry}
                            style={{
                                padding: "10px 24px",
                                borderRadius: "24px",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                background: "white",
                                color: "#346739",
                                border: "2px solid #346739",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f0faf0";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "white";
                            }}
                        >
                            Coba Lagi
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}