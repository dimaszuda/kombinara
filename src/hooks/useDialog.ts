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
  const mounted = useRef(true);
  // Pemicu bisa sudah dilepas dari DOM saat efek berjalan (tombol pembuka panel), jadi activeElement = body.
  // Elemen terakhir yang difokus dicatat lebih awal lewat focusin.
  const lastFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    mounted.current = true; // StrictMode memasang ulang efek setelah cleanup pertama
    const onFocusIn = (e: FocusEvent) => { lastFocus.current = e.target as HTMLElement; };
    document.addEventListener("focusin", onFocusIn);
    return () => {
      mounted.current = false;
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  useEffect(() => {
    const all = [modal, ...panelsRef.current].map((r) => r.current);
    all.forEach((el) => el?.toggleAttribute("inert", !open));
    if (!open) return;

    const active = document.activeElement as HTMLElement | null;
    const trigger = active && active !== document.body ? active : lastFocus.current;
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
      if (trigger?.isConnected) return trigger.focus();
      // Tombol pembuka panel dilepas dari DOM selama panel terbuka; tombol penggantinya sudah dirender di commit yang
      // sama, jadi fokuskan tombol terlihat dengan nama yang sama. Tidak saat unmount (pindah halaman).
      const label = trigger?.getAttribute("aria-label");
      if (!label || !mounted.current) return;
      const same = document.querySelectorAll<HTMLElement>(`[aria-label="${CSS.escape(label)}"]`);
      Array.from(same).find(isShown)?.focus();
    };
  }, [open, modal]);
}
