"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

// ── Data ──────────────────────────────────────────────────────────
const BAJU = [
  { id: "baju-1", label: "Baju 1", placeholderSrc: "/illustrations/bajuAsset 1.svg" },
  { id: "baju-2", label: "Baju 2", placeholderSrc: "/illustrations/bajuAsset 3.svg" },
  { id: "baju-3", label: "Baju 3", placeholderSrc: "/illustrations/bajuAsset 4.svg" },
  { id: "baju-4", label: "Baju 4", placeholderSrc: "/illustrations/bajuAsset 7.svg" },
];

const CELANA = [
  { id: "celana-1", label: "Celana 1", placeholderSrc: "/illustrations/bajuAsset 2.svg" },
  { id: "celana-2", label: "Celana 2", placeholderSrc: "/illustrations/bajuAsset 5.svg" },
  { id: "celana-3", label: "Celana 3", placeholderSrc: "/illustrations/bajuAsset 6.svg" },
];

// ── Konstanta ─────────────────────────────────────────────────────
const MIN_ATTEMPTS_BEFORE_INSIGHT = 3;

// ── Helpers ───────────────────────────────────────────────────────
function comboKey(bajuId, celanaId) {
  return `${bajuId}::${celanaId}`;
}

// ── Komponen ──────────────────────────────────────────────────────
export default function OutfitComboPicker() {
  // --- State ---
  const [selectedBaju, setSelectedBaju] = useState(null);       // id baju yang dipilih
  const [selectedCelana, setSelectedCelana] = useState(null);   // id celana yang dipilih
  const [attemptCount, setAttemptCount] = useState(0);           // jumlah percobaan
  const [triedCombos, setTriedCombos] = useState([]);           // riwayat kombinasi unik
  const [duplicateHint, setDuplicateHint] = useState(null);     // pesan "coba pasangan beda"
  const [showInsight, setShowInsight] = useState(false);        // insight sudah muncul?

  // --- Derived ---
  const phase = !selectedBaju ? "baju" : !selectedCelana ? "celana" : "preview";

  // --- Handlers ---
  const handleSelectBaju = useCallback((bajuId) => {
    if (selectedBaju === bajuId) {
      // klik ulang → batalkan pilihan baju (reset ke awal)
      setSelectedBaju(null);
      setSelectedCelana(null);
      return;
    }
    setSelectedBaju(bajuId);
    setSelectedCelana(null);
    setDuplicateHint(null);
  }, [selectedBaju]);

  const handleSelectCelana = useCallback((celanaId) => {
    if (!selectedBaju) return; // safeguard

    const key = comboKey(selectedBaju, celanaId);

    // Cek duplikasi
    if (triedCombos.includes(key)) {
      setDuplicateHint("Coba pasangan yang beda yuk! ✨");
      return;
    }

    setSelectedCelana(celanaId);
    setDuplicateHint(null);

    // Tambah ke riwayat kombinasi unik & increment attempt
    setTriedCombos((prev) => [...prev, key]);
    setAttemptCount((prev) => {
      const next = prev + 1;
      if (next >= MIN_ATTEMPTS_BEFORE_INSIGHT && !showInsight) {
        // pakai setTimeout agar render preview dulu sebelum insight muncul
        setTimeout(() => setShowInsight(true), 600);
      }
      return next;
    });
  }, [selectedBaju, triedCombos, showInsight]);

  const handleTryAnother = useCallback(() => {
    setSelectedBaju(null);
    setSelectedCelana(null);
    setDuplicateHint(null);
  }, []);

  const handleResetAll = useCallback(() => {
    setSelectedBaju(null);
    setSelectedCelana(null);
    setAttemptCount(0);
    setTriedCombos([]);
    setDuplicateHint(null);
    setShowInsight(false);
  }, []);

  // --- Render helpers ---
  function renderItemButton(item, isSelected, isDimmed, onClick, _colorHex) {
    return (
      <button
        key={item.id}
        type="button"
        onClick={onClick}
        disabled={isDimmed}
        className={[
          "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all duration-200",
          isSelected
            ? "border-[#346739] bg-[#DBFFD5] scale-105 shadow-sm"
            : isDimmed
              ? "border-[#34673933] opacity-40 cursor-default"
              : "border-[#34673933] hover:border-[#346739] hover:bg-[#DBFFD540] cursor-pointer",
        ].join(" ")}
      >
        {/* TODO: ganti src dengan path gambar asli */}
        <Image
          src={item.placeholderSrc}
          alt={item.label}
          width={64}
          height={64}
          className="h-16 w-16 rounded-md bg-gray-200 object-contain"
        />
        <span className="text-[11px] font-medium text-[#2C2C2A]">{item.label}</span>
      </button>
    );
  }

  // Progress dots
  function renderProgress() {
    const total = MIN_ATTEMPTS_BEFORE_INSIGHT;
    const current = attemptCount;
    const remaining = total - current;

    if (showInsight) return null;
    if (remaining <= 0) return null;

    return (
      <p className="mt-2 text-center text-xs text-[#34673999]">
        {remaining === 1
          ? "Coba 1 kombinasi lagi ya! 🌟"
          : `Coba ${remaining} kombinasi lagi ya`}{" "}
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
      {/* ── Tahap 1: Pilih Baju ── */}
      <p className="mb-2 text-xs font-medium text-[#663362]">
        {phase === "baju" ? "👇 Pilih baju dulu" : "Baju dipilih:"}
      </p>
      <div className="flex justify-center gap-2">
        {BAJU.map((baju) => {
          const isSelected = selectedBaju === baju.id;
          const isDimmed = !!selectedBaju && !isSelected;
          return renderItemButton(baju, isSelected, isDimmed, () => handleSelectBaju(baju.id));
        })}
      </div>

      {/* ── Tahap 2: Pilih Celana ── */}
      <p
        className={[
          "mb-2 text-xs font-medium text-[#663362] transition-all duration-300",
          phase === "baju" ? "mt-4 opacity-50" : "mt-4",
        ].join(" ")}
      >
        {phase === "baju"
          ? "👆 Pilih baju dulu ya"
          : phase === "celana"
            ? "👇 Pilih celananya"
            : "Celana dipilih:"}
      </p>
      <div className="flex justify-center gap-2">
        {CELANA.map((celana) => {
          const isSelected = selectedCelana === celana.id;
          const isDimmed = phase === "baju" || (!!selectedBaju && !!selectedCelana && !isSelected);
          return renderItemButton(
            celana,
            isSelected,
            isDimmed,
            () => handleSelectCelana(celana.id)
          );
        })}
      </div>

      {/* ── Duplicate hint ── */}
      {duplicateHint && (
        <p className="mt-3 text-center text-xs font-medium text-[#663362] animate-pulse">
          {duplicateHint}
        </p>
      )}

      {/* ── Preview Outfit ── */}
      {phase === "preview" && selectedBaju && selectedCelana && (
        <div className="mt-4 rounded-lg bg-[#DBFFD5] p-3 text-center transition-all duration-300">
          <p className="mb-2 text-xs font-medium text-[#346739]">🎨 Outfit kamu:</p>
          <div className="flex items-center justify-center gap-3">
            {/* TODO: ganti src dengan path gambar asli */}
            <div className="flex flex-col items-center gap-1">
              <Image
                src={BAJU.find((b) => b.id === selectedBaju)?.placeholderSrc}
                alt="baju terpilih"
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg bg-gray-200 object-contain"
              />
              <span className="text-[10px] text-[#346739]">
                {BAJU.find((b) => b.id === selectedBaju)?.label}
              </span>
            </div>
            <span className="text-lg font-bold text-[#346739]">+</span>
            <div className="flex flex-col items-center gap-1">
              <Image
                src={CELANA.find((c) => c.id === selectedCelana)?.placeholderSrc}
                alt="celana terpilih"
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg bg-gray-200 object-contain"
              />
              <span className="text-[10px] text-[#346739]">
                {CELANA.find((c) => c.id === selectedCelana)?.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Progress indicator ── */}
      {renderProgress()}

      {/* ── Insight ── */}
      {showInsight && (
        <div className="mt-4 rounded-lg border border-[#66336233] bg-[#66336208] p-3 transition-all duration-300">
          <p className="mb-1 text-xs font-medium text-[#663362]">💡 Coba deh pikirkan</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Setiap baju bisa kamu pasangkan dengan celana mana aja kan? Coba bayangin
            kalau <b>SEMUA</b> baju dipasangkan ke <b>SEMUA</b> celana... kira-kira
            ada berapa ya total pasangan yang mungkin?
          </p>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {/* Coba pasangan lain — muncul setelah preview & sebelum insight */}
        {phase === "preview" && !showInsight && (
          <button
            type="button"
            onClick={handleTryAnother}
            className="rounded-full border border-[#346739] px-4 py-1.5 text-sm font-medium text-[#346739] transition-colors hover:bg-[#DBFFD5] active:scale-95"
          >
            Coba pasangan lain
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
