"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Chatbot from "@/components/materi/Chatbot";
import TableContent from "./TableContent";

type PanelKind = "chatbot" | "tablecontent" | null;

interface ChatbotShellProps {
  children: ReactNode;
  activeSection?: number;
  completedSections?: Set<number>;
}

export default function ChatbotShell({
  children,
  activeSection = 1,
  completedSections = new Set(),
}: ChatbotShellProps) {
  const [activePanel, setActivePanel] = useState<PanelKind>(null);

  return (
    <>
      {children}
      <Chatbot
        isOpen={activePanel === "chatbot"}
        onOpen={() => setActivePanel("chatbot")}
        onClose={() => setActivePanel(null)}
        otherPanelOpen={activePanel !== null && activePanel !== "chatbot"}
      />
      <TableContent
        isOpen={activePanel === "tablecontent"}
        onOpen={() => setActivePanel("tablecontent")}
        onClose={() => setActivePanel(null)}
        otherPanelOpen={activePanel !== null && activePanel !== "tablecontent"}
        activeSection={activeSection}
        completedSections={completedSections}
      />
    </>
  );
}
