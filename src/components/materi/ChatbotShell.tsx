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
  /** Key dari section yang sedang aktif */
  activeKey?: string | null;
  /** Set of section keys yang sudah completed */
  completedKeys?: Set<string>;
}

export default function ChatbotShell({
  children,
  activeKey = null,
  completedKeys = new Set(),
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
        activeKey={activeKey}
        completedKeys={completedKeys}
      />
    </ChatContext.Provider>
  );
}
