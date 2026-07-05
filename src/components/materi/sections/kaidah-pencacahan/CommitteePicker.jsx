"use client";

import { useState, useCallback } from "react";

// ── Data ──────────────────────────────────────────────────────────
const CANDIDATES = [
  { id: "kandidat-1", label: "Kandidat 1" },
  { id: "kandidat-2", label: "Kandidat 2" },
  { id: "kandidat-3", label: "Kandidat 3" },
];

// ── Konstanta ─────────────────────────────────────────────────────
const MIN_ATTEMPTS_BEFORE_INSIGHT = 2;

// ── Helpers ───────────────────────────────────────────────────────
function comboKey(ketuaId, sekretarisId) {
  return `${ketuaId}::${sekretarisId}`;
}

// ── SVG Person Icon (inline default sementara) ────────────────────
function PersonIcon({ className = "" }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      {/* Kepala */}
      <circle
        cx="24"
        cy="15"
        r="8"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
      />
      {/* Badan */}
      <path
        d="M10 44 C10 32, 14 28, 24 28 C34 28, 38 32, 38 44"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Komponen ──────────────────────────────────────────────────────
export default function CommitteePicker() {
  // --- State ---
  const [selectedKetua, setSelectedKetua] = useState(null);        // id ketua
  const [selectedSekretaris, setSelectedSekretaris] = useState(null); // id sekretaris
  const [attemptCount, setAttemptCount] = useState(0);              // jumlah percobaan
  const [triedCombos, setTriedCombos] = useState([]);               // riwayat kombinasi unik
  const [lastKetua, setLastKetua] = useState(null);                 // ketua percobaan sebelumnya
  const [sameKetuaHint, setSameKetuaHint] = useState(false);        // dorongan variasi
  const [showInsight, setShowInsight] = useState(false);            // insight sudah muncul?

  // --- Derived ---
  const phase = !selectedKetua ? "ketua" : !selectedSekretaris ? "sekretaris" : "preview";
  const remainingCandidates = CANDIDATES.filter((c) => c.id !== selectedKetua);

  // --- Handlers ---
  const handleSelectKetua = useCallback((ketuaId) => {
    if (selectedKetua === ketuaId) {
      // klik ulang → batalkan pilihan ketua (reset ke awal)
      setSelectedKetua(null);
      setSelectedSekretaris(null);
      setSameKetuaHint(false);
      return;
    }
    setSelectedKetua(ketuaId);
    setSelectedSekretaris(null);
    setSameKetuaHint(false);
  }, [selectedKetua]);

  const handleSelectSekretaris = useCallback((sekretarisId) => {
    if (!selectedKetua) return; // safeguard

    const key = comboKey(selectedKetua, sekretarisId);

    // Cek duplikasi
    if (triedCombos.includes(key)) {
      return; // silently ignore duplicate, or could add hint
    }

    setSelectedSekretaris(sekretarisId);

    // Tambah ke riwayat kombinasi unik & increment attempt
    setTriedCombos((prev) => [...prev, key]);

    // Track ketua for same-ketua hint
    setLastKetua((prev) => {
      if (prev === selectedKetua && prev !== null) {
        setSameKetuaHint(true);
      } else {
        setSameKetuaHint(false);
      }
      return selectedKetua;
    });

    setAttemptCount((prev) => {
      const next = prev + 1;
      if (next >= MIN_ATTEMPTS_BEFORE_INSIGHT && !showInsight) {
        // pakai setTimeout agar render preview dulu sebelum insight muncul
        setTimeout(() => setShowInsight(true), 700);
      }
      return next;
    });
  }, [selectedKetua, triedCombos, showInsight]);

  const handleTryAnother = useCallback(() => {
    setSelectedKetua(null);
    setSelectedSekretaris(null);
    setSameKetuaHint(false);
  }, []);

  const handleResetAll = useCallback(() => {
    setSelectedKetua(null);
    setSelectedSekretaris(null);
    setAttemptCount(0);
    setTriedCombos([]);
    setLastKetua(null);
    setSameKetuaHint(false);
    setShowInsight(false);
  }, []);

  // --- Render helper: candidate button ---
  function renderCandidateButton(candidate, isSelected, isDimmed, onClick, badgeLabel) {
    return (
      <button
        key={candidate.id}
        type="button"
        onClick={onClick}
        disabled={isDimmed}
        className={[
          "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all duration-200 relative",
          isSelected
            ? "border-[#346739] bg-[#DBFFD5] scale-105 shadow-sm"
            : isDimmed
              ? "border-[#34673933] opacity-40 cursor-default"
              : "border-[#34673933] hover:border-[#346739] hover:bg-[#DBFFD540] cursor-pointer",
        ].join(" ")}
      >
        {/* Badge */}
        {badgeLabel && (
          <span className="absolute -top-2 -right-2 rounded-full bg-[#346739] px-2 py-0.5 text-[10px] font-medium text-white">
            {badgeLabel}
          </span>
        )}
        {/* TODO: ganti src dengan path gambar person asli */}
        <PersonIcon />
        <span
          className={[
            "text-[11px] font-medium",
            isDimmed ? "text-[#2C2C2A] line-through" : "text-[#2C2C2A]",
          ].join(" ")}
        >
          {candidate.label}
        </span>
      </button>
    );
  }

  // --- Progress dots ---
  function renderProgress() {
    const total = MIN_ATTEMPTS_BEFORE_INSIGHT;
    const current = attemptCount;
    const remaining = total - current;

    if (showInsight) return null;
    if (remaining <= 0) return null;

    return (
      <p className="mt-2 text-center text-xs text-[#34673999]">
        {remaining === 1
          ? "Coba 1 susunan lagi ya! 🌟"
          : `Coba ${remaining} susunan lagi ya`}{" "}
        <span className="ml-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={i < current ? "text-[#346739]" : "text-[#34673933]"}
            >
              ●
            </span>
          ))}
        </span>
      </p>
    );
  }

  // ── JSX ─────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-[#34673933] bg-white p-4">
      {/* ── Tahap 1: Pilih Ketua ── */}
      <p className="mb-2 text-xs font-medium text-[#663362]">
        {phase === "ketua" ? "👇 Pilih Ketua" : "Ketua dipilih:"}
      </p>
      <div className="flex justify-center gap-2">
        {CANDIDATES.map((candidate) => {
          const isSelected = selectedKetua === candidate.id;
          const isDimmed = !!selectedKetua && !isSelected;
          return renderCandidateButton(
            candidate,
            isSelected,
            isDimmed,
            () => handleSelectKetua(candidate.id),
            isSelected ? "Ketua" : undefined
          );
        })}
      </div>

      {/* ── Tahap 2: Pilih Sekretaris ── */}
      <div
        className={[
          "transition-all duration-300",
          phase === "ketua" ? "mt-4 opacity-50" : "mt-4",
          phase === "sekretaris" ? "animate-[fadeIn_0.4s_ease-out]" : "",
        ].join(" ")}
      >
        <p className="mb-2 text-xs font-medium text-[#663362]">
          {phase === "ketua"
            ? "👆 Pilih ketua dulu ya"
            : phase === "sekretaris"
              ? "👇 Pilih Sekretaris"
              : "Sekretaris dipilih:"}
        </p>
        <div className="flex justify-center gap-2">
          {/* Tampilkan 2 kandidat sisa (yang bukan ketua) */}
          {remainingCandidates.map((candidate) => {
            const isSelected = selectedSekretaris === candidate.id;
            const isDimmed = phase === "ketua" || (!!selectedKetua && !!selectedSekretaris && !isSelected);
            return renderCandidateButton(
              candidate,
              isSelected,
              isDimmed,
              () => handleSelectSekretaris(candidate.id),
              isSelected ? "Sekretaris" : undefined
            );
          })}
          {/* Placeholder untuk kandidat yang sudah jadi ketua (ditampilkan redup) */}
          {CANDIDATES.filter((c) => c.id === selectedKetua).map((candidate) => (
            <div
              key={`excluded-${candidate.id}`}
              className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-[#34673933] p-2.5 opacity-30 cursor-default"
            >
              <PersonIcon />
              <span className="text-[11px] font-medium text-[#2C2C2A] line-through">
                {candidate.label}
              </span>
              <span className="text-[10px] text-[#346739]">Sudah jadi ketua</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Same-ketua hint ── */}
      {sameKetuaHint && phase === "preview" && !showInsight && (
        <p className="mt-3 text-center text-xs font-medium text-[#663362] animate-pulse">
          Coba mulai dari kandidat lain yuk ✨
        </p>
      )}

      {/* ── Preview Susunan ── */}
      {phase === "preview" && selectedKetua && selectedSekretaris && (
        <div className="mt-4 rounded-lg bg-[#DBFFD5] p-3 text-center transition-all duration-300">
          <p className="mb-2 text-xs font-medium text-[#346739]">📋 Susunan pengurus:</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            <span className="font-medium">Ketua</span> ={" "}
            {CANDIDATES.find((c) => c.id === selectedKetua)?.label},{" "}
            <span className="font-medium">Sekretaris</span> ={" "}
            {CANDIDATES.find((c) => c.id === selectedSekretaris)?.label}
          </p>
        </div>
      )}

      {/* ── Progress indicator ── */}
      {renderProgress()}

      {/* ── Insight ── */}
      {showInsight && (
        <div className="mt-4 rounded-lg border border-[#66336233] bg-[#66336208] p-3 transition-all duration-300">
          <p className="mb-1 text-xs font-medium text-[#663362]">💡 Coba deh pikirkan</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Perhatikan, kalau salah satu kandidat jadi ketua, sekretarisnya cuma bisa dipilih dari
            2 sisanya ya. Coba bayangin polanya kalau diulang buat tiap kandidat sebagai ketua...
            Oh iya, &ldquo;Kandidat 1 jadi Ketua + Kandidat 2 jadi Sekretaris&rdquo; itu susunan yang
            <b> beda</b> lho dengan &ldquo;Kandidat 2 jadi Ketua + Kandidat 1 jadi Sekretaris&rdquo;,
            walau orangnya sama.
          </p>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {/* Coba susunan lain — muncul setelah preview & sebelum insight */}
        {phase === "preview" && !showInsight && (
          <button
            type="button"
            onClick={handleTryAnother}
            className="rounded-full border border-[#346739] px-4 py-1.5 text-sm font-medium text-[#346739] transition-colors hover:bg-[#DBFFD5] active:scale-95"
          >
            Coba susunan lain
          </button>
        )}

        {/* Reset total — muncul setelah insight */}
        {showInsight && (
          <button
            type="button"
            onClick={handleResetAll}
            className="rounded-full border border-[#663362] px-4 py-1.5 text-sm font-medium text-[#663362] transition-colors hover:bg-[#66336210] active:scale-95"
          >
            🔄 Mulai dari awal
          </button>
        )}
      </div>
    </div>
  );
}
