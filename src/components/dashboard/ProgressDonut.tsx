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
 */

import { useEffect, useState, useRef } from "react";

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
    <div className="inline-flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
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
      {/* Center text overlay */}
      <div
        className="flex flex-col items-center"
        style={{ marginTop: `-${size * 0.52}px`, marginBottom: `${size * 0.08}px` }}
      >
        <span
          className="font-bold leading-none text-brand-600"
          style={{ fontSize: `${fontSize}px` }}
        >
          {Math.round(clampedPct)}%
        </span>
        {label && (
          <span
            className="text-zinc-500 leading-tight"
            style={{ fontSize: `${subFontSize}px` }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
