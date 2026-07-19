/**
 * Device type detection utility.
 *
 * Detects whether the current device is mobile, tablet, or desktop
 * based on a combination of User-Agent sniffing, touch capability check,
 * and viewport width as fallback.
 *
 * Called ONCE when the attempt starts — the result is stored in
 * asesmen_formatif_attempts.device_type and carried into every
 * integrity_events row. Do NOT re-detect per event.
 */

export type DeviceType = "mobile" | "tablet" | "desktop";

export function getDeviceType(): DeviceType {
  // Only run client-side
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "desktop";
  }

  const ua = navigator.userAgent.toLowerCase();
  const hasTouch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const vw = window.innerWidth;

  // ── Explicit tablet detection via UA ──────────────────────────────────
  // iPads often report as "Macintosh" in modern iPadOS but have touch.
  // Android tablets have "android" but NOT "mobile" in UA.
  const isUA_iPad =
    /ipad/.test(ua) ||
    (/macintosh/.test(ua) && hasTouch && vw >= 768);
  const isUA_AndroidTablet =
    /android/.test(ua) && !/mobile/.test(ua) && vw >= 768;

  if (isUA_iPad || isUA_AndroidTablet) {
    return "tablet";
  }

  // ── Explicit mobile detection via UA ──────────────────────────────────
  const isUA_Mobile =
    /iphone|ipod/.test(ua) ||
    (/android/.test(ua) && /mobile/.test(ua)) ||
    /blackberry|windows phone/.test(ua);

  if (isUA_Mobile) {
    return "mobile";
  }

  // ── Fallback: use touch + viewport ────────────────────────────────────
  if (hasTouch) {
    // Touch-capable with larger viewport → tablet
    if (vw >= 768) return "tablet";
    // Small touch device → mobile
    return "mobile";
  }

  // No touch, any viewport → desktop
  return "desktop";
}
