"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import Chatbot from "@/components/materi/Chatbot";
import TableContent from "./TableContent";
import { ChatContext } from "./ChatContext";
import type { SelectionContext } from "@/lib/ai/context";

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
  const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(null);

  const askAIWithContext = useCallback((ctx: SelectionContext) => {
    setSelectionContext(ctx);
    setActivePanel("chatbot");
  }, []);

  const handleChatbotClose = useCallback(() => {
    setActivePanel(null);
    // Clear selection context after closing
    setSelectionContext(null);
  }, []);

  const handleChatbotOpen = useCallback(() => {
    setSelectionContext(null); // No context when opened via icon
    setActivePanel("chatbot");
  }, []);

  return (
    <ChatContext.Provider value={{ askAIWithContext }}>
      {children}
      <Chatbot
        isOpen={activePanel === "chatbot"}
        onOpen={handleChatbotOpen}
        onClose={handleChatbotClose}
        otherPanelOpen={activePanel !== null && activePanel !== "chatbot"}
        selectionContext={selectionContext}
        onClearContext={() => setSelectionContext(null)}
      />
      <TableContent
        isOpen={activePanel === "tablecontent"}
        onOpen={() => setActivePanel("tablecontent")}
        onClose={() => setActivePanel(null)}
        otherPanelOpen={activePanel !== null && activePanel !== "tablecontent"}
        activeSection={activeSection}
        completedSections={completedSections}
      />
    </ChatContext.Provider>
  );
}
