import type { ReactNode } from "react";

// TODO: Add sidebar/navbar layout untuk dashboard
// Protect route via middleware — jangan rely on client-side check
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
