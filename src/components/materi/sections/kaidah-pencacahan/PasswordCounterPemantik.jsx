"use client";

import { useRef, useState } from "react";

const TARGET_CUSTOMERS = 3;
const EMPTY_SLOTS = ["", "", "", ""];
const VALID_CHAR = /^[0-9A-Za-z]?$/;

export default function PasswordCounterPemantik() {
  const [slots, setSlots] = useState(EMPTY_SLOTS);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const inputRefs = useRef([]);

  const currentPassword = slots.join("");
  const isComplete = slots.every(Boolean);
  const isReflectionShown = history.length >= TARGET_CUSTOMERS;
  const isDuplicatePassword = isComplete && history.includes(currentPassword);

  function handleSlotChange(index, raw) {
    if (isReflectionShown) return;
    const char = raw.toUpperCase().slice(-1);
    if (char && !VALID_CHAR.test(char)) return;

    const nextSlots = [...slots];
    nextSlots[index] = char;

    setSlots(nextSlots);
    setMessage("");

    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleSlotKeyDown(index, e) {
    if (e.key === "Backspace" && !slots[index] && index > 0) {
      const nextSlots = [...slots];
      nextSlots[index - 1] = "";
      setSlots(nextSlots);
      setMessage("");
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleClearSlot(index) {
    if (isReflectionShown) return;
    const nextSlots = [...slots];
    nextSlots[index] = "";
    setSlots(nextSlots);
    setMessage("");
    inputRefs.current[index]?.focus();
  }

  function handleSavePassword() {
    if (!isComplete || isReflectionShown) return;

    if (history.includes(currentPassword)) {
      setMessage("Wah, password ini udah dipakai pelanggan lain. Sistem butuh yang beda nih.");
      return;
    }

    setHistory((prev) => [...prev, currentPassword]);
    setSlots(EMPTY_SLOTS);
    setMessage("");
  }

  function handleResetTotal() {
    setSlots(EMPTY_SLOTS);
    setHistory([]);
    setMessage("");
  }

  return (
    <section className="rounded-xl border border-[#34673933] bg-[#F7FAF6] p-4 md:p-5">
      <div className="rounded-xl bg-white p-4 shadow-[0_1px_0_rgba(52,103,57,0.08)]">
        <div className="flex flex-col gap-2 border-b border-[#34673926] pb-4">
          <span className="text-xs font-medium text-[#663362]">Pemantik Password</span>
          <h3 className="text-xl font-semibold text-[#346739]">Yuk, coba dulu sebelum masuk materi 👇</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-[#2C2C2A]">
            Isi tiap slot dengan satu karakter (0–9 atau A–Z). Karakter boleh dipakai lagi di slot lain, tapi kalau password sudah dipakai pelanggan lain, sistem harus menolaknya.
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#34673933] bg-white p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {slots.map((value, index) => {
                  const isFilled = Boolean(value);

                  return (
                    <div key={index} className="flex flex-col items-stretch text-left">
                      <input
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleSlotChange(index, e.target.value)}
                        onKeyDown={(e) => handleSlotKeyDown(index, e)}
                        disabled={isReflectionShown}
                        placeholder="?"
                        className={`h-20 w-full rounded-xl border-2 text-center text-2xl font-semibold tracking-[0.2em] outline-none transition-colors placeholder:text-[#34673966] ${
                          isFilled
                            ? "border-[#34673966] bg-[#F8FBF7] text-[#346739]"
                            : "border-[#34673933] border-dashed bg-white text-[#346739]"
                        } ${isReflectionShown ? "cursor-default opacity-60" : ""}`}
                        aria-label={`Slot ${index + 1}`}
                      />
                      <div className="mt-2 flex items-center justify-between gap-2 px-1">
                        <span className="text-xs font-medium text-[#663362]">Slot {index + 1}</span>
                        {isFilled && (
                          <button
                            type="button"
                            onClick={() => handleClearSlot(index)}
                            disabled={isReflectionShown}
                            className="rounded-full border border-[#66336233] px-2 py-0.5 text-[11px] font-medium text-[#663362] transition-colors hover:bg-[#66336208] disabled:pointer-events-none disabled:opacity-40"
                          >
                            Ubah
                          </button>
                        )}
                      </div>
                      {isFilled && (
                        <p className="mt-1 px-1 text-[11px] leading-relaxed text-[#34673999]">
                          36 pilihan di posisi ini
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#6633621f] bg-[#66336208] px-3 py-2">
                <span className="text-xs font-medium text-[#663362]">Petunjuk</span>
                <span className="text-xs leading-relaxed text-[#2C2C2A]">
                  Karakter boleh sama di slot lain. Yang dicek sistem adalah apakah password pelanggan berikutnya persis sama atau tidak.
                </span>
              </div>
            </div>

            {isComplete && !isReflectionShown && (
              <div className="rounded-xl border border-[#66336233] bg-[#66336208] p-4">
                <p className="text-xs font-medium text-[#663362]">Password terbentuk</p>
                <div className="mt-2 rounded-lg border border-[#34673933] bg-white px-3 py-3">
                  <p className="text-sm leading-relaxed text-[#2C2C2A]">
                    Password Pelanggan #{history.length + 1}: <span className="font-semibold tracking-[0.18em] text-[#346739]">{currentPassword}</span>
                  </p>
                </div>

                {isDuplicatePassword && (
                  <p className="mt-3 rounded-lg border border-[#66336233] bg-white px-3 py-2 text-sm leading-relaxed text-[#663362]">
                    {message || "Wah, password ini udah dipakai pelanggan lain. Sistem butuh yang beda nih."}
                  </p>
                )}

                {!isDuplicatePassword && message && (
                  <p className="mt-3 rounded-lg border border-[#34673933] bg-white px-3 py-2 text-sm leading-relaxed text-[#346739]">
                    {message}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSavePassword}
                    disabled={!isComplete || isReflectionShown}
                    className="rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Simpan & buat pelanggan berikutnya
                  </button>
                  <p className="text-xs leading-relaxed text-[#2C2C2A]">
                    Password harus beda persis dengan riwayat yang sudah tersimpan.
                  </p>
                </div>
              </div>
            )}

            {isReflectionShown && (
              <div className="rounded-xl border border-[#66336233] bg-[#66336208] p-4">
                <p className="text-xs font-medium text-[#663362]">Pemantik reflektif</p>
                <p className="mt-2 text-sm leading-relaxed text-[#2C2C2A]">
                  Keren, kamu sudah bikin {TARGET_CUSTOMERS} password berbeda buat {TARGET_CUSTOMERS} pelanggan. Tiap slot tadi selalu punya 36 pilihan, dan ada 4 slot. Kira-kira, ada berapa banyak password unik total yang bisa dibuat sistem ini sebelum akhirnya kehabisan dan nggak bisa nerima pelanggan baru lagi?
                </p>

                <button
                  type="button"
                  onClick={handleResetTotal}
                  className="mt-4 rounded-full border border-[#34673933] bg-white px-6 py-3 text-sm font-medium text-[#346739] transition-colors hover:bg-[#34673908] active:scale-95"
                >
                  Reset total
                </button>
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-[#66336233] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#663362]">Riwayat password</p>
                <h4 className="mt-1 text-base font-semibold text-[#346739]">Password pelanggan yang sudah dipakai</h4>
              </div>
              <div className="rounded-full bg-[#34673910] px-3 py-1 text-xs font-medium text-[#346739]">
                {history.length}/{TARGET_CUSTOMERS}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {history.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#34673933] bg-[#F8FBF7] px-3 py-4 text-sm leading-relaxed text-[#2C2C2A]">
                  Belum ada password pelanggan yang tersimpan.
                </div>
              ) : (
                history.map((password, index) => (
                  <div
                    key={`${password}-${index}`}
                    className="rounded-lg border border-[#34673926] bg-[#F8FBF7] px-3 py-3"
                  >
                    <p className="text-xs font-medium text-[#663362]">Pelanggan #{index + 1}</p>
                    <p className="mt-1 text-sm font-semibold tracking-[0.18em] text-[#346739]">{password}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}