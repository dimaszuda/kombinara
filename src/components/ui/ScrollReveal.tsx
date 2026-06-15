"use client";

import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type AnimationVariant = "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-in";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Variasi animasi (default: "fade-up") */
  variant?: AnimationVariant;
  /** Delay animasi dalam ms, buat efek stagger antar section (default 0) */
  delay?: number;
  /** Durasi animasi dalam ms (default 600) */
  duration?: number;
  /** Opsi untuk Intersection Observer */
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  /** Class tambahan */
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 600,
  threshold,
  rootMargin,
  once,
  className = "",
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, rootMargin, once });

  const baseClass = "sr-wrapper";
  const variantClass = `sr-${variant}`;
  const visibleClass = isVisible ? "sr-visible" : "";

  return (
    <div
      ref={ref}
      className={`${baseClass} ${variantClass} ${visibleClass} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
