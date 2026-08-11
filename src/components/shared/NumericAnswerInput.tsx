"use client";

import React, { useState, useRef, useCallback } from "react";

type NumericAnswerInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "pattern" | "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  /** Munculkan warning saat karakter non-digit diketik. Default true. */
  showWarning?: boolean;
};

/**
 * Input khusus jawaban akhir — hanya menerima digit 0-9.
 * Menampilkan pesan peringatan informatif saat siswa mencoba
 * mengetik karakter selain angka.
 */
const NumericAnswerInput = React.forwardRef<
  HTMLInputElement,
  NumericAnswerInputProps
>(function NumericAnswerInput(
  { value, onChange, showWarning = true, className, style, placeholder, id, ...rest },
  ref,
) {
  const [warning, setWarning] = useState(false);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const digitsOnly = raw.replace(/\D/g, "");

      // Deteksi apakah ada karakter non-digit yang baru saja diketik
      if (showWarning && raw !== digitsOnly) {
        // Tampilkan warning
        setWarning(true);
        // Reset timer: sembunyikan setelah 2.5 detik
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        warningTimerRef.current = setTimeout(() => setWarning(false), 2500);
      }

      onChange(digitsOnly);
    },
    [onChange, showWarning],
  );

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? "Tulis angka saja..."}
        className={className}
        style={style}
        {...rest}
      />
      {warning && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#b45309",
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "6px 10px",
            lineHeight: 1.5,
            animation: "fadeIn 0.2s ease",
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
          }}
        >
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>
            Cukup tulis <strong>bilangan bulat</strong>-nya saja. Gak perlu ada keterangan.
          </span>
        </div>
      )}
    </div>
  );
});

export default NumericAnswerInput;
