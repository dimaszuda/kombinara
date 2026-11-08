/**
 * Ikon SVG inline untuk landing page.
 * Stroke mengikuti `currentColor`: atur warna lewat kelas teks (mis. `text-[#346739]`).
 */

interface IconProps {
  className?: string;
}

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconArrowRight({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconCheckSmall({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} strokeWidth={3}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}
