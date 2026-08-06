"use client";

/**
 * ProgressDonut — Animated SVG donut chart
 *
 * Displays a circular progress indicator with:
 * - A background track ring
 * - A colored progress arc that animates on mount
 * - Center text showing percentage or fraction
 *
 * Props:
 * - percentage: 0–100 number
 * - size: diameter in px (default 120)
 * - strokeWidth: ring thickness in px (default 10)
 * - color: progress arc color (default brand-600 / #16a34a)
 * - trackColor: background ring color (default #e5e7eb)
 * - label: optional label below the percentage
 * - animated: whether to animate on mount (default true)
 *
 * LAYOUT FIX (see chat): the previous version centered the percentage
 * text using a negative-margin hack (`marginTop: -0.52 * size`) on a
 * normal-flow div. That pulls the *next* sibling upward too and makes
 * this component's rendered height shorter than the SVG itself — which
 * is exactly what breaks a tight multi-column grid: cells end up
 * overlapping vertically once several of these sit next to each other.
 *
 * Fixed by making the wrapper `relative` with a fixed size, and the
 * text overlay `absolute inset-0` + flex-centered. The component's
 * layout footprint is now always exactly size x size — no flow-based
 * margin math that can drift.
 */

import { useEffect, useRef, useState } from "react";

interface ProgressDonutProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  animated?: boolean;
}

export default function ProgressDonut({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = "#16a34a",
  trackColor = "#e5e7eb",
  label,
  animated = true,
}: ProgressDonutProps) {
  const [displayPercent, setDisplayPercent] = useState(animated ? 0 : percentage);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setDisplayPercent(percentage);
      return;
    }

    const duration = 800; // ms
    const startTime = performance.now();
    const startPct = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPercent(startPct + (percentage - startPct) * eased);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [percentage, animated]);

  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(Math.max(displayPercent, 0), 100);
  const dashOffset = circumference - (clampedPct / 100) * circumference;

  // For small percentages, ensure a tiny arc is still visible
  const minArc = 1;
  const adjustedOffset =
    clampedPct > 0 && clampedPct < (minArc / circumference) * 100
      ? circumference - minArc
      : dashOffset;

  const fontSize = size * 0.22;
  const subFontSize = size * 0.11;

  return (
    // `relative` + fixed size box: this element's footprint in the
    // grid is always exactly size x size, no matter what's inside it.
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
        aria-label={`Progress: ${Math.round(clampedPct)}%`}
        role="progressbar"
        aria-valuenow={Math.round(clampedPct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={adjustedOffset}
          style={{
            transition: animated ? "none" : "stroke-dashoffset 0.4s ease",
          }}
        />
      </svg>

      {/* Center text overlay — absolutely positioned within the
          relative wrapper above, so it never affects layout height
          and always sits dead-center on the ring regardless of
          neighboring grid cells. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold leading-none text-brand-600"
          style={{ fontSize: `${fontSize}px` }}
        >
          {Math.round(clampedPct)}%
        </span>
        {label && (
          <span
            className="leading-tight text-zinc-500"
            style={{ fontSize: `${subFontSize}px` }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}