"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseScrollRevealOptions {
  /** Threshold: 0–1, seberapa banyak element harus terlihat sebelum trigger (default 0.15) */
  threshold?: number;
  /** Root margin, seperti CSS margin. Bisa dipakai buat trigger lebih awal (default "0px 0px -50px 0px") */
  rootMargin?: string;
  /** Trigger sekali saja atau setiap kali scroll? (default true = sekali) */
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = "0px 0px -50px 0px", once = true } = options;
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

    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [callback, threshold, rootMargin]);

  return { ref, isVisible };
}
