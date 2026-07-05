"use client";

import { useState, useCallback, useMemo } from "react";

// ── Data ──────────────────────────────────────────────────────────
const FRIENDS = Array.from({ length: 10 }, (_, i) => ({
  id: `teman-${i + 1}`,
  label: `Teman ${i + 1}`,
}));

const ROLES = [
  { key: "ketua", label: "Ketua" },
  { key: "wakil", label: "Wakil" },
  { key: "notulen", label: "Notulen" },
];

// ── SVG Person Icon (placeholder sementara) ───────────────────────
function PersonIcon({ className = "", size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      {/* Kepala */}
      <circle
        cx="24"
        cy="14"
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

// ── Helpers ───────────────────────────────────────────────────────
function getFriendLabel(friendId) {
  const f = FRIENDS.find((fr) => fr.id === friendId);
  return f ? f.label : "?";
}

function samePeople(arr1, arr2) {
  // arr1, arr2: arrays of friend ids (or nulls), compare sorted non-null ids
  const ids1 = arr1.filter(Boolean).sort();
  const ids2 = arr2.filter(Boolean).sort();
  if (ids1.length !== ids2.length) return false;
  return ids1.every((id, i) => id === ids2[i]);
}

// ── Komponen ──────────────────────────────────────────────────────
/**
 * TeamSelectionComparator
 *
 * Props:
 *   choice: "yes" | "no" | null   — jawaban Sama/Beda (disimpan ke DB)
 *   onChoiceChange: (val) => void  — callback saat pilihan berubah
 *   reasoning: string              — alasan siswa (disimpan ke DB)
 *   onReasoningChange: (val) => void — callback saat alasan berubah
 */
export default function TeamSelectionComparator({
  choice,
  onChoiceChange,
  reasoning,
  onReasoningChange,
}) {
  // ── State lokal: Aturan A ──────────────────────────────────────
  const [slotsA, setSlotsA] = useState({
    ketua: null,
    wakil: null,
    notulen: null,
  });
  const [activeSlotA, setActiveSlotA] = useState(null); // slot yang sedang menunggu dipilih
  const [historyA, setHistoryA] = useState([]); // riwayat susunan lengkap

  // ── State lokal: Aturan B ──────────────────────────────────────
  const [selectedB, setSelectedB] = useState([]); // maks 3 teman

  // ── Derived ────────────────────────────────────────────────────
  const isCompleteA = Object.values(slotsA).every(Boolean);
  const isCompleteB = selectedB.length === 3;

  const usedFriendIdsA = Object.values(slotsA).filter(Boolean);
  const usedFriendIdsB = selectedB;

  // ── Handlers: Aturan A ─────────────────────────────────────────
  const handleActivateSlotA = useCallback(
    (roleKey) => {
      if (activeSlotA === roleKey) {
        setActiveSlotA(null); // toggle off
      } else {
        setActiveSlotA(roleKey);
      }
    },
    [activeSlotA]
  );

  const handleAssignToSlotA = useCallback(
    (friendId) => {
      if (!activeSlotA) return;
      // Jangan biarkan teman yang sudah dipakai di slot lain Aturan A
      if (usedFriendIdsA.includes(friendId) && slotsA[activeSlotA] !== friendId) return;

      const newSlots = { ...slotsA, [activeSlotA]: friendId };
      setSlotsA(newSlots);
      setActiveSlotA(null);

      // Jika setelah assignment semua slot terisi, catat ke history
      const allFilled = Object.values(newSlots).every(Boolean);
      if (allFilled) {
        setHistoryA((prev) => {
          // Jangan duplikasi susunan yang persis sama
          const exists = prev.some(
            (h) =>
              h.ketua === newSlots.ketua &&
              h.wakil === newSlots.wakil &&
              h.notulen === newSlots.notulen
          );
          if (exists) return prev;
          return [...prev, newSlots];
        });
      }
    },
    [activeSlotA, slotsA, usedFriendIdsA]
  );

  const handleClearSlotA = useCallback((roleKey) => {
    setSlotsA((prev) => ({ ...prev, [roleKey]: null }));
    setActiveSlotA(null);
  }, []);

  const handleResetA = useCallback(() => {
    setSlotsA({ ketua: null, wakil: null, notulen: null });
    setActiveSlotA(null);
    setHistoryA([]);
  }, []);

  // ── Handlers: Aturan B ─────────────────────────────────────────
  const handleToggleB = useCallback(
    (friendId) => {
      setSelectedB((prev) => {
        if (prev.includes(friendId)) {
          return prev.filter((id) => id !== friendId);
        }
        if (prev.length >= 3) return prev; // sudah penuh
        return [...prev, friendId];
      });
    },
    []
  );

  const handleResetB = useCallback(() => {
    setSelectedB([]);
  }, []);

  // ── Cek history: susunan dengan orang sama tapi peran beda ─────
  const samePeopleDifferentRoles = useMemo(() => {
    if (!isCompleteA || historyA.length < 2) return null;
    const current = [slotsA.ketua, slotsA.wakil, slotsA.notulen];
    const prevEntries = historyA.slice(0, -1); // semua kecuali yang terbaru
    for (const prev of prevEntries) {
      const prevArr = [prev.ketua, prev.wakil, prev.notulen];
      if (samePeople(current, prevArr)) {
        // Cek apakah susunannya benar-benar berbeda
        const sameOrder =
          slotsA.ketua === prev.ketua &&
          slotsA.wakil === prev.wakil &&
          slotsA.notulen === prev.notulen;
        if (!sameOrder) {
          return {
            current: current.map(getFriendLabel).join(", "),
            prev: prevArr.map(getFriendLabel).join(", "),
          };
        }
      }
    }
    return null;
  }, [isCompleteA, slotsA, historyA]);

  // ── Render helpers ─────────────────────────────────────────────
  function renderFriendCard(friend, isUsedA, isUsedB, isSelectedB, onClick) {
    const isDimmed = isUsedA;
    return (
      <button
        key={friend.id}
        type="button"
        onClick={onClick}
        disabled={isDimmed}
        className={[
          "flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition-all duration-200 relative",
          isSelectedB && !isDimmed
            ? "border-[#346739] bg-[#DBFFD5] scale-105 shadow-sm"
            : isDimmed
              ? "border-[#34673933] opacity-35 cursor-not-allowed"
              : "border-[#34673933] hover:border-[#346739] hover:bg-[#DBFFD540] cursor-pointer active:scale-95",
        ].join(" ")}
        aria-label={friend.label}
      >
        {/* TODO: ganti src dengan path gambar person asli */}
        <PersonIcon size={40} />
        <span
          className={[
            "text-[10px] font-medium leading-tight text-center",
            isDimmed ? "text-[#2C2C2A] line-through decoration-[#663362]" : "text-[#2C2C2A]",
          ].join(" ")}
        >
          {friend.label}
        </span>
        {isUsedA && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#663362] text-[9px] font-bold text-white">
            ✓
          </span>
        )}
        {isSelectedB && !isUsedA && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#346739] text-[9px] font-bold text-white">
            ✓
          </span>
        )}
      </button>
    );
  }

  // ── JSX ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ═══════════════ Pool 10 Teman ═══════════════ */}
      <div className="rounded-xl border border-[#34673933] bg-white p-4">
        <p className="mb-3 text-xs font-medium text-[#663362]">
          👥 Daftar 10 Teman
        </p>
        <p className="mb-3 text-xs leading-relaxed text-[#2C2C2A]">
          Klik slot di Aturan A atau anggota di Aturan B dulu, lalu pilih teman dari daftar ini.
        </p>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {FRIENDS.map((friend) => {
            const isUsedA = usedFriendIdsA.includes(friend.id);
            const isUsedB = usedFriendIdsB.includes(friend.id);
            const isSelectedB = selectedB.includes(friend.id);

            // Jika ada slot aktif di Aturan A, klik teman → assign ke slot
            // Jika tidak, untuk Aturan B bisa langsung toggle
            const handleClick = () => {
              if (activeSlotA) {
                handleAssignToSlotA(friend.id);
              } else {
                // Default: toggle untuk Aturan B
                handleToggleB(friend.id);
              }
            };

            return renderFriendCard(friend, isUsedA, isUsedB, isSelectedB, handleClick);
          })}
        </div>

        {/* Indikator mode aktif */}
        {activeSlotA && (
          <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] px-3 py-2 text-center">
            <p className="text-xs font-medium text-[#663362] animate-pulse">
              🎯 Pilih teman untuk slot{" "}
              <span className="font-semibold">
                {ROLES.find((r) => r.key === activeSlotA)?.label}
              </span>
            </p>
          </div>
        )}
        {!activeSlotA && (
          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#34673999]">
            💡 Tips: Klik slot di <span className="font-medium text-[#663362]">Aturan A</span>{" "}
            dulu, lalu klik teman. Atau langsung klik teman untuk{" "}
            <span className="font-medium text-[#346739]">Aturan B</span>.
          </p>
        )}
      </div>

      {/* ═══════════════ Dua Area Kerja ═══════════════ */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Aturan A · Jabatan Beda ── */}
        <div className="rounded-xl border border-[#66336233] bg-[#FDFBFC] p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[#663362] px-2.5 py-0.5 text-[10px] font-medium text-white">
              Aturan A
            </span>
            <span className="text-xs font-medium text-[#663362]">· Jabatan Beda</span>
          </div>

          {/* Slot-slot berlabel */}
          <div className="space-y-2.5">
            {ROLES.map((role) => {
              const filledId = slotsA[role.key];
              const isActive = activeSlotA === role.key;
              const isFilled = Boolean(filledId);

              return (
                <div key={role.key}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isFilled) {
                        handleClearSlotA(role.key);
                      } else {
                        handleActivateSlotA(role.key);
                      }
                    }}
                    className={[
                      "flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all duration-200 text-left",
                      isActive
                        ? "border-[#663362] bg-[#66336210] shadow-sm scale-[1.02]"
                        : isFilled
                          ? "border-[#346739] bg-[#DBFFD5]"
                          : "border-dashed border-[#34673933] bg-white hover:border-[#66336266] hover:bg-[#FDFBFC]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                        isActive
                          ? "bg-[#663362] text-white"
                          : isFilled
                            ? "bg-[#346739] text-white"
                            : "bg-[#34673915] text-[#346739]",
                      ].join(" ")}
                    >
                      {role.label}
                    </span>

                    {isFilled ? (
                      <div className="flex flex-1 items-center gap-2">
                        {/* TODO: ganti src dengan path gambar person asli */}
                        <PersonIcon size={28} className="shrink-0" />
                        <span className="text-sm font-medium text-[#2C2C2A]">
                          {getFriendLabel(filledId)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearSlotA(role.key);
                          }}
                          className="ml-auto shrink-0 rounded-full border border-[#66336233] px-2 py-0.5 text-[11px] font-medium text-[#663362] transition-colors hover:bg-[#66336210] active:scale-95"
                          aria-label={`Hapus ${role.label}`}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#34673966]">
                        {isActive ? "Klik teman di daftar atas 👆" : "Klik untuk memilih"}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Preview susunan */}
          {isCompleteA && (
            <div className="mt-4 rounded-lg bg-[#DBFFD5] p-3 transition-all duration-300">
              <p className="mb-1 text-xs font-medium text-[#346739]">📋 Susunan terbentuk:</p>
              <p className="text-sm leading-relaxed text-[#2C2C2A]">
                <span className="font-medium">Ketua:</span> {getFriendLabel(slotsA.ketua)},{" "}
                <span className="font-medium">Wakil:</span> {getFriendLabel(slotsA.wakil)},{" "}
                <span className="font-medium">Notulen:</span> {getFriendLabel(slotsA.notulen)}
              </p>
            </div>
          )}

          {/* Visual cue: orang sama, susunan beda */}
          {samePeopleDifferentRoles && (
            <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3 animate-[fadeIn_0.5s_ease-out]">
              <p className="text-xs font-medium text-[#663362]">🔁 Perhatikan!</p>
              <p className="mt-1 text-xs leading-relaxed text-[#2C2C2A]">
                Susunan ini pakai <b>orang yang sama</b> dengan susunan sebelumnya (
                {samePeopleDifferentRoles.prev}), tapi dihitung sebagai{" "}
                <b>susunan berbeda</b> karena perannya beda!
              </p>
            </div>
          )}

          {/* Riwayat susunan Aturan A */}
          {historyA.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium text-[#663362]">
                📜 Riwayat susunan dicoba ({historyA.length})
              </p>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-[#34673933] bg-white p-2">
                {historyA.map((h, i) => (
                  <div
                    key={i}
                    className={[
                      "rounded-md px-2 py-1 text-[11px] leading-relaxed",
                      i === historyA.length - 1
                        ? "bg-[#DBFFD5] font-medium text-[#2C2C2A]"
                        : "text-[#2C2C2A]",
                    ].join(" ")}
                  >
                    #{i + 1}: K={getFriendLabel(h.ketua)}, W={getFriendLabel(h.wakil)}, N=
                    {getFriendLabel(h.notulen)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tombol reset Aturan A */}
          {(Object.values(slotsA).some(Boolean) || historyA.length > 0) && (
            <button
              type="button"
              onClick={handleResetA}
              className="mt-3 rounded-full border border-[#663362] px-4 py-1.5 text-xs font-medium text-[#663362] transition-colors hover:bg-[#66336210] active:scale-95"
            >
              🔄 Coba susunan lain
            </button>
          )}
        </div>

        {/* ── Aturan B · Tanpa Jabatan ── */}
        <div className="rounded-xl border border-[#34673933] bg-[#F8FBF7] p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[#346739] px-2.5 py-0.5 text-[10px] font-medium text-white">
              Aturan B
            </span>
            <span className="text-xs font-medium text-[#346739]">· Tanpa Jabatan</span>
          </div>

          {/* Wadah tanpa label posisi */}
          <div
            className={[
              "flex min-h-[120px] flex-wrap items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
              selectedB.length > 0
                ? "border-[#346739] bg-[#DBFFD5]"
                : "border-dashed border-[#34673933] bg-white",
            ].join(" ")}
          >
            {selectedB.length === 0 && (
              <p className="text-xs text-[#34673966]">
                Klik hingga 3 teman dari daftar di atas
              </p>
            )}
            {selectedB.map((friendId) => (
              <div
                key={friendId}
                className="flex flex-col items-center gap-0.5"
              >
                {/* TODO: ganti src dengan path gambar person asli */}
                <PersonIcon size={44} />
                <span className="text-[10px] font-medium text-[#2C2C2A]">
                  {getFriendLabel(friendId)}
                </span>
              </div>
            ))}
          </div>

          {/* Counter */}
          <p className="mt-2 text-center text-xs text-[#34673999]">
            {selectedB.length}/3 anggota terpilih
            {selectedB.length === 3 && (
              <span className="ml-1 text-[#346739] font-medium">✓ Lengkap</span>
            )}
          </p>

          {/* Preview tim */}
          {isCompleteB && (
            <div className="mt-3 rounded-lg bg-[#DBFFD5] p-3 transition-all duration-300">
              <p className="mb-1 text-xs font-medium text-[#346739]">👥 Tim kamu:</p>
              <p className="text-sm leading-relaxed text-[#2C2C2A]">
                {selectedB.map((id) => getFriendLabel(id)).join(", ")}
              </p>
            </div>
          )}

          {/* Tombol reset Aturan B */}
          {selectedB.length > 0 && (
            <button
              type="button"
              onClick={handleResetB}
              className="mt-3 rounded-full border border-[#346739] px-4 py-1.5 text-xs font-medium text-[#346739] transition-colors hover:bg-[#DBFFD5] active:scale-95"
            >
              🔄 Coba susunan lain
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════ Pertanyaan Sama/Beda + Alasan ═══════════════ */}
      {/* ⚠️ BAGIAN INI WAJIB DIPERTAHANKAN — disimpan ke database */}
      <div className="rounded-xl border border-[#34673933] bg-white p-4">
        <p className="text-sm font-medium leading-relaxed text-[#2C2C2A]">
          Menurutmu, dua aturan ini menghasilkan jumlah susunan yang sama atau beda?
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#34673999]">
          Pilih salah satu
        </p>

        {/* Toggle Sama / Beda — styling pill dengan hijau #346739 untuk state aktif */}
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => onChoiceChange(choice === "yes" ? null : "yes")}
            className={[
              "rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-colors",
              choice === "yes"
                ? "border-[#346739] bg-[#346739] text-white"
                : "border-[#346739] bg-white text-[#346739] hover:bg-[#34673908]",
            ].join(" ")}
          >
            Sama
          </button>
          <button
            type="button"
            onClick={() => onChoiceChange(choice === "no" ? null : "no")}
            className={[
              "rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-colors",
              choice === "no"
                ? "border-[#346739] bg-[#346739] text-white"
                : "border-[#346739] bg-white text-[#346739] hover:bg-[#34673908]",
            ].join(" ")}
          >
            Beda
          </button>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-[#663362]">
            Jelaskan alasanmu
          </label>
          <textarea
            placeholder="ceritain logikamu"
            value={reasoning}
            onChange={(e) => onReasoningChange(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y"
          />
        </div>
      </div>
    </div>
  );
}
