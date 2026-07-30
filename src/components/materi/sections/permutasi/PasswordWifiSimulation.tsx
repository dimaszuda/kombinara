"use client";

import React, { useState, useRef, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────
const TOTAL_SLOTS = 4;
const FIXED_CHAR = "#";
const FIXED_INDEX = 3; // 0-based, slot ke-4
const VALID_PASSWORDS = ["ADA#", "AAD#", "DAA#"];
const TARGET_VALID = 3; // jumlah password valid unik yang harus ditemukan

// ── Types ──────────────────────────────────────────────────────────
type AttemptStatus = "valid" | "invalid" | "duplicate";

interface Attempt {
  password: string;
  status: AttemptStatus;
}

// ── Helpers ────────────────────────────────────────────────────────
function normalizeSlot(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z#]/g, "").slice(-1);
}

// ============================================================================
// PasswordWifiSimulation Component
// ============================================================================

export default function PasswordWifiSimulation() {
  const [slots, setSlots] = useState<string[]>(["", "", "", FIXED_CHAR]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Derived state
  const currentPassword = slots.join("");
  const isComplete = slots.every((s) => s.length > 0);
  const foundValid = attempts
    .filter((a) => a.status === "valid")
    .map((a) => a.password);
  const uniqueValid = [...new Set(foundValid)];
  const allFound = uniqueValid.length >= TARGET_VALID;

  // ── Slot handlers ────────────────────────────────────────────────

  const handleSlotChange = useCallback(
    (index: number, raw: string) => {
      if (allFound) return;
      // Slot ke-4 tidak bisa diubah (tetap "#")
      if (index === FIXED_INDEX) return;

      const char = normalizeSlot(raw);
      const nextSlots = [...slots];
      nextSlots[index] = char;
      setSlots(nextSlots);
      setMessage(null);

      // Auto-advance ke slot berikutnya
      if (char && index < TOTAL_SLOTS - 1) {
        // Skip slot fixed jika diperlukan
        const nextIndex = index + 1;
        if (nextIndex !== FIXED_INDEX) {
          inputRefs.current[nextIndex]?.focus();
        }
      }
    },
    [slots, allFound],
  );

  const handleSlotKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !slots[index] && index > 0) {
        const nextSlots = [...slots];
        // Cari slot editable sebelumnya
        let prevIdx = index - 1;
        while (prevIdx >= 0 && prevIdx === FIXED_INDEX) {
          prevIdx--;
        }
        if (prevIdx >= 0) {
          nextSlots[prevIdx] = "";
          setSlots(nextSlots);
          setMessage(null);
          inputRefs.current[prevIdx]?.focus();
        }
      }
    },
    [slots],
  );

  const handleClearSlot = useCallback(
    (index: number) => {
      if (allFound || index === FIXED_INDEX) return;
      const nextSlots = [...slots];
      nextSlots[index] = "";
      setSlots(nextSlots);
      setMessage(null);
      inputRefs.current[index]?.focus();
    },
    [slots, allFound],
  );

  // ── Validation ───────────────────────────────────────────────────

  const handleTryPassword = useCallback(() => {
    if (!isComplete || allFound) return;

    const pw = currentPassword;

    // Cek apakah password sudah pernah dicoba (valid maupun invalid)
    const alreadyTried = attempts.some((a) => a.password === pw);
    if (alreadyTried) {
      const wasValid = attempts.some(
        (a) => a.password === pw && a.status === "valid",
      );
      setMessage({
        text: wasValid
          ? `Password "${pw}" sudah kamu temukan sebelumnya dan valid! Coba susunan lain ya.`
          : `Password "${pw}" sudah pernah kamu coba dan tidak valid. Coba susunan lain ya.`,
        type: "warning",
      });
      return;
    }

    // Cek validitas
    const isValid = VALID_PASSWORDS.includes(pw);

    const newAttempt: Attempt = {
      password: pw,
      status: isValid ? "valid" : "invalid",
    };

    setAttempts((prev) => [...prev, newAttempt]);

    if (isValid) {
      const newFoundCount = uniqueValid.length + 1;
      if (newFoundCount >= TARGET_VALID) {
        setMessage({
          text: `🎉 Keren! Kamu menemukan ${TARGET_VALID} password valid!`,
          type: "success",
        });
      } else {
        setMessage({
          text: `✅ Password "${pw}" valid! (${newFoundCount}/${TARGET_VALID} ditemukan). Lanjut cari yang lain!`,
          type: "success",
        });
      }
    } else {
      setMessage({
        text: `❌ Password "${pw}" tidak valid. Ingat: password berasal dari susunan huruf A, A, D dan diakhiri #.`,
        type: "error",
      });
    }

    // Reset slots untuk percobaan berikutnya (kecuali slot fixed)
    if (!allFound) {
      setSlots(["", "", "", FIXED_CHAR]);
      // Fokus ke slot pertama
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [isComplete, allFound, currentPassword, attempts, uniqueValid.length]);

  // ── Reset ────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setSlots(["", "", "", FIXED_CHAR]);
    setAttempts([]);
    setMessage(null);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-[#34673933] bg-[#F7FAF6] p-4 md:p-5">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-[#34673926] pb-4">
        <span className="text-xs font-medium text-[#663362]">
          🔐 Simulasi Password WiFi
        </span>
        <h4 className="text-lg font-semibold text-[#346739]">
          Yuk, coba masukkan password WiFi sekolah!
        </h4>
        <p className="max-w-2xl text-sm leading-relaxed text-[#2C2C2A]">
          Password berasal dari susunan huruf kata <b>&quot;ADA&quot;</b>{" "}
          dan diakhiri tanda pagar <b>(#)</b>. Huruf boleh di bolak-balik.
          Coba temukan <b>semua password valid</b> yang mungkin!
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* Left: Input area */}
        <div className="space-y-4">
          {/* Slot inputs */}
          <div className="rounded-xl border border-[#34673933] bg-white p-4">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {slots.map((value, index) => {
                const isFixed = index === FIXED_INDEX;
                const isFilled = Boolean(value);

                return (
                  <div key={index} className="flex flex-col items-stretch">
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleSlotChange(index, e.target.value)}
                      onKeyDown={(e) => handleSlotKeyDown(index, e)}
                      disabled={isFixed || allFound}
                      placeholder={isFixed ? "#" : "?"}
                      className={`h-20 w-full rounded-xl border-2 text-center text-2xl font-bold tracking-[0.15em] outline-none transition-all placeholder:text-[#34673966] ${
                        isFixed
                          ? "cursor-default border-[#663362] bg-[#66336208] text-[#663362]"
                          : isFilled
                            ? "border-[#34673966] bg-[#F8FBF7] text-[#346739]"
                            : "border-[#34673933] border-dashed bg-white text-[#346739]"
                      } ${allFound && !isFixed ? "cursor-default opacity-60" : ""}`}
                      aria-label={
                        isFixed ? "Slot 4 — pagar (tetap)" : `Slot ${index + 1}`
                      }
                    />
                    <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
                      <span
                        className={`text-[11px] font-medium ${isFixed ? "text-[#663362]" : "text-[#2C2C2A]"}`}
                      >
                        {isFixed ? "Tetap (#)" : `Slot ${index + 1}`}
                      </span>
                      {isFilled && !isFixed && !allFound && (
                        <button
                          type="button"
                          onClick={() => handleClearSlot(index)}
                          className="rounded-full border border-[#66336233] px-1.5 py-0.5 text-[10px] font-medium text-[#663362] transition-colors hover:bg-[#66336208]"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint */}
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#6633621f] bg-[#66336208] px-3 py-2">
              <span className="text-xs font-medium text-[#663362]">
                💡 Petunjuk
              </span>
              <span className="text-xs leading-relaxed text-[#2C2C2A]">
                Gunakan huruf <b>A</b> dan <b>D</b> pada 3 slot pertama. Slot
                ke-4 selalu <b>#</b>. Cari semua susunan berbeda!
              </span>
            </div>

            {/* Try button */}
            {isComplete && !allFound && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleTryPassword}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-10 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Coba Password
                </button>
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`mt-4 rounded-lg border px-4 py-3 ${
                  message.type === "success"
                    ? "border-[#34673933] bg-[#DBFFD5]/20"
                    : message.type === "error"
                      ? "border-[#C44F4F33] bg-[#C44F4F08]"
                      : message.type === "warning"
                        ? "border-[#E5A83E33] bg-[#E5A83E08]"
                        : "border-[#66336233] bg-[#66336208]"
                }`}
              >
                <p
                  className={`text-sm leading-relaxed ${
                    message.type === "success"
                      ? "text-[#346739]"
                      : message.type === "error"
                        ? "text-[#C44F4F]"
                        : message.type === "warning"
                          ? "text-[#B07D20]"
                          : "text-[#663362]"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Progress indicator */}
            {attempts.length > 0 && !allFound && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: TARGET_VALID }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-8 rounded-full transition-colors ${
                        i < uniqueValid.length
                          ? "bg-[#346739]"
                          : "bg-[#34673926]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#2C2C2A]">
                  {uniqueValid.length}/{TARGET_VALID} password valid ditemukan
                </span>
              </div>
            )}
          </div>

          {/* Summary — shown after all valid passwords found */}
          {allFound && (
            <div className="rounded-xl border-2 border-[#346739] bg-[#DBFFD5]/20 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <h4 className="text-lg font-bold text-[#346739]">
                  Selamat! Kamu menemukan semua password!
                </h4>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-[#2C2C2A]">
                Dari kata <b>&quot;ADA&quot;</b> yang diakhiri <b>#</b>,
                hanya ada <b>{TARGET_VALID} password unik</b> yang bisa dibuat.
                Mari kita lihat kenapa:
              </p>

              {/* Summary table */}
              <div className="mb-4 overflow-hidden rounded-lg border border-[#34673933]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#34673915]">
                      <th className="px-4 py-2.5 text-left font-semibold text-[#346739]">
                        Password Valid
                      </th>
                      <th className="px-4 py-2.5 text-left font-semibold text-[#346739]">
                        Susunan Huruf
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {VALID_PASSWORDS.map((pw, i) => (
                      <tr
                        key={pw}
                        className={`border-t border-[#34673915] ${i % 2 === 0 ? "bg-white" : "bg-[#F8FBF7]"}`}
                      >
                        <td className="px-4 py-2.5 font-mono font-bold tracking-[0.15em] text-[#346739]">
                          {pw}
                        </td>
                        <td className="px-4 py-2.5 text-[#2C2C2A]">
                          {i === 0
                            ? "A-D-A-#"
                            : i === 1
                              ? "A-A-D-#"
                              : "D-A-A-#"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Explanation */}
              <div className="space-y-3 rounded-lg border border-[#66336233] bg-[#66336208] p-4">
                <p className="text-sm font-semibold text-[#663362]">
                  📝 Kenapa cuma {TARGET_VALID} password?
                </p>
                <div className="space-y-2 text-sm leading-relaxed text-[#2C2C2A]">
                  <p>
                    <b>Abdi salah!</b> Dia menghitung <b>3! = 6</b> susunan
                    dengan menganggap semua huruf berbeda. Padahal...
                  </p>
                  <p>
                    <b>Gian benar!</b> Ada dua huruf <b>A yang identik</b>.
                    Susunan A₁A₂D# dan A₂A₁D# itu{" "}
                    <b>sebenarnya sama</b> — tidak bisa dibedakan!
                  </p>
                  <p>
                    Jadi, banyak susunan berbeda dari kata &quot;ADA&quot; + #
                    adalah:
                  </p>
                  <p className="rounded-lg bg-white px-4 py-3 text-center font-mono text-base font-bold text-[#346739]">
                    P = 3! / 2! = 6 / 2 = 3 susunan
                  </p>
                  <p>
                    Inilah konsep <b>permutasi dengan unsur yang sama</b>: jika
                    ada unsur identik, kita harus membagi dengan faktorial dari
                    banyaknya unsur yang sama agar tidak menghitung ganda!
                  </p>
                </div>
              </div>

              {/* Daftar percobaan */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-[#2C2C2A]">
                  📋 Riwayat Percobaan Kamu:
                </p>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[#34673926] bg-white p-3">
                  {attempts.length === 0 ? (
                    <p className="text-xs text-[#34673966]">
                      Belum ada percobaan.
                    </p>
                  ) : (
                    attempts.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md px-2 py-1 text-xs"
                      >
                        <span className="w-5 text-center font-mono text-[#34673966]">
                          {i + 1}.
                        </span>
                        <span className="font-mono font-semibold tracking-[0.1em]">
                          {a.password}
                        </span>
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            a.status === "valid"
                              ? "bg-[#DBFFD5] text-[#346739]"
                              : a.status === "duplicate"
                                ? "bg-[#FFF3D6] text-[#B07D20]"
                                : "bg-[#FFE5E5] text-[#C44F4F]"
                          }`}
                        >
                          {a.status === "valid"
                            ? "✅ Valid"
                            : a.status === "duplicate"
                              ? "⚠️ Duplikat"
                              : "❌ Invalid"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-full border border-[#34673933] bg-white px-6 py-3 text-sm font-medium text-[#346739] transition-colors hover:bg-[#34673908] active:scale-95"
              >
                🔄 Coba Lagi dari Awal
              </button>
            </div>
          )}
        </div>

        {/* Right: History panel */}
        <aside className="rounded-xl border border-[#66336233] bg-white p-4">
          <div>
            <p className="text-xs font-medium text-[#663362]">
              📋 Riwayat Percobaan
            </p>
            <h5 className="mt-1 text-sm font-semibold text-[#346739]">
              Password yang sudah dicoba
            </h5>
          </div>

          <div className="mt-3 space-y-1.5">
            {attempts.length === 0 ? (
              <p className="text-xs text-[#34673966]">
                Kamu belum mencoba password apapun. Isi 4 slot di samping dan
                klik &quot;Coba Password&quot;!
              </p>
            ) : (
              attempts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                    a.status === "valid"
                      ? "border-[#34673933] bg-[#DBFFD5]/10"
                      : "border-[#C44F4F15] bg-[#C44F4F05]"
                  }`}
                >
                  <span className="text-[#34673966]">{i + 1}.</span>
                  <span className="font-mono font-bold tracking-[0.1em] text-[#2C2C2A]">
                    {a.password}
                  </span>
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      a.status === "valid"
                        ? "bg-[#DBFFD5] text-[#346739]"
                        : "bg-[#FFE5E5] text-[#C44F4F]"
                    }`}
                  >
                    {a.status === "valid" ? "✓" : "✗"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Counter */}
          {attempts.length > 0 && (
            <div className="mt-3 border-t border-[#34673915] pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#2C2C2A]">Password valid ditemukan</span>
                <span className="font-bold text-[#346739]">
                  {uniqueValid.length} / {TARGET_VALID}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#34673915]">
                <div
                  className="h-full rounded-full bg-[#346739] transition-all duration-500"
                  style={{
                    width: `${(uniqueValid.length / TARGET_VALID) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
