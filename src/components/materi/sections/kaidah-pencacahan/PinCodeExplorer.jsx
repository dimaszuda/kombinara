"use client";

import { useState, useCallback } from "react";

// ── Konstanta ─────────────────────────────────────────────────────────────────
const TARGET_ATTEMPTS = 3;

// Urutan tombol keypad: 1-5 baris atas, 6-9 dan 0 baris bawah
const KEYPAD_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

// ── Catatan warna: kotak digit PIN dan keypad pakai palet gelap (#2C2C2A dkk)
// yang berbeda dari palet hijau/ungu komponen lain, karena merepresentasikan
// tampilan layar digital / mesin ATM. Ini pengecualian yang disengaja, sama
// seperti warna putih-hitam pada LicensePlateExplorer untuk plat kendaraan.

// ── Komponen tampilan PIN ─────────────────────────────────────────────────────
function PinDisplay({ digits, size = "large" }) {
  const isLarge = size === "large";

  return (
    <div className={`flex ${isLarge ? "gap-3" : "gap-1.5"} justify-center`}>
      {digits.map((d, i) => {
        const filled = d !== "";
        if (filled) {
          return (
            <div
              key={i}
              className={
                isLarge
                  ? "flex h-16 w-14 items-center justify-center rounded-lg bg-[#2C2C2A] font-mono text-3xl font-bold tabular-nums text-white shadow-inner"
                  : "flex h-9 w-8 items-center justify-center rounded-md bg-[#2C2C2A] font-mono text-base font-bold tabular-nums text-white"
              }
            >
              {d}
            </div>
          );
        }
        return (
          <div
            key={i}
            className={
              isLarge
                ? "flex h-16 w-14 items-center justify-center rounded-lg border-2 border-dashed border-[#2C2C2A]/30 bg-[#2C2C2A]/8 font-mono text-2xl text-[#2C2C2A]/25"
                : "flex h-9 w-8 items-center justify-center rounded-md border border-dashed border-[#2C2C2A]/25 bg-[#2C2C2A]/5 font-mono text-sm text-[#2C2C2A]/25"
            }
          >
            _
          </div>
        );
      })}
    </div>
  );
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function PinCodeExplorer() {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [history, setHistory] = useState([]);
  const [duplicateMsg, setDuplicateMsg] = useState("");
  const [showClosing, setShowClosing] = useState(false);

  const usedDigits = digits.filter((d) => d !== "");
  const availableCount = 10 - usedDigits.length;
  const allFilled = digits.every((d) => d !== "");
  const nextEmptyIndex = digits.findIndex((d) => d === "");

  // ── Klik digit dari keypad ────────────────────────────────────────────────
  const handleDigitClick = useCallback(
    (num) => {
      const key = String(num);
      if (usedDigits.includes(key)) return;
      if (nextEmptyIndex === -1) return;

      setDigits((prev) => {
        const next = [...prev];
        next[nextEmptyIndex] = key;
        return next;
      });
      setDuplicateMsg("");
    },
    [usedDigits, nextEmptyIndex]
  );

  // ── Hapus digit terakhir ─────────────────────────────────────────────────
  const handleBackspace = useCallback(() => {
    const lastFilled = [...digits].map((d, i) => ({ d, i })).filter(({ d }) => d !== "");
    if (lastFilled.length === 0) return;
    const { i } = lastFilled[lastFilled.length - 1];
    setDigits((prev) => {
      const next = [...prev];
      next[i] = "";
      return next;
    });
    setDuplicateMsg("");
  }, [digits]);

  // ── Simpan PIN ────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!allFilled) return;
    const key = digits.join("");
    if (history.includes(key)) {
      setDuplicateMsg(
        "PIN ini udah pernah kamu coba, yuk bikin yang beda! Ubah minimal satu digit."
      );
      return;
    }
    const newHistory = [...history, key];
    setHistory(newHistory);
    setDuplicateMsg("");
    setDigits(["", "", "", ""]);
    if (newHistory.length >= TARGET_ATTEMPTS) {
      setShowClosing(true);
    }
  }, [allFilled, digits, history]);

  // ── Reset total ───────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setDigits(["", "", "", ""]);
    setHistory([]);
    setDuplicateMsg("");
    setShowClosing(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl bg-white p-4 border border-[#34673933] space-y-4">
      {/* Label */}
      <p className="text-xs font-medium text-[#663362]">
        🔢 Eksplorasi: Coba Bikin PIN Sendiri
      </p>

      <p className="text-sm leading-relaxed text-[#2C2C2A]">
        Klik angka di keypad untuk mengisi digit PIN. Perhatikan angka mana yang langsung
        menghilang dari pilihan setelah kamu pakai!
      </p>

      {/* Tampilan PIN live */}
      <div className="flex flex-col items-center gap-2 py-2">
        <PinDisplay digits={digits} size="large" />

        {/* Counter sisa pilihan — inti yang mau ditonjolkan */}
        <p
          className={`text-sm font-semibold transition-colors ${
            allFilled
              ? "text-[#346739]"
              : usedDigits.length === 0
              ? "text-[#2C2C2A]/50"
              : "text-[#2C2C2A]/70"
          }`}
        >
          {allFilled
            ? "✓ Semua slot terisi!"
            : usedDigits.length === 0
            ? "10 pilihan tersedia untuk digit ke-1"
            : `Sisa ${availableCount} pilihan untuk digit ke-${usedDigits.length + 1}`}
        </p>
      </div>

      {/* Keypad 0–9 */}
      {/* Catatan: tombol keypad pakai palet netral/gelap, bukan hijau utama,
          supaya tidak rancu dengan tombol aksi utama (Simpan, dll.) */}
      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-5 gap-2">
          {KEYPAD_DIGITS.map((num) => {
            const key = String(num);
            const isUsed = usedDigits.includes(key);
            const isDisabled = isUsed || allFilled;
            return (
              <button
                key={num}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDigitClick(num)}
                title={isUsed ? `Angka ${num} sudah dipakai` : undefined}
                className={`h-11 w-11 rounded-lg border font-mono text-base font-semibold tabular-nums transition-all duration-200
                  ${
                    isDisabled
                      ? "cursor-not-allowed border-[#2C2C2A]/10 bg-[#2C2C2A]/5 text-[#2C2C2A]/20 opacity-30"
                      : "cursor-pointer border-[#2C2C2A]/20 bg-white text-[#2C2C2A] hover:bg-[#2C2C2A]/5 active:scale-95"
                  }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Hapus digit terakhir */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={usedDigits.length === 0}
          className="rounded-lg border border-[#34673933] bg-white px-4 py-1.5 text-xs font-medium text-[#2C2C2A]/60 transition-colors hover:bg-[#34673910] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Hapus digit terakhir
        </button>
      </div>

      {/* Pesan duplikat */}
      {duplicateMsg && (
        <p className="rounded-lg bg-[#FFF3CD] px-3 py-2 text-center text-xs text-[#92600A]">
          ⚠️ {duplicateMsg}
        </p>
      )}

      {/* Tombol Simpan */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={!allFilled}
          className="rounded-full bg-[#346739] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          Simpan PIN ini
        </button>
      </div>

      {/* Progress + riwayat */}
      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#663362]">
            PIN yang udah kamu buat ({history.length}/{TARGET_ATTEMPTS}):
          </p>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-[#34673920]">
            <div
              className="h-1.5 rounded-full bg-[#346739] transition-all duration-500"
              style={{ width: `${(history.length / TARGET_ATTEMPTS) * 100}%` }}
            />
          </div>

          {/* Riwayat PIN mini */}
          <div className="flex flex-wrap gap-3 pt-1">
            {history.map((key, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <PinDisplay digits={key.split("")} size="small" />
                <span className="text-xs text-[#2C2C2A]/50">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teks penutup — muncul setelah TARGET_ATTEMPTS tercapai */}
      {showClosing && (
        <div className="rounded-xl border border-[#34673933] bg-[#F4FBF4] p-4 space-y-3">
          <p className="text-sm font-semibold text-[#346739]">
            Mantap, kamu udah coba bikin {TARGET_ATTEMPTS} PIN berbeda! 🎉
          </p>
          <div className="rounded-lg border border-[#663362]/30 bg-[#663362]/5 px-3 py-2 text-xs font-medium text-[#663362]">
            ⚠️ Perhatikan perbedaan! Boleh pengulangan → pilihan tiap tahap tetap penuh. Tidak
            boleh pengulangan → pilihan berkurang di setiap tahap.
          </div>

          {/* Tombol reset total */}
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
