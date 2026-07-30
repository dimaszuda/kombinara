"use client";

import React, { useState, useCallback, useMemo } from "react";

// ── Constants ──────────────────────────────────────────────────────
const PEOPLE = [
  { id: "A", label: "Ari", color: "#346739" },
  { id: "B", label: "Budi", color: "#663362" },
  { id: "C", label: "Cici", color: "#C44F4F" },
  { id: "D", label: "Dani", color: "#E5A83E" },
] as const;

// 6 susunan unik siklis (fix Ari di posisi atas, permutasi 3 lainnya)
// Format: urutan searah jarum jam mulai dari posisi ATAS (index 0)
const UNIQUE_ARRANGEMENTS: string[][] = [
  ["A", "B", "C", "D"],
  ["A", "B", "D", "C"],
  ["A", "C", "B", "D"],
  ["A", "C", "D", "B"],
  ["A", "D", "B", "C"],
  ["A", "D", "C", "B"],
];

const TOTAL_UNIQUE = UNIQUE_ARRANGEMENTS.length; // 6

// ── SVG Layout Constants ───────────────────────────────────────────
const SVG_SIZE = 320;
const CENTER = SVG_SIZE / 2;
const TABLE_RADIUS = 55;
const SEAT_RADIUS = 110;
const AVATAR_RADIUS = 28;

// Posisi 4 kursi: atas, kanan, bawah, kiri
const ANGLES = [-90, 0, 90, 180]; // degrees, 0 = right (east)

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// ── Helpers ────────────────────────────────────────────────────────

/** Rotasi array searah jarum jam sebanyak n langkah */
function rotateClockwise<T>(arr: T[], steps: number = 1): T[] {
  const n = arr.length;
  const s = ((steps % n) + n) % n;
  return [...arr.slice(n - s), ...arr.slice(0, n - s)];
}

/** Rotasi array berlawanan jarum jam sebanyak n langkah */
function rotateCounterClockwise<T>(arr: T[], steps: number = 1): T[] {
  const n = arr.length;
  const s = ((steps % n) + n) % n;
  return [...arr.slice(s), ...arr.slice(0, s)];
}

// ============================================================================
// CircularPermutationSimulation Component
// ============================================================================

