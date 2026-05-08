import { redirect } from "next/navigation";

// Root redirect — middleware will handle role-based routing
// but this acts as a fallback
export default function RootPage() {
  redirect("/login");
}
