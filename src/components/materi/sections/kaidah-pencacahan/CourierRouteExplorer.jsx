"use client";

import { useState, useCallback, useEffect } from "react";

/* ─── Layout SVG ────────────────────────────────────────────────── */
const SVG_W = 540;
const SVG_H = 260;
const AX = 68,  AY = 130;
const BX = 270, BY = 130;
const CX = 472, CY = 130;
const R  = 25;

/*
 * Offset Y dari control-point quadratic bezier masing-masing jalan.
 * Negatif = busur ke atas, positif = busur ke bawah.
 * Kombinasi keduanya menghasilkan tampilan saling bersilang seperti gambar referensi.
 */
const AB_ARCS = [-76, -40, -6, 36, 72];
const BC_ARCS = [-58, -22, 22, 58];

/** Quadratic bezier: (x1,y) → control(mid, y+offset) → (x2,y) */
function arcPath(x1, x2, y, offset) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y} Q ${mx} ${y + offset} ${x2} ${y}`;
}

/* ─── Diagram SVG interaktif ─────────────────────────────────────── */
function RouteSvg({
  phase, departAB, departBC, returnBC, returnAB,
  onSelectAB, onSelectBC, dotPos,
}) {
  const usedAB = departAB !== null ? [departAB] : [];
  const usedBC = departBC !== null ? [departBC] : [];
  const isRet  = phase === "return";

  function roadStyle(selected, disabled) {
    if (selected) return { stroke: "#346739", strokeWidth: 2.5, opacity: 1,    dash: "none", cursor: "default"     };
    if (disabled) return { stroke: "#9e9d99", strokeWidth: 1.5, opacity: 0.2,  dash: "5 6",  cursor: "not-allowed" };
    return              { stroke: "#9e9d99", strokeWidth: 1.5, opacity: 0.72, dash: "6 5",  cursor: "pointer"     };
  }

  function renderSegment(count, arcs, x1, x2, y, seg, selDepart, selReturn, used, onClick) {
    return Array.from({ length: count }, (_, i) => i + 1).map((n) => {
      const offset    = arcs[n - 1];
      const d         = arcPath(x1, x2, y, offset);
      const depSel    = selDepart === n;
      const retSel    = isRet && selReturn === n;
      const disabled  = isRet && used.includes(n);
      const clickable = !disabled && !depSel && !(isRet && retSel);
      const sty       = roadStyle(depSel || retSel, disabled);

      return (
        <g key={`${seg}-${n}`}>
          {/* Jalur visible — dashed idle, solid saat dipilih */}
          <path
            id={`path-${seg}-${n}`}
            d={d}
            fill="none"
            stroke={sty.stroke}
            strokeWidth={sty.strokeWidth}
            strokeDasharray={sty.dash}
            opacity={sty.opacity}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          {/* Hit-area transparan supaya mudah diklik */}
          <path
            d={d}
            fill="none"
            stroke="transparent"
            strokeWidth={26}
            style={{ cursor: clickable ? "pointer" : sty.cursor }}
            onClick={() => clickable && onClick(n)}
          />
        </g>
      );
    });
  }

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full max-w-[540px]"
      role="img"
      aria-label="Diagram rute interaktif kota A, B, C — klik jalan untuk memilih"
    >
      {/* Label jumlah jalan */}
      <text x={(AX+BX)/2} y={AY + AB_ARCS[0] - 18} textAnchor="middle" fontSize="10" fill="#663362" fontWeight="600">5 jalan A–B</text>
      <text x={(BX+CX)/2} y={BY + BC_ARCS[0] - 18} textAnchor="middle" fontSize="10" fill="#663362" fontWeight="600">4 jalan B–C</text>

      {/* Jalan A–B — path dari center kota A ke center kota B */}
      {renderSegment(5, AB_ARCS, AX, BX, AY, "ab", departAB, returnAB, usedAB, onSelectAB)}

      {/* Jalan B–C — path dari center kota B ke center kota C */}
      {renderSegment(4, BC_ARCS, BX, CX, BY, "bc", departBC, returnBC, usedBC, onSelectBC)}

      {/* Kota — render setelah jalan agar ada di depan */}
      {[[AX, AY, "A"], [BX, BY, "B"], [CX, CY, "C"]].map(([cx, cy, lbl]) => (
        <g key={lbl}>
          <circle cx={cx} cy={cy} r={R} fill="#fff" stroke="#663362" strokeWidth={2.5} />
          <text x={cx} y={cy + 6} textAnchor="middle" fontSize="15" fill="#663362" fontWeight="700">{lbl}</text>
        </g>
      ))}

      {/* Dot kurir — dirender paling akhir, selalu di atas semua elemen */}
      {dotPos && (
        <g>
          <circle cx={dotPos.x} cy={dotPos.y} r="11" fill="#346739" opacity="0.18" />
          <circle cx={dotPos.x} cy={dotPos.y} r="8"  fill="#346739" stroke="#DBFFD5" strokeWidth="2.5" />
          <circle cx={dotPos.x} cy={dotPos.y} r="2.5" fill="#DBFFD5" />
        </g>
      )}
    </svg>
  );
}

/* ─── Komponen Utama ─────────────────────────────────────────────── */
/**
 * CourierRouteExplorer — komponen hybrid pemantik rute kurir.
 * Simulasi (klik jalan + animasi dot) → state LOKAL, tidak ke DB.
 * Jawaban (radio + 2 textarea)        → props ke parent, disimpan ke DB.
 *
 * Props:
 *   choice             "yes" | "no" | null
 *   onChoiceChange     (val) => void
 *   reasoning          string
 *   onReasoningChange  (val) => void
 *   calcMethod         string
 *   onCalcMethodChange (val) => void
 */
export default function CourierRouteExplorer({
  choice,
  onChoiceChange,
  reasoning,
  onReasoningChange,
  calcMethod,
  onCalcMethodChange,
}) {
  /* ── State simulasi (lokal, tidak ke DB) ── */
  const [phase,    setPhase]    = useState("depart");
  const [departAB, setDepartAB] = useState(null);
  const [departBC, setDepartBC] = useState(null);
  const [returnBC, setReturnBC] = useState(null);
  const [returnAB, setReturnAB] = useState(null);

  /*
   * animTrigger: { segment: "ab"|"bc", roadNum, direction: "fwd"|"rev", id: number }
   * Setiap klik membuat objek baru (id = Date.now()) → AnimDot remount → animasi ulang.
   */
  /* dotCity: kota tempat dot berada saat idle */
  const [dotCity,     setDotCity]     = useState("A");
  /* dotPos: koordinat SVG dot — diupdate tiap frame oleh RAF */
  const [dotPos,      setDotPos]      = useState({ x: AX, y: AY });
  /* animTrigger: { segment, roadNum, direction, destCity, id } */
  const [animTrigger, setAnimTrigger] = useState(null);

  /* Setelah animasi selesai, update dotCity dan hapus trigger */
  useEffect(() => {
    if (!animTrigger) return;
    const t = setTimeout(() => {
      setDotCity(animTrigger.destCity);
      setAnimTrigger(null);
    }, 1650);
    return () => clearTimeout(t);
  }, [animTrigger]);

  /*
   * RAF animation — update dotPos setiap frame sehingga <circle>
   * di RouteSvg bergerak mengikuti jalan yang diklik.
   * Semua path SELALU ada di DOM (render unconditional), jadi
   * getElementById pasti berhasil setelah komponen mount.
   */
  useEffect(() => {
    if (!animTrigger) {
      // Idle: posisikan dot di kota saat ini
      const cx = dotCity === "A" ? AX : dotCity === "B" ? BX : CX;
      setDotPos({ x: cx, y: AY });
      return;
    }
    const pathEl = document.getElementById(
      `path-${animTrigger.segment}-${animTrigger.roadNum}`
    );
    if (!pathEl) return;
    const totalLen = pathEl.getTotalLength();
    const duration = 1500;
    let startTime = null;
    let rafId;
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    function frame(ts) {
      if (startTime === null) startTime = ts;
      const p   = Math.min((ts - startTime) / duration, 1);
      const dist = animTrigger.direction === "rev"
        ? (1 - ease(p)) * totalLen
        : ease(p) * totalLen;
      const pt = pathEl.getPointAtLength(dist);
      setDotPos({ x: pt.x, y: pt.y });
      if (p < 1) rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  // animTrigger?.id changes on every new click; dotCity repositions dot when idle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animTrigger?.id, dotCity]);

  /* Handler berangkat — dot: A→B, lalu B→C */
  const onDepartAB = useCallback((n) => {
    setDepartAB(n);
    setAnimTrigger({ segment: "ab", roadNum: n, direction: "fwd", destCity: "B", id: Date.now() });
  }, []);
  const onDepartBC = useCallback((n) => {
    setDepartBC(n);
    setAnimTrigger({ segment: "bc", roadNum: n, direction: "fwd", destCity: "C", id: Date.now() });
  }, []);

  /* Handler pulang — dot: C→B, lalu B→A */
  const onReturnBC = useCallback((n) => {
    if (n === departBC) return;
    setReturnBC(n);
    setAnimTrigger({ segment: "bc", roadNum: n, direction: "rev", destCity: "B", id: Date.now() });
  }, [departBC]);
  const onReturnAB = useCallback((n) => {
    if (n === departAB) return;
    setReturnAB(n);
    setAnimTrigger({ segment: "ab", roadNum: n, direction: "rev", destCity: "A", id: Date.now() });
  }, [departAB]);

  const departComplete = departAB !== null && departBC !== null;
  const returnComplete = returnBC !== null && returnAB !== null;
  const simComplete    = departComplete && returnComplete;

  const handleReset = useCallback(() => {
    setPhase("depart");
    setDepartAB(null); setDepartBC(null);
    setReturnBC(null); setReturnAB(null);
    setAnimTrigger(null);
    setDotCity("A");
    setDotPos({ x: AX, y: AY });
  }, []);

  return (
    <div className="rounded-xl border border-[#34673933] bg-white p-4">

      {/* Petunjuk singkat */}
      <div className="mb-3 rounded-lg border border-[#66336233] bg-[#66336208] px-4 py-3">
        <p className="text-xs leading-relaxed text-[#2C2C2A]">
          👆 <span className="font-medium text-[#346739]">Klik salah satu jalan</span> di diagram
          untuk memilih rute berangkat (A→C), lalu pulang (C→A). Jalan yang sudah dipakai saat
          berangkat nggak bisa dipilih lagi pas pulang.
        </p>
      </div>

      {/* Diagram interaktif */}
      <div className="flex flex-col items-center">
        <RouteSvg
          phase={phase}
          departAB={departAB}
          departBC={departBC}
          returnBC={returnBC}
          returnAB={returnAB}
          onSelectAB={phase === "depart" ? onDepartAB : onReturnAB}
          onSelectBC={phase === "depart" ? onDepartBC : onReturnBC}
          dotPos={dotPos}
        />
      </div>

      {/* Tahap 1: Berangkat */}
      {phase === "depart" && (
        <div className="mt-2 rounded-lg border border-[#34673933] bg-[#F8FBF7] p-3">
          <p className="text-xs font-medium text-[#663362]">Tahap 1: Berangkat A → C</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-1 font-medium ${departAB ? "bg-[#34673915] text-[#346739]" : "bg-[#34673908] text-[#34673966]"}`}>
              A–B: {departAB ? `Jalan ${departAB}` : "belum dipilih"}
            </span>
            <span className={`rounded-full px-2.5 py-1 font-medium ${departBC ? "bg-[#34673915] text-[#346739]" : "bg-[#34673908] text-[#34673966]"}`}>
              B–C: {departBC ? `Jalan ${departBC}` : "belum dipilih"}
            </span>
          </div>
          {departComplete && (
            <div className="mt-3 rounded-lg bg-[#DBFFD5] p-3 text-center transition-all duration-300">
              <p className="text-sm leading-relaxed text-[#346739]">
                🚚 Berangkat lewat <strong>A-B Jalan {departAB}</strong> dan <strong>B-C Jalan {departBC}</strong>
              </p>
              <button
                type="button"
                onClick={() => setPhase("return")}
                className="mt-3 rounded-full bg-[#346739] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95"
              >
                Lanjut ke perjalanan pulang
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tahap 2: Pulang */}
      {phase === "return" && (
        <div className="mt-2 rounded-lg border border-[#66336233] bg-[#FDFBFC] p-3">
          <p className="text-xs font-medium text-[#663362]">
            Tahap 2: Pulang C → A (nggak boleh lewat jalan yang sama)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#2C2C2A]">
            Jalan yang sudah dipakai saat berangkat{" "}
            <span className="font-medium text-[#663362]">nggak bisa diklik lagi</span>.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-1 font-medium ${returnBC ? "bg-[#34673915] text-[#346739]" : "bg-[#34673908] text-[#34673966]"}`}>
              B–C: {returnBC ? `Jalan ${returnBC}` : "belum dipilih"}
            </span>
            <span className={`rounded-full px-2.5 py-1 font-medium ${returnAB ? "bg-[#34673915] text-[#346739]" : "bg-[#34673908] text-[#34673966]"}`}>
              A–B: {returnAB ? `Jalan ${returnAB}` : "belum dipilih"}
            </span>
          </div>
          {returnComplete && (
            <div className="mt-3 rounded-lg bg-[#DBFFD5] p-3 text-center transition-all duration-300">
              <p className="text-sm leading-relaxed text-[#346739]">
                🏠 Pulang lewat <strong>B-C Jalan {returnBC}</strong> dan <strong>A-B Jalan {returnAB}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ringkasan setelah satu putaran selesai */}
      {simComplete && (
        <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3 transition-all duration-300">
          <p className="text-xs font-medium text-[#663362]">📋 Ringkasan rute simulasi</p>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-[#2C2C2A]">
            <p>🚚 <span className="font-medium">Berangkat:</span> A–B Jalan {departAB} → B–C Jalan {departBC}</p>
            <p>🏠 <span className="font-medium">Pulang:</span> C–B Jalan {returnBC} → B–A Jalan {returnAB}</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#34673999]">
            Pas pulang, pilihan jalanmu berkurang karena nggak boleh lewat jalan yang sama.
            Kira-kira, berapa total rute berbeda yang mungkin buat satu putaran pulang-pergi kayak gini?
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 rounded-full border border-[#34673933] bg-white px-5 py-2 text-sm font-medium text-[#346739] transition-colors hover:bg-[#34673908] active:scale-95"
          >
            🔄 Coba rute lain
          </button>
        </div>
      )}

      {/* ── Bagian Jawaban (disimpan ke DB via props) ── */}
      <div className="mt-5 border-t border-[#34673926] pt-4">
        <p className="text-sm font-medium leading-relaxed text-[#2C2C2A]">
          Perlu nggak aturan kayak gitu buat kurir?
        </p>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onChoiceChange("yes")}
            className="rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              borderColor: "#663362",
              backgroundColor: choice === "yes" ? "#663362" : "#ffffff",
              color: choice === "yes" ? "#ffffff" : "#663362",
            }}
          >
            Perlu
          </button>
          <button
            type="button"
            onClick={() => onChoiceChange("no")}
            className="rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              borderColor: "#663362",
              backgroundColor: choice === "no" ? "#663362" : "#ffffff",
              color: choice === "no" ? "#ffffff" : "#663362",
            }}
          >
            Nggak perlu
          </button>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-[#663362]">Alasanmu</label>
          <textarea
            placeholder="kenapa menurutmu begitu"
            value={reasoning}
            onChange={(e) => onReasoningChange(e.target.value)}
            className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-[#663362]">
            Cara hitung total rutenya
          </label>
          <textarea
            placeholder="ceritain logikamu"
            value={calcMethod}
            onChange={(e) => onCalcMethodChange(e.target.value)}
            className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y"
          />
        </div>
      </div>
    </div>
  );
}
