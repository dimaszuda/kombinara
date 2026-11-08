interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Untuk section berlatar gelap */
  inverted?: boolean;
}

export default function SectionHeading({ title, description, inverted = false }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2
        className={`text-2xl font-bold leading-tight sm:text-3xl ${
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
