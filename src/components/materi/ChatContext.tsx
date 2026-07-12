"use client";

import { createContext, useContext } from "react";
import type { SelectionContext } from "@/lib/ai/context";

interface ChatContextValue {
  /** Trigger chatbot panel dengan konteks dari teks yang di-highlight */
  askAIWithContext: (ctx: SelectionContext) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue | null {
  return useContext(ChatContext);
}

export { ChatContext };
