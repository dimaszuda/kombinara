// components/materi/contoh-soal-bertahap/primitives.tsx

import type { ReactNode } from "react";

type BlankStatus = "idle" | "correct" | "incorrect";

export function Blank({
  value,
  onChange,
  status,
  width = "w-16",
}: {
  value: string;
  onChange: (value: string) => void;
  status: BlankStatus;
  width?: string;
}) {
  const borderColor =
    status === "correct" ? "#346739" : status === "incorrect" ? "#663362" : "#34673933";

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`mx-1 inline-block ${width} rounded-md border-2 px-2 py-0.5 text-center text-sm`}
      style={{ borderColor }}
    />
  );
}

export function DifficultyBadge({ level }: { level: "mudah" | "sedang" | "hots" }) {
  const style = {
    mudah: { background: "#DBFFD5", color: "#346739", border: "1px solid #346739" },
    sedang: { background: "#346739", color: "#ffffff", border: "none" },
    hots: { background: "#663362", color: "#ffffff", border: "none" },
  }[level];

  const label = { mudah: "Mudah", sedang: "Sedang", hots: "HOTS" }[level];

  return (
    <span className="rounded-full px-3 py-1 text-xs font-medium" style={style}>
      {label}
    </span>
  );
}

export function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="4" y="9" width="12" height="8" rx="2" fill="none" stroke="#34673999" strokeWidth={1.6} />
      <path d="M6.5 9 V6.5 a3.5 3.5 0 0 1 7 0 V9" fill="none" stroke="#34673999" strokeWidth={1.6} />
    </svg>
  );
}

export type ExampleStatus = "locked" | "active" | "completed";

export function ExampleShell({
  status,
  level,
  title,
  illustrationSrc,
  illustrationAlt,
  lockedHint,
  children,
  onCheck,
  feedback,
}: {
  status: ExampleStatus;
  level: "mudah" | "sedang" | "hots";
  title: string;
  illustrationSrc: string;
  illustrationAlt: string;
  lockedHint: string;
  children: ReactNode;
  onCheck: () => void;
  feedback: "idle" | "correct" | "incorrect";
}) {
  if (status === "locked") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#34673926] bg-[#fafafa] p-4 opacity-55">
        <LockIcon />
        <div>
          <DifficultyBadge level={level} />
          <p className="mt-1 text-sm text-[#34673999]">{lockedHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#DBFFD5] p-5">
      <div className="flex items-center justify-between">
        <DifficultyBadge level={level} />
        {status === "completed" && (
          <span className="text-sm font-medium text-[#346739]">Selesai</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4">
        {/* ganti src ini dengan ilustrasi yang sudah di-recolor dari undraw.co */}
        <img
          src={illustrationSrc}
          alt={illustrationAlt}
          className="h-16 w-16 rounded-lg bg-white object-contain p-2"
        />
        <p className="text-lg font-medium text-[#346739]">{title}</p>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#2C2C2A]">{children}</div>

      {status === "active" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={onCheck}
            className="rounded-full bg-[#346739] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2C5830]"
          >
            Cek Jawaban
          </button>
          {feedback === "correct" && (
            <span className="text-sm font-medium text-[#346739]">
              Benar, lanjut ke contoh berikutnya
            </span>
          )}
          {feedback === "incorrect" && (
            <span className="text-sm font-medium text-[#663362]">
              Masih ada yang kurang tepat, coba cek lagi
            </span>
          )}
        </div>
      )}
    </div>
  );
}