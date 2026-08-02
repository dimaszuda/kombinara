import React from "react";

/** Ikon piala untuk section Tantangan */
export function TrophyIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Cup body */}
      <path
        d="M10 8 L12 26 L24 26 L26 8 Z"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Left handle */}
      <path
        d="M10 10 C5 10 5 18 10 18"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Right handle */}
      <path
        d="M26 10 C31 10 31 18 26 18"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Star inside cup */}
      <path
        d="M18,11 L19.5,15 L24,15 L20.5,18 L21.5,22 L18,19.5 L14.5,22 L15.5,18 L12,15 L16.5,15 Z"
        fill="none"
        stroke="#346739"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Base */}
      <rect x="14" y="26" width="8" height="4" rx="1" fill="none" stroke="#346739" strokeWidth="2.5" />
      <rect x="16" y="30" width="4" height="3" rx="1" fill="none" stroke="#346739" strokeWidth="2.5" />
    </svg>
  );
}

/** Ikon clipboard checklist untuk section Asesmen Diri */
export function ClipboardCheckIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Clipboard body */}
      <rect x="8" y="6" width="20" height="26" rx="3" fill="none" stroke="#346739" strokeWidth="2.5" />
      {/* Clip top */}
      <path
        d="M18 6 L18 10 M13 6 L23 6"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Check marks */}
      <path
        d="M13 16 L16 19 L23 12"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 23 L16 26 L23 19"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ikon lampu untuk section Refleksi Mendalam */
export function LightbulbIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Bulb */}
      <path
        d="M18 4 C11 4 8 10 8 15 C8 19 10.5 22 13 24.5 L13 28 L23 28 L23 24.5 C25.5 22 28 19 28 15 C28 10 25 4 18 4 Z"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Filament lines */}
      <path d="M16 16 L18 13 L18 22" fill="none" stroke="#346739" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16 L18 13" fill="none" stroke="#346739" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Base screw */}
      <rect x="14" y="28" width="8" height="4" rx="2" fill="none" stroke="#346739" strokeWidth="2.5" />
      {/* Rays */}
      <path d="M12 8 L9 6" stroke="#346739" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8 L27 6" stroke="#346739" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 16 L4 15" stroke="#346739" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 16 L32 15" stroke="#346739" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Ikon buku terbuka untuk section Rangkuman Konsep */
export function BookOpenIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Left page */}
      <path
        d="M18 6 L6 10 L6 30 L18 26 Z"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right page */}
      <path
        d="M18 6 L30 10 L30 30 L18 26 Z"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Center spine line */}
      <path d="M18 6 L18 26" stroke="#346739" strokeWidth="2" strokeLinecap="round" />
      {/* Text lines left */}
      <path d="M10 14 L16 13" stroke="#346739" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 18 L16 17" stroke="#346739" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 22 L16 21" stroke="#346739" strokeWidth="1.5" strokeLinecap="round" />
      {/* Text lines right */}
      <path d="M26 14 L20 13" stroke="#346739" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 18 L20 17" stroke="#346739" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 22 L20 21" stroke="#346739" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Ikon buku bertanda untuk section Glosarium */
export function BookMarkedIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Book closed */}
      <path
        d="M8 6 L28 6 L28 32 L18 27 L8 32 Z"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Bookmark ribbon */}
      <path
        d="M22 6 L22 16 L19 14 L16 16 L16 6"
        fill="none"
        stroke="#346739"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* "A-Z" text on cover */}
      <text x="18" y="24" textAnchor="middle" fontSize="6" fontWeight="700" fill="#346739">A-Z</text>
    </svg>
  );
}
