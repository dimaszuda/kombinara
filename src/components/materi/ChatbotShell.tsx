"use client";

import type { ReactNode } from "react";
import Chatbot from "@/components/materi/Chatbot";

interface ChatbotShellProps {
  children: ReactNode;
}

export default function ChatbotShell({ children }: ChatbotShellProps) {
  return (
    <>
      {children}
      <Chatbot />
    </>
  );
}
