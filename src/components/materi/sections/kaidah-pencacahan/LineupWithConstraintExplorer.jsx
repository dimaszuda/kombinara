"use client";

import { useState, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const MALES = ["L1", "L2", "L3", "L4"];
const FEMALES = ["P1", "P2", "P3"];

function isMaleId(id) { return id?.startsWith("L"); }

// ── PersonAvatar ──────────────────────────────────────────────────────────────
// Warna: hijau #346739 untuk laki-laki, ungu #663362 untuk perempuan.
// Ini konsisten dengan palet komponen lain (hijau = aksi/laki, ungu = label/perempuan).
function PersonAvatar({ id, selected = false, onClick, size = "md", disabled = false }) {
  const male = isMaleId(id);
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        ${sizeClass} rounded-full border-2 font-bold transition-all duration-200
        ${selected
          ? male
            ? "border-[#346739] bg-[#346739] text-white shadow-md scale-110"
            : "border-[#663362] bg-[#663362] text-white shadow-md scale-110"
          : male
            ? "border-[#346739]/50 bg-[#DBFFD5] text-[#346739] hover:border-[#346739]"
            : "border-[#663362]/50 bg-[#663362]/10 text-[#663362] hover:border-[#663362]"
        }
        ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer active:scale-95"}
      `}
    >
      {id}
    </button>
  );
}

// ── GrupChip ──────────────────────────────────────────────────────────────────
// Representasi visual 3 perempuan yang sudah bersatu jadi 1 entitas.
function GrupChip({ selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-1 rounded-xl border-2 border-[#663362] px-2 py-1.5
        transition-all duration-200 cursor-pointer active:scale-95
        ${selected
          ? "bg-[#663362] shadow-md scale-105"
          : "bg-[#663362]/8 hover:bg-[#663362]/15"
        }
      `}
    >
      {FEMALES.map((pid) => (
        <span
          key={pid}
          className={`
            flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold
            ${selected
              ? "border-white/40 bg-white/20 text-white"
              : "border-[#663362]/40 bg-[#663362]/10 text-[#663362]"
            }
          `}
        >
          {pid}
        </span>
      ))}
    </button>
  );
}