export default function CircularPermutationSimulation() {
  const [currentArrangement, setCurrentArrangement] = useState<string[]>(
    UNIQUE_ARRANGEMENTS[0],
  );
  const [rotationCount, setRotationCount] = useState(0); // total rotasi dari original
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "success" | "warning";
  } | null>(null);
  const [viewedArrangements, setViewedArrangements] = useState<Set<number>>(
    new Set([0]),
  ); // indeks susunan unik yang sudah dilihat

  // Cek apakah susunan saat ini adalah susunan unik (bukan hasil rotasi)
  const currentUniqueIndex = useMemo(() => {
    // Temukan indeks susunan unik yang ekuivalen secara siklis dengan currentArrangement
    return UNIQUE_ARRANGEMENTS.findIndex((unique) => {
      // Cek apakah currentArrangement adalah rotasi dari unique
      for (let r = 0; r < 4; r++) {
        const rotated = rotateClockwise(unique, r);
        if (rotated.every((v, i) => v === currentArrangement[i])) {
          return true;
        }
      }
      return false;
    });
  }, [currentArrangement]);

  const allViewed = viewedArrangements.size >= TOTAL_UNIQUE;
  const isRotation = rotationCount % 4 !== 0;

  // ── Handlers ─────────────────────────────────────────────────────

  const handleRotateClockwise = useCallback(() => {
    setCurrentArrangement((prev) => rotateClockwise(prev, 1));
    setRotationCount((prev) => prev + 1);
    setMessage({
      text: "🔄 Meja diputar searah jarum jam. Susunan tempat duduk tetap SAMA — hanya sudut pandang yang berubah!",
      type: "info",
    });
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3500);
  }, []);

  const handleRotateCounterClockwise = useCallback(() => {
    setCurrentArrangement((prev) => rotateCounterClockwise(prev, 1));
    setRotationCount((prev) => prev - 1);
    setMessage({
      text: "🔄 Meja diputar berlawanan jarum jam. Susunan tempat duduk tetap SAMA!",
      type: "info",
    });
    setTimeout(() => setMessage(null), 3500);
  }, []);

  const handleResetRotation = useCallback(() => {
    // Kembali ke susunan unik terdekat (rotasi 0)
    if (currentUniqueIndex >= 0) {
      setCurrentArrangement(UNIQUE_ARRANGEMENTS[currentUniqueIndex]);
      setRotationCount(0);
      setMessage({
        text: "✅ Kembali ke susunan awal. Rotasi di-reset.",
        type: "success",
      });
      setTimeout(() => setMessage(null), 2500);
    }
  }, [currentUniqueIndex]);

  const handleNextArrangement = useCallback(() => {
    const nextIdx = (currentUniqueIndex + 1) % TOTAL_UNIQUE;
    setCurrentArrangement(UNIQUE_ARRANGEMENTS[nextIdx]);
    setRotationCount(0);
    setViewedArrangements((prev) => new Set([...prev, nextIdx]));
    setMessage({
      text: `✨ Susunan berbeda #${nextIdx + 1} dari ${TOTAL_UNIQUE}! Ini benar-benar susunan BARU yang tidak bisa didapat dari rotasi susunan sebelumnya.`,
      type: "success",
    });
    setTimeout(() => setMessage(null), 4000);
  }, [currentUniqueIndex]);

  const handlePrevArrangement = useCallback(() => {
    const prevIdx =
      (currentUniqueIndex - 1 + TOTAL_UNIQUE) % TOTAL_UNIQUE;
    setCurrentArrangement(UNIQUE_ARRANGEMENTS[prevIdx]);
    setRotationCount(0);
    setViewedArrangements((prev) => new Set([...prev, prevIdx]));
    setMessage({
      text: `✨ Susunan berbeda #${prevIdx + 1} dari ${TOTAL_UNIQUE}!`,
      type: "success",
    });
    setTimeout(() => setMessage(null), 4000);
  }, [currentUniqueIndex]);

  const handleJumpTo = useCallback((idx: number) => {
    setCurrentArrangement(UNIQUE_ARRANGEMENTS[idx]);
    setRotationCount(0);
    setViewedArrangements((prev) => new Set([...prev, idx]));
    setMessage({
      text: `📌 Loncat ke susunan berbeda #${idx + 1}.`,
      type: "info",
    });
    setTimeout(() => setMessage(null), 2500);
  }, []);

  const handleResetAll = useCallback(() => {
    setCurrentArrangement(UNIQUE_ARRANGEMENTS[0]);
    setRotationCount(0);
    setViewedArrangements(new Set([0]));
    setMessage(null);
  }, []);

  // ── Render helpers ────────────────────────────────────────────────

  function getPerson(id: string) {
    return PEOPLE.find((p) => p.id === id)!;
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-[#34673933] bg-[#F7FAF6] p-4 md:p-5">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-[#34673926] pb-4">
        <span className="text-xs font-medium text-[#663362]">
          🔵 Simulasi Permutasi Siklis
        </span>
        <h4 className="text-lg font-semibold text-[#346739]">
          Susunan Duduk Melingkar — OSIS Rapat!
        </h4>
        <p className="max-w-2xl text-sm leading-relaxed text-[#2C2C2A]">
          Ari, Budi, Cici, dan Dani duduk mengelilingi meja bundar.
          <b> Coba putar mejanya!</b> Apakah susunannya berubah? Lalu cari{" "}
          <b>semua susunan yang benar-benar berbeda</b>!
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Left: Visual + Controls */}
        <div className="space-y-4">
          {/* SVG Circle Visualization */}
          <div className="flex justify-center rounded-xl border border-[#34673933] bg-white p-4">
            <svg
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              className="h-[300px] w-[300px] sm:h-[320px] sm:w-[320px]"
              aria-label="Visualisasi meja bundar dengan 4 kursi"
            >
              {/* Meja bundar */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={TABLE_RADIUS}
                fill="#F0EDE8"
                stroke="#34673933"
                strokeWidth="2"
              />
              <text
                x={CENTER}
                y={CENTER + 4}
                textAnchor="middle"
                className="fill-[#663362] text-[11px] font-medium"
              >
                MEJA
              </text>

              {/* Kaki meja */}
              <line
                x1={CENTER}
                y1={CENTER + TABLE_RADIUS}
                x2={CENTER}
                y2={CENTER + TABLE_RADIUS + 20}
                stroke="#34673933"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* 4 kursi + orang */}
              {ANGLES.map((angle, i) => {
                const seat = polarToCartesian(
                  CENTER,
                  CENTER,
                  SEAT_RADIUS,
                  angle,
                );
                const person = getPerson(currentArrangement[i]);

                return (
                  <g key={i}>
                    {/* Garis penghubung meja ke kursi */}
                    <line
                      x1={polarToCartesian(CENTER, CENTER, TABLE_RADIUS, angle).x}
                      y1={polarToCartesian(CENTER, CENTER, TABLE_RADIUS, angle).y}
                      x2={seat.x}
                      y2={seat.y}
                      stroke="#34673926"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />

                    {/* Kursi (persegi kecil) */}
                    <rect
                      x={seat.x - 16}
                      y={seat.y + 12}
                      width={32}
                      height={14}
                      rx={4}
                      fill="#F5F0EB"
                      stroke="#34673933"
                      strokeWidth="1"
                    />

                    {/* Avatar orang */}
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      r={AVATAR_RADIUS}
                      fill={person.color}
                      stroke="white"
                      strokeWidth="3"
                      className="transition-all duration-500"
                    />
                    <text
                      x={seat.x}
                      y={seat.y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-white text-sm font-bold"
                    >
                      {person.id}
                    </text>

                    {/* Label nama */}
                    <text
                      x={seat.x}
                      y={seat.y - AVATAR_RADIUS - 8}
                      textAnchor="middle"
                      className="fill-[#2C2C2A] text-[11px] font-medium"
                    >
                      {person.label}
                    </text>
                  </g>
                );
              })}

              {/* Panah rotasi searah jarum jam (di luar lingkaran) */}
              <g>
                <path
                  d={`M ${CENTER + SEAT_RADIUS + 35} ${CENTER - 25} 
                      A 30 30 0 0 1 ${CENTER + SEAT_RADIUS + 35} ${CENTER + 25}`}
                  fill="none"
                  stroke="#34673966"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead-cw)"
                />
                <defs>
                  <marker
                    id="arrowhead-cw"
                    markerWidth="6"
                    markerHeight="6"
                    refX="3"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 6 3, 0 6"
                      fill="#34673966"
                    />
                  </marker>
                </defs>
              </g>
            </svg>
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-[#34673933] bg-white p-4">
            <p className="mb-3 text-xs font-medium text-[#663362]">
              🎮 Kontrol Simulasi
            </p>

            {/* Rotation buttons */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#2C2C2A]">Putar meja:</span>
              <button
                type="button"
                onClick={handleRotateCounterClockwise}
                className="rounded-full border border-[#34673933] bg-white px-3 py-1.5 text-xs font-medium text-[#346739] transition-colors hover:bg-[#34673908] active:scale-95"
              >
                ↺ Berlawanan
              </button>
              <button
                type="button"
                onClick={handleRotateClockwise}
                className="rounded-full border border-[#34673933] bg-white px-3 py-1.5 text-xs font-medium text-[#346739] transition-colors hover:bg-[#34673908] active:scale-95"
              >
                Searah ↻
              </button>
              {isRotation && (
                <button
                  type="button"
                  onClick={handleResetRotation}
                  className="rounded-full border border-[#66336233] bg-[#66336208] px-3 py-1.5 text-xs font-medium text-[#663362] transition-colors hover:bg-[#66336215] active:scale-95"
                >
                  Reset Rotasi
                </button>
              )}
            </div>

            {/* Navigation between unique arrangements */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#2C2C2A]">
                Susunan berbeda:
              </span>
              <button
                type="button"
                onClick={handlePrevArrangement}
                className="rounded-full border border-[#34673933] bg-white px-3 py-1.5 text-xs font-medium text-[#346739] transition-colors hover:bg-[#34673908] active:scale-95"
              >
                ← Sebelumnya
              </button>
              <span className="text-sm font-bold text-[#346739]">
                {currentUniqueIndex >= 0
                  ? currentUniqueIndex + 1
                  : "?"}{" "}
                / {TOTAL_UNIQUE}
              </span>
              <button
                type="button"
                onClick={handleNextArrangement}
                className="rounded-full bg-[#346739] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95"
              >
                Selanjutnya →
              </button>
            </div>

            {/* Rotation counter */}
            {rotationCount !== 0 && (
              <div className="mt-3 rounded-lg border border-[#E5A83E33] bg-[#E5A83E08] px-3 py-2">
                <p className="text-xs text-[#B07D20]">
                  ⚠️ Meja sudah diputar {Math.abs(rotationCount)}×. Susunan ini{" "}
                  <b>sama</b> dengan susunan unik #{currentUniqueIndex >= 0 ? currentUniqueIndex + 1 : "?"} —
                  hanya sudut pandang yang berbeda!
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg border px-4 py-3 ${
                message.type === "success"
                  ? "border-[#34673933] bg-[#DBFFD5]/20"
                  : message.type === "warning"
                    ? "border-[#E5A83E33] bg-[#E5A83E08]"
                    : "border-[#66336233] bg-[#66336208]"
              }`}
            >
              <p
                className={`text-sm leading-relaxed ${
                  message.type === "success"
                    ? "text-[#346739]"
                    : message.type === "warning"
                      ? "text-[#B07D20]"
                      : "text-[#663362]"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Summary — shown after all 6 viewed */}
          {allViewed && (
            <div className="rounded-xl border-2 border-[#346739] bg-[#DBFFD5]/20 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <h4 className="text-lg font-bold text-[#346739]">
                  Kamu sudah melihat semua {TOTAL_UNIQUE} susunan berbeda!
                </h4>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-[#2C2C2A]">
                Dari 4 orang yang duduk melingkar, hanya ada{" "}
                <b>{TOTAL_UNIQUE} susunan yang benar-benar berbeda</b>.
                Mari kita pahami kenapa:
              </p>

              {/* All 6 arrangements gallery */}
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {UNIQUE_ARRANGEMENTS.map((arr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleJumpTo(idx)}
                    className={`rounded-lg border px-3 py-2 text-center text-xs transition-colors ${
                      currentUniqueIndex === idx && rotationCount === 0
                        ? "border-[#346739] bg-[#34673915]"
                        : "border-[#34673926] bg-white hover:border-[#34673966]"
                    }`}
                  >
                    <span className="font-mono font-bold tracking-[0.15em] text-[#346739]">
                      {arr.join(" → ")}
                    </span>
                  </button>
                ))}
              </div>

              {/* Explanation */}
              <div className="space-y-3 rounded-lg border border-[#66336233] bg-[#66336208] p-4">
                <p className="text-sm font-semibold text-[#663362]">
                  📝 Rumus Permutasi Siklis
                </p>
                <div className="space-y-2 text-sm leading-relaxed text-[#2C2C2A]">
                  <p>
                    <b>Sekretaris keliru!</b> 4! = 24 adalah untuk susunan{" "}
                    <b>berjajar (linear)</b>, bukan melingkar.
                  </p>
                  <p>
                    <b>Ketua OSIS benar!</b> Dalam susunan melingkar, rotasi
                    meja <b>tidak menghasilkan susunan baru</b>. Satu susunan
                    siklis ekuivalen dengan 4 rotasi linear.
                  </p>
                  <p>
                    Rumus permutasi siklis untuk n orang:
                  </p>
                  <p className="rounded-lg bg-white px-4 py-3 text-center font-mono text-base font-bold text-[#346739]">
                    P<sub>siklis</sub> = (n − 1)! = (4 − 1)! = 3! = 6
                  </p>
                  <p>
                    Atau dengan logika: <b>24 susunan linear ÷ 4 rotasi = 6
                    susunan siklis</b>. Setiap susunan melingkar punya 4
                    &quot;versi putar&quot; yang sebenarnya sama!
                  </p>
                </div>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleResetAll}
                className="mt-4 rounded-full border border-[#34673933] bg-white px-6 py-3 text-sm font-medium text-[#346739] transition-colors hover:bg-[#34673908] active:scale-95"
              >
                🔄 Coba Lagi dari Awal
              </button>
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <aside className="space-y-4">
          {/* Key insight */}
          <div className="rounded-xl border border-[#66336233] bg-white p-4">
            <p className="text-xs font-medium text-[#663362]">
              💡 Insight Kunci
            </p>
            <div className="mt-2 space-y-2 text-xs leading-relaxed text-[#2C2C2A]">
              <p>
                <b>Linear (berjajar):</b> 4! ={" "}
                <span className="font-bold text-[#C44F4F]">24</span> cara
              </p>
              <p>
                <b>Siklis (melingkar):</b> (4−1)! ={" "}
                <span className="font-bold text-[#346739]">6</span> cara
              </p>
              <p className="rounded-lg bg-[#DBFFD5]/30 px-2 py-1.5">
                <b>Kenapa?</b> Rotasi tidak dihitung sebagai susunan baru.
                Satu susunan melingkar = 4 susunan linear.
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-xl border border-[#34673933] bg-white p-4">
            <p className="text-xs font-medium text-[#346739]">
              ✅ Checklist Eksplorasi
            </p>
            <div className="mt-2 space-y-1.5">
              {UNIQUE_ARRANGEMENTS.map((arr, idx) => {
                const viewed = viewedArrangements.has(idx);
                const isCurrent =
                  currentUniqueIndex === idx && rotationCount === 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleJumpTo(idx)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                      isCurrent
                        ? "bg-[#34673915]"
                        : "hover:bg-[#34673908]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        viewed
                          ? "bg-[#DBFFD5] text-[#346739]"
                          : "bg-[#34673915] text-[#34673966]"
                      }`}
                    >
                      {viewed ? "✓" : idx + 1}
                    </span>
                    <span
                      className={`font-mono tracking-[0.1em] ${isCurrent ? "font-bold text-[#346739]" : "text-[#2C2C2A]"}`}
                    >
                      {arr.join(" → ")}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] text-[#346739]">
                        ← sekarang
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-3 border-t border-[#34673915] pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#2C2C2A]">Susunan ditemukan</span>
                <span className="font-bold text-[#346739]">
                  {viewedArrangements.size} / {TOTAL_UNIQUE}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#34673915]">
                <div
                  className="h-full rounded-full bg-[#346739] transition-all duration-500"
                  style={{
                    width: `${(viewedArrangements.size / TOTAL_UNIQUE) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Formula hint */}
          <div className="rounded-xl border border-[#34673933] bg-[#F8FBF7] p-4">
            <p className="text-xs font-medium text-[#346739]">
              📐 Rumus
            </p>
            <p className="mt-2 text-center font-mono text-lg font-bold text-[#346739]">
              P<sub>siklis</sub> = (n − 1)!
            </p>
            <p className="mt-1 text-center text-[11px] text-[#34673999]">
              n = jumlah orang
            </p>
            <div className="mt-2 space-y-1 rounded-lg bg-white px-3 py-2 text-[11px] leading-relaxed text-[#2C2C2A]">
              <p>
                <b>n = 4:</b> (4−1)! = 3! = 6 ✓
              </p>
              <p>
                <b>n = 5:</b> (5−1)! = 4! = 24
              </p>
              <p>
                <b>n = 6:</b> (6−1)! = 5! = 120
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
