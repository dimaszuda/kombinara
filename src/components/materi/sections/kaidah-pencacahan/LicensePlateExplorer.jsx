"use client";

import { useState, useRef, useCallback } from "react";

// ── Konstanta ─────────────────────────────────────────────────────────────────
const TARGET_ATTEMPTS = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────
function platKey(chars) {
  return chars.join("");
}

// ── Komponen plat nomor ───────────────────────────────────────────────────────
// Catatan: warna plat (putih-hitam) sengaja tidak mengikuti palet hijau/ungu
// komponen lain, karena harus merepresentasikan visual plat kendaraan Indonesia
// yang asli (latar putih, teks hitam tebal). Ini pengecualian yang disengaja.
function LicensePlateDisplay({ chars, size = "large" }) {
  const letters = chars.slice(0, 2);
  const digits = chars.slice(2, 6);

  const isLarge = size === "large";

  const plateClass = isLarge
    ? "relative flex items-center justify-center gap-3 rounded-md border-2 border-[#2C2C2A] bg-white px-6 py-3 shadow-md"
    : "relative flex items-center justify-center gap-2 rounded border-2 border-[#2C2C2A] bg-white px-3 py-1.5 shadow-sm";

  const charClass = isLarge
    ? "text-3xl font-black tracking-widest text-[#1a1a1a]"
    : "text-base font-black tracking-wider text-[#1a1a1a]";

  const separatorClass = isLarge
    ? "text-2xl font-black text-[#2C2C2A] mx-1"
    : "text-sm font-black text-[#2C2C2A] mx-0.5";

  const placeholderClass = isLarge
    ? "inline-block w-7 border-b-2 border-dashed border-[#999] text-center text-3xl leading-none text-transparent"
    : "inline-block w-4 border-b border-dashed border-[#aaa] text-center text-base leading-none text-transparent";

  function renderChar(char, index) {
    const filled = char !== "";
    return (
      <span
        key={index}
        className={filled ? charClass : placeholderClass}
        // CSS text-shadow untuk simulasi outline putih tipis di sekitar teks hitam
        style={
          filled
            ? {
                textShadow:
                  "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
                WebkitTextStroke: "0.5px white",
              }
            : {}
        }
      >
        {filled ? char : "_"}
      </span>
    );
  }

  return (
    <div className={plateClass} role="img" aria-label="Plat nomor kendaraan">
      {/* Garis tipis dekoratif atas-bawah (mirip plat fisik) */}
      <div className="pointer-events-none absolute inset-x-0 top-1 mx-2 h-px bg-[#2C2C2A]/20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-1 mx-2 h-px bg-[#2C2C2A]/20" />

      {/* 2 huruf */}
      <span className="flex gap-1">
        {letters.map((ch, i) => renderChar(ch, i))}
      </span>

      {/* Pemisah */}
      <span className={separatorClass}>·</span>

      {/* 4 angka */}
      <span className="flex gap-1">
        {digits.map((ch, i) => renderChar(ch, i + 2))}
      </span>
    </div>
  );
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function LicensePlateExplorer() {
  // 6 slot: index 0-1 = huruf, index 2-5 = angka
  const [chars, setChars] = useState(["", "", "", "", "", ""]);
  const [history, setHistory] = useState([]); // array of 6-char strings
  const [duplicateMsg, setDuplicateMsg] = useState("");
  const [showClosing, setShowClosing] = useState(false);

  const inputRefs = useRef([]);

  const allFilled = chars.every((c) => c !== "");

  // ── Validasi karakter per slot ─────────────────────────────────
  function isValidChar(index, value) {
    if (index < 2) return /^[A-Za-z]$/.test(value);
    return /^[0-9]$/.test(value);
  }

  // ── Handler perubahan tiap kotak ──────────────────────────────
  const handleChange = useCallback(
    (index, rawValue) => {
      const value = rawValue.slice(-1); // ambil karakter terakhir saja
      if (value === "") {
        // backspace / kosongkan
        setChars((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        setDuplicateMsg("");
        return;
      }
      if (!isValidChar(index, value)) return;
      const upper = index < 2 ? value.toUpperCase() : value;
      setChars((prev) => {
        const next = [...prev];
        next[index] = upper;
        return next;
      });
      setDuplicateMsg("");
      // Auto-focus ke slot berikutnya
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    },
    []
  );

  // ── Navigasi keyboard ─────────────────────────────────────────
  const handleKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && chars[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [chars]);

  // ── Simpan plat ───────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!allFilled) return;
    const key = platKey(chars);
    if (history.includes(key)) {
      setDuplicateMsg(
        "Plat ini udah pernah kamu coba, yuk bikin yang beda! Ubah minimal satu karakter."
      );
      return;
    }
    const newHistory = [...history, key];
    setHistory(newHistory);
    setDuplicateMsg("");
    // Reset slot & fokus ke awal
    setChars(["", "", "", "", "", ""]);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
    // Tampilkan teks penutup setelah mencapai target
    if (newHistory.length >= TARGET_ATTEMPTS) {
      setShowClosing(true);
    }
  }, [allFilled, chars, history]);

  // ── Reset total ───────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setChars(["", "", "", "", "", ""]);
    setHistory([]);
    setDuplicateMsg("");
    setShowClosing(false);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  }, []);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="rounded-xl bg-white p-4 border border-[#34673933] space-y-4">
      {/* Label bagian */}
      <p className="text-xs font-medium text-[#663362]">
        🚗 Eksplorasi: Coba Bikin Plat Nomor Sendiri
      </p>

      <p className="text-sm leading-relaxed text-[#2C2C2A]">
        Ketik 2 huruf dan 4 angka sesukamu — plat nomor akan terbentuk secara langsung. Coba
        beberapa kombinasi berbeda!
      </p>

      {/* Tampilan plat nomor live */}
      <div className="flex justify-center py-2">
        <LicensePlateDisplay chars={chars} size="large" />
      </div>

      {/* Kotak input per slot (pola OTP) */}
      <div className="flex justify-center items-center gap-2">
        {/* 2 kotak huruf */}
        {[0, 1].map((i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="text"
            maxLength={2}
            value={chars[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            placeholder="A"
            aria-label={`Huruf ke-${i + 1}`}
            className="h-11 w-11 rounded-md border border-[#34673933] bg-white text-center text-lg font-medium text-[#2C2C2A] transition-all focus:outline-none focus:ring-2 focus:ring-[#346739] placeholder:text-[#34673944]"
          />
        ))}

        {/* Pemisah visual */}
        <span className="text-sm font-semibold text-[#2C2C2A]/40 select-none mx-1">·</span>

        {/* 4 kotak angka */}
        {[2, 3, 4, 5].map((i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={chars[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            placeholder="0"
            aria-label={`Angka ke-${i - 1}`}
            className="h-11 w-11 rounded-md border border-[#34673933] bg-white text-center text-lg font-medium text-[#2C2C2A] transition-all focus:outline-none focus:ring-2 focus:ring-[#346739] placeholder:text-[#34673944]"
          />
        ))}
      </div>

      {/* Label slot */}
      <div className="flex justify-center items-center gap-2">
        {[0, 1].map((i) => (
          <span key={i} className="w-11 text-center text-xs text-[#663362] font-medium">
            H{i + 1}
          </span>
        ))}
        <span className="mx-1 w-4" />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-11 text-center text-xs text-[#663362] font-medium">
            A{i + 1}
          </span>
        ))}
      </div>

      {/* Pesan duplikat */}
      {duplicateMsg && (
        <p className="text-center text-xs text-[#92600A] bg-[#FFF3CD] rounded-lg px-3 py-2">
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
          Simpan plat ini
        </button>
      </div>

      {/* Progress menuju TARGET_ATTEMPTS */}
      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#663362]">
            Plat yang udah kamu buat ({history.length}/{TARGET_ATTEMPTS}):
          </p>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-[#34673920]">
            <div
              className="h-1.5 rounded-full bg-[#346739] transition-all duration-500"
              style={{ width: `${(history.length / TARGET_ATTEMPTS) * 100}%` }}
            />
          </div>

          {/* Riwayat plat kecil */}
          <div className="flex flex-wrap gap-2 pt-1">
            {history.map((key, idx) => {
              const platChars = key.split("");
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <LicensePlateDisplay chars={platChars} size="small" />
                  <span className="text-xs text-[#2C2C2A]/50">#{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teks penutup (muncul setelah TARGET_ATTEMPTS tercapai) */}
      {showClosing && (
        <div className="rounded-xl border border-[#34673933] bg-[#F4FBF4] p-4 space-y-3">
          <p className="text-sm font-semibold text-[#346739]">
            Kamu udah coba bikin {TARGET_ATTEMPTS} plat nomor berbeda! 🎉
          </p>

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
