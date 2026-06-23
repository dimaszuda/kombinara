// ============================================================================
// Shared internals for Kaidah Perkalian
// ============================================================================

import React from "react";
import { IconCheck } from "@/components/ui/IconButton";

// ============================================================================
// Color constants
// ============================================================================

export const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  wrong: "#b91c1c",
};

// ============================================================================
// InputBlank — inline answer checker
// ============================================================================

export function InputBlank({ answer, width = 56 }: { answer: string | number; width?: number }) {
  const [value, setValue] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const isCorrect = value.trim() === String(answer);

  return (
    <span className="inline-flex items-center gap-1.5 align-middle mx-1">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setChecked(false);
        }}
        placeholder="..."
        style={{
          width,
          borderColor: checked ? (isCorrect ? C.green : C.wrong) : "#94a3b8",
          color: C.green,
        }}
        className="border-2 rounded-md px-2 py-0.5 text-center font-semibold text-sm focus:outline-none"
      />
      <button
        onClick={() => setChecked(true)}
        style={{ backgroundColor: C.green }}
        className="rounded-md p-1 hover:opacity-90 transition"
        aria-label="Cek jawaban"
      >
        <IconCheck />
      </button>
      {checked && !isCorrect && (
        <span className="text-xs font-medium" style={{ color: C.wrong }}>
          Jawaban: {answer}
        </span>
      )}
    </span>
  );
}

// ============================================================================
// ChoiceToggle — option buttons
// ============================================================================

export function ChoiceToggle({ options, correct }: { options: string[]; correct: string }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  return (
    <span className="inline-flex flex-wrap gap-2 mx-1 align-middle">
      {options.map((opt: string) => {
        const isSelected = selected === opt;
        const isCorrect = isSelected && opt === correct;
        return (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
            style={{
              backgroundColor: isSelected ? (isCorrect ? C.green : C.wrong) : C.greenLight,
              color: isSelected ? C.white : C.green,
              borderColor: isSelected ? (isCorrect ? C.green : C.wrong) : C.green,
            }}
            className="rounded-full border-2 px-3 py-1 text-sm font-medium transition"
          >
            {opt}
          </button>
        );
      })}
    </span>
  );
}

// ============================================================================
// KotakPengisian — placeholder visualisation
// ============================================================================

export function KotakPengisian({ values, labels }: { values: string[]; labels: string[] }) {
  const total = values.reduce((a: number, b: string) => a * (Number(b) || 0), 1);
  const allFilled = values.every((v: string) => v !== "" && !isNaN(Number(v)));

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-5">
      {values.map((v: string, i: number) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              style={{ backgroundColor: C.greenLight, borderColor: C.green }}
              className="w-16 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-bold"
            >
              <span style={{ color: C.green }}>{v === "" ? "?" : v}</span>
            </div>
            <span className="text-xs font-medium text-center" style={{ color: C.green }}>
              {labels[i]}
            </span>
          </div>
          {i < values.length - 1 && (
            <span className="text-2xl font-bold pb-5" style={{ color: C.purple }}>
              ×
            </span>
          )}
        </React.Fragment>
      ))}
      <span className="text-2xl font-bold pb-5" style={{ color: C.purple }}>
        =
      </span>
      <div className="flex flex-col items-center gap-1.5">
        <div
          style={{ backgroundColor: C.green }}
          className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
        >
          <span style={{ color: C.white }}>{allFilled ? total : "?"}</span>
        </div>
        <span className="text-xs font-medium" style={{ color: C.green }}>
          Total PIN
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// PohonKeputusan — decision tree SVG
// ============================================================================

export function PohonKeputusan() {
  const minuman = ["Es Teh", "Es Jeruk", "Es Buah"];
  const makanan = [
    { label: "Soto", x: 180 },
    { label: "Sop", x: 520 },
  ];

  return (
    <svg viewBox="0 0 700 250" className="w-full h-auto">
      {/* lines: root to level 1 */}
      {makanan.map((m) => (
        <line key={m.label} x1="350" y1="40" x2={m.x} y2="110" stroke={C.purple} strokeWidth="2" />
      ))}

      {/* lines: level 1 to level 2 */}
      {makanan.map((m) =>
        minuman.map((_, j) => {
          const leafX = m.x - 90 + j * 90;
          return (
            <line
              key={`${m.label}-${j}`}
              x1={m.x}
              y1="120"
              x2={leafX}
              y2="190"
              stroke={C.green}
              strokeWidth="2"
            />
          );
        })
      )}

      {/* root node */}
      <circle cx="350" cy="30" r="20" fill={C.green} />
      <text x="350" y="35" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.white}>
        Mulai
      </text>

      {/* level 1 nodes */}
      {makanan.map((m) => (
        <g key={m.label}>
          <rect x={m.x - 32} y="100" width="64" height="28" rx="8" fill={C.purple} />
          <text x={m.x} y="118" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.white}>
            {m.label}
          </text>
        </g>
      ))}

      {/* level 2 leaves */}
      {makanan.map((m) =>
        minuman.map((label, j) => {
          const leafX = m.x - 90 + j * 90;
          return (
            <g key={`${m.label}-leaf-${j}`}>
              <rect
                x={leafX - 38}
                y="190"
                width="76"
                height="28"
                rx="8"
                fill={C.greenLight}
                stroke={C.green}
                strokeWidth="1.5"
              />
              <text x={leafX} y="208" textAnchor="middle" fontSize="11" fontWeight="500" fill={C.green}>
                {label}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ============================================================================
// SectionLabel — small section heading
// ============================================================================

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2"
      style={{ color: C.green }}
    >
      {children}
    </h2>
  );
}
