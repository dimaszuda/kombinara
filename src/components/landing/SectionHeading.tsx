interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Untuk section berlatar gelap */
  inverted?: boolean;
  align?: "center" | "left";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  inverted = false,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left"}>
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
          inverted ? "bg-white/15 text-white" : "bg-[#663362] text-white"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-4 text-2xl font-bold leading-tight sm:text-3xl ${
          inverted ? "text-white" : "text-[#346739]"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-base leading-relaxed ${inverted ? "text-white/80" : "text-[#6B6B66]"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