// ── LineupSlot ────────────────────────────────────────────────────────────────
function LineupSlot({ index, occupant, onSlotClick, isTarget = false, small = false }) {
  const isEmpty = !occupant;
  const isGrup = occupant === "GRUP";
  const male = !isGrup && isMaleId(occupant);
  const h = small
    ? "h-10 w-10"
    : "h-14 w-12";

  if (isEmpty) {
    return (
      <button
        type="button"
        onClick={onSlotClick}
        className={`
          flex ${h} flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${isTarget
            ? "border-[#346739] bg-[#346739]/10 scale-105"
            : "border-dashed border-[#34673933] hover:border-[#346739]/40 hover:bg-[#34673905]"
          }
        `}
      >
        <span className="text-xs text-[#2C2C2A]/30">{index + 1}</span>
      </button>
    );
  }

  if (isGrup) {
    return (
      <button
        type="button"
        onClick={onSlotClick}
        className={`flex ${h} flex-col items-center justify-center rounded-xl border-2 border-[#663362] bg-[#663362]/8 cursor-pointer hover:opacity-80 transition-all`}
      >
        {!small && <span className="text-[10px] leading-none text-[#663362]/50">{index + 1}</span>}
        <span className="text-xs font-bold text-[#663362]">Grup</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSlotClick}
      className={`
        flex ${h} flex-col items-center justify-center rounded-xl border-2 cursor-pointer hover:opacity-80 transition-all
        ${male
          ? "border-[#346739] bg-[#DBFFD5] text-[#346739]"
          : "border-[#663362] bg-[#663362]/10 text-[#663362]"
        }
      `}
    >
      {!small && <span className="text-[10px] leading-none opacity-40">{index + 1}</span>}
      <span className={`${small ? "text-xs" : "text-sm"} font-bold`}>{occupant}</span>
    </button>
  );
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function LineupWithConstraintExplorer() {
  // Slot utama: 5 entitas (L1–L4 + GRUP)
  const [slots, setSlots] = useState(Array(5).fill(null));
  const [selected, setSelected] = useState(null);
  const [completed, setCompleted] = useState(0);

  // Grup internal
  const [grupExpanded, setGrupExpanded] = useState(false);
  const [grupSlots, setGrupSlots] = useState(Array(3).fill(null));
  const [grupSelected, setGrupSelected] = useState(null);
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);

  // Closing
  const [showClosing, setShowClosing] = useState(false);

  // Derived
  const allFilled = slots.every((s) => s !== null);
  const grupInRoster = FEMALES.filter((id) => !grupSlots.includes(id));
  const grupAllFilled = grupSlots.every((s) => s !== null);

  // Tampilkan closing saat kedua kondisi terpenuhi (urutan bebas)
  useEffect(() => {
    if (completed >= 1 && hasExpandedOnce && !showClosing) {
      setShowClosing(true);
    }
  }, [completed, hasExpandedOnce, showClosing]);

  // ── Slot utama ───────────────────────────────────────────────────────────
  function handleRosterClick(id) {
    setSelected((prev) => (prev === id ? null : id));
  }

  function handleSlotClick(i) {
    if (slots[i]) {
      setSlots((prev) => { const n = [...prev]; n[i] = null; return n; });
      setSelected(null);
    } else if (selected) {
      setSlots((prev) => { const n = [...prev]; n[i] = selected; return n; });
      setSelected(null);
    }
  }

  function handleSave() {
    if (!allFilled) return;
    setCompleted((c) => c + 1);
    setSlots(Array(5).fill(null));
    setSelected(null);
    setGrupExpanded(false);
  }

  // ── Grup internal ────────────────────────────────────────────────────────
  function toggleGrupExpanded() {
    const next = !grupExpanded;
    setGrupExpanded(next);
    if (next) {
      setHasExpandedOnce(true);
      setGrupSlots(Array(3).fill(null));
      setGrupSelected(null);
    }
  }

  function handleGrupRosterClick(id) {
    setGrupSelected((prev) => (prev === id ? null : id));
  }

  function handleGrupSlotClick(i) {
    if (grupSlots[i]) {
      setGrupSlots((prev) => { const n = [...prev]; n[i] = null; return n; });
      setGrupSelected(null);
    } else if (grupSelected) {
      setGrupSlots((prev) => { const n = [...prev]; n[i] = grupSelected; return n; });
      setGrupSelected(null);
    }
  }

  // ── Reset total ──────────────────────────────────────────────────────────
  function handleReset() {
    setSlots(Array(5).fill(null));
    setSelected(null);
    setCompleted(0);
    setGrupExpanded(false);
    setGrupSlots(Array(3).fill(null));
    setGrupSelected(null);
    setHasExpandedOnce(false);
    setShowClosing(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl bg-white p-4 border border-[#34673933] space-y-5">
      {/* Header */}
      <p className="text-xs font-medium text-[#663362]">
        🧑‍🤝‍🧑 Eksplorasi: Susun Posisi Foto dengan Syarat
      </p>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-[#346739]/50 bg-[#DBFFD5]" />
          <span className="font-medium text-[#346739]">Laki-laki: L1–L4</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-[#663362]/50 bg-[#663362]/10" />
          <span className="font-medium text-[#663362]">Perempuan (Grup): P1–P3</span>
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[#2C2C2A]/70">
        Karena perempuan harus berdampingan, ketiganya sudah dijadikan 1 unit &ldquo;Grup Perempuan&rdquo;.
        Ada 5 entitas yang perlu disusun: 4 laki-laki + 1 Grup. Klik seseorang dari daftar,
        lalu klik slot kosong untuk menempatkan. Klik slot terisi untuk mengembalikannya.
      </p>

      {/* Roster */}
      <div className="flex flex-wrap items-center gap-2">
        {MALES.map((id) => {
          if (slots.includes(id)) return null;
          return (
            <PersonAvatar
              key={id}
              id={id}
              selected={selected === id}
              onClick={() => handleRosterClick(id)}
            />
          );
        })}

        {!slots.includes("GRUP") && (
          <GrupChip
            selected={selected === "GRUP"}
            onClick={() => handleRosterClick("GRUP")}
          />
        )}

        {/* Buka Grup — selalu terlihat */}
        <button
          type="button"
          onClick={toggleGrupExpanded}
          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors
            ${grupExpanded
              ? "border-[#663362] bg-[#663362] text-white"
              : "border-[#663362]/40 text-[#663362] hover:bg-[#663362]/10"
            }
          `}
        >
          {grupExpanded ? "✕ Tutup Grup" : "🔍 Buka Grup Perempuan"}
        </button>
      </div>

      {selected && (
        <p className="text-xs text-[#663362]">
          Memilih <strong>{selected === "GRUP" ? "Grup Perempuan" : selected}</strong> — klik slot kosong di bawah ↓
        </p>
      )}

      {/* 5 Slots */}
      <div className="flex flex-wrap gap-2">
        {slots.map((occ, i) => (
          <LineupSlot
            key={i}
            index={i}
            occupant={occ}
            isTarget={!!selected && !occ}
            onSlotClick={() => handleSlotClick(i)}
          />
        ))}
      </div>

      {allFilled && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#663362] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#50274d] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#346739]"
          >
            Simpan susunan ini →
          </button>
        </div>
      )}

      {completed > 0 && (
        <p className="text-center text-xs text-[#2C2C2A]/40">{completed} susunan tersimpan</p>
      )}

      {/* ── Panel Grup Internal ──────────────────────────────────────────── */}
      {grupExpanded && (
        <div className="rounded-xl border-2 border-[#663362] bg-[#663362]/5 p-3 space-y-3">
          <p className="text-xs font-semibold text-[#663362]">
            Di dalam Grup Perempuan — urutan internal:
          </p>
          <p className="text-xs leading-relaxed text-[#2C2C2A]/70">
            3 perempuan di dalam grup bisa bertukar posisi satu sama lain. Susun mereka ke
            3 sub-slot di bawah!{" "}
            <span className="italic">
              (Sub-slot lebih kecil untuk menunjukkan ini adalah lapisan &ldquo;di dalam&rdquo; grup)
            </span>
          </p>

          {/* Internal roster */}
          <div className="flex gap-2 min-h-[2rem] items-center">
            {grupInRoster.map((pid) => (
              <PersonAvatar
                key={pid}
                id={pid}
                size="sm"
                selected={grupSelected === pid}
                onClick={() => handleGrupRosterClick(pid)}
              />
            ))}
            {grupAllFilled && (
              <span className="text-xs font-medium text-[#663362]">✓ Tersusun!</span>
            )}
          </div>

          {grupSelected && (
            <p className="text-xs text-[#663362]">
              Memilih <strong>{grupSelected}</strong> — klik sub-slot di bawah ↓
            </p>
          )}

          {/* 3 sub-slots */}
          <div className="flex gap-2">
            {grupSlots.map((occ, i) => (
              <LineupSlot
                key={i}
                index={i}
                occupant={occ}
                small
                isTarget={!!grupSelected && !occ}
                onSlotClick={() => handleGrupSlotClick(i)}
              />
            ))}
          </div>

          {grupAllFilled && (
            <p className="text-xs font-medium text-[#663362]">
              ✓ Satu susunan internal tersimpan. Klik sub-slot untuk mengubah dan coba kombinasi berbeda!
            </p>
          )}

          <p className="text-xs italic text-[#663362]/60">
            💡 Perhatikan: ini baru urutan di <em>dalam</em> grup. Di luar, 5 slot utama juga punya banyak susunan tersendiri!
          </p>
        </div>
      )}

      {/* ── Teks penutup ────────────────────────────────────────────────── */}
      {showClosing && (
        <div className="rounded-xl border border-[#34673933] bg-[#F4FBF4] p-4 space-y-3">
          <p className="text-sm font-semibold text-[#346739]">Menarik ya! 🎉</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Waktu perempuan dianggap 1 kelompok, ada{" "}
            <span className="font-semibold text-[#663362]">5 &ldquo;tempat&rdquo;</span>{" "}
            yang perlu disusun. Tapi di dalam kelompok itu sendiri, urutan 3 perempuannya
            juga bisa macam-macam. Coba pikirin — gimana cara menggabungkan dua hal ini
            jadi total posisi berfoto yang mungkin?
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-[#346739] bg-white px-5 py-2 text-sm font-medium text-[#346739] transition-colors hover:bg-[#346739] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#346739] focus-visible:ring-offset-2"
          >
            Coba lagi dari awal
          </button>
        </div>
      )}
    </div>
  );
}
