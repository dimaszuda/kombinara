"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseScrollRevealOptions {
  /** Threshold: 0–1, seberapa banyak element harus terlihat sebelum trigger (default 0.1) */
  threshold?: number;
  /** Root margin, seperti CSS margin. Bisa dipakai buat trigger lebih awal (default "0px") */
  rootMargin?: string;
  /** Trigger sekali saja atau setiap kali scroll? (default true = sekali) */
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const callback = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setIsVisible(false);
        }
      });
    },
    [once]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Immediate check: if the element is already in the viewport when the
    // observer is first attached, mark it as visible right away. This handles
    // edge cases where IntersectionObserver's async initial callback might not
    // fire reliably (e.g. very tall elements on small mobile viewports where
    // the threshold ratio calculation can behave unexpectedly).
    const rect = el.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    const visibleHeight =
      Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0);
    if (visibleHeight > 0) {
      const ratio = visibleHeight / rect.height;
      if (ratio >= threshold) {
        setIsVisible(true);
        return; // No need to set up the observer
      }
    }

    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [callback, threshold, rootMargin]);

  return { ref, isVisible };
}
