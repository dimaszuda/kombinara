"use client";

import React from "react";

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-5 inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white">
      {children}
    </span>
  );
}