"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const isShown = (el: HTMLElement | null): el is HTMLElement => !!el && el.getClientRects().length > 0;
const focusables = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isShown);

/**
 * Perilaku keyboard untuk modal, drawer, dan bottom sheet:
 * - Escape menutup.
 * - Saat dibuka, fokus masuk ke panel yang terlihat; saat ditutup, kembali ke elemen pemicunya.
 * - Tab dikurung di `modal` selama modal terlihat.
 * - Saat tertutup, `modal` dan `panels` diberi `inert` supaya isinya yang tersembunyi di luar layar tidak bisa di-Tab.
 * `panels` = panel non-modal (panel samping desktop): ikut Escape/inert/fokus awal, tapi Tab tidak dikurung.
 */
export function useDialog(
  open: boolean,
  onClose: () => void,
  modal: RefObject<HTMLElement>,
  ...panels: RefObject<HTMLElement>[]
) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const panelsRef = useRef(panels);
  panelsRef.current = panels;

  useEffect(() => {
    const all = [modal, ...panelsRef.current].map((r) => r.current);
    all.forEach((el) => el?.toggleAttribute("inert", !open));
    if (!open) return;

    const trigger = document.activeElement as HTMLElement | null;
    const shown = all.find(isShown);
    if (shown && !shown.contains(trigger)) focusables(shown)[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closeRef.current();
      const el = modal.current;
      if (e.key !== "Tab" || !isShown(el)) return;
      const items = focusables(el);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!el.contains(active) || active === (e.shiftKey ? first : last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open, modal]);
}
