"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Sidebar from "@/components/dashboard/Sidebar";

// Protect route via middleware — jangan rely on client-side check
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "relative", flexShrink: 0, height: "100vh" }}>
        {!expanded && (
          <Image
            src="/images/icon kombinara.png"
            alt="Kombinara"
            width={150}
            height={170}
            style={{
              position: "absolute",
              top: 20,
              left: "10%",
              transform: "translateX(50%)",
              zIndex: 10,
              pointerEvents: "none",
              width: 150,
              height: "auto",
              maxWidth: "none",
              marginTop: "8px"
            }}
          />
        )}
        <Sidebar expanded={expanded} onToggle={setExpanded} />
      </div>
      <main style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        {/* Sticky spacer: prevents content from scrolling under the Kombinara icon */}
        <div style={{ position: "sticky", top: 0, height: "80px", background: "white", zIndex: 9, borderBottom: "1px solid #346739" }} />
        {children}
      </main>
    </div>
  );
}
