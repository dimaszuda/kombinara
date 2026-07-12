"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import type { SelectionContext } from "@/lib/ai/context";
import { RichText } from "@/components/shared/RichText";
import { markdownToHtml } from "@/lib/markdown";

// ─── Portal Tooltip ───────────────────────────────────────────────────────────
function PortalTooltip({
  label,
  anchorRef,
}: {
  label: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        right: window.innerWidth - rect.left + 10,
      });
    }
  }, [anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        right: pos.right,
        transform: "translateY(-50%)",
        backgroundColor: "rgba(30, 30, 30, 0.92)",
        color: "white",
        fontSize: 13,
        fontWeight: 500,
        padding: "5px 10px",
        borderRadius: 6,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 9999,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}
    >
      {label}
    </div>,
    document.body
  );
}

// ─── Message type ─────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: "user" | "ai";
  text: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChatbotProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  otherPanelOpen: boolean;
  selectionContext?: SelectionContext | null;
  onClearContext?: () => void;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const renderedHtml = useMemo(() => {
    if (msg.type === "user") return null; // user messages render as plain text
    return markdownToHtml(msg.text);
  }, [msg.text, msg.type]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        flexDirection: msg.type === "user" ? "row-reverse" : "row",
      }}
    >
      {msg.type === "ai" && (
        <Image
          src="/icons/AI icon.png"
          alt="AI"
          width={24}
          height={24}
          style={{ objectFit: "contain", flexShrink: 0, marginTop: 2 }}
        />
      )}
      <div
        style={{
          background: "#F3FFF1",
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 13,
          lineHeight: 1.55,
          color: "#1a1a1a",
          maxWidth: "80%",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
        className={msg.type === "ai" ? "chat-md" : undefined}
      >
        {msg.type === "ai" && renderedHtml ? (
          <RichText>{renderedHtml}</RichText>
        ) : (
          msg.text
        )}
      </div>
    </div>
  );
}

// ─── Shared chat panel content (used by both mobile & desktop) ────────────────
function ChatMessages({
  messages,
  isLoading,
}: {
  messages: Message[];
  isLoading: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {messages.length === 0 && (
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 13,
            textAlign: "center",
            marginTop: 24,
            lineHeight: 1.6,
          }}
        >
          Tanyakan apapun tentang materi ini!
        </p>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {isLoading && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Image
            src="/icons/AI icon.png"
            alt="AI"
            width={24}
            height={24}
            style={{ objectFit: "contain", flexShrink: 0, marginTop: 2 }}
          />
          <div
            style={{
              background: "#F3FFF1",
              borderRadius: 10,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13, color: "#666" }}>Kombi sedang mengetik</span>
            <span style={{ display: "inline-flex", gap: 3 }}>
              <span className="animate-bounce" style={{ animationDelay: "0ms", width: 5, height: 5, borderRadius: "50%", background: "#79AE6F", display: "inline-block" }} />
              <span className="animate-bounce" style={{ animationDelay: "150ms", width: 5, height: 5, borderRadius: "50%", background: "#79AE6F", display: "inline-block" }} />
              <span className="animate-bounce" style={{ animationDelay: "300ms", width: 5, height: 5, borderRadius: "50%", background: "#79AE6F", display: "inline-block" }} />
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) onSend();
    }
  };

  return (
    <div style={{ padding: "10px 12px 16px", flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          background: "#F3FFF1",
          borderRadius: 16,
          padding: "8px 6px 8px 14px",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pertanyaan kamu..."
          rows={1}
          disabled={isLoading}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 13,
            color: "#1a1a1a",
            resize: "none",
            overflowY: "hidden",
            lineHeight: 1.5,
            maxHeight: 120,
            overflowX: "hidden",
            wordBreak: "break-word",
            fontFamily: "inherit",
            padding: 0,
            opacity: isLoading ? 0.5 : 1,
          }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: isLoading || !value.trim() ? "#b8d4b0" : "#79AE6F",
            border: "none",
            cursor: isLoading || !value.trim() ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
          aria-label="Kirim pesan"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 12V2M7 2L3 6M7 2L11 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Context indicator bar (muncul ketika chatbot dibuka dari seleksi) ────────
function ContextBar({
  ctx,
  onClear,
}: {
  ctx: SelectionContext;
  onClear: () => void;
}) {
  return (
    <div
      style={{
        margin: "0 12px 4px",
        padding: "8px 12px",
        background: "rgba(255,255,255,0.18)",
        borderRadius: 10,
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, flex: 1, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>
        📌 <strong>Konteks:</strong> &ldquo;{ctx.selectedText.length > 60 ? ctx.selectedText.slice(0, 60) + "…" : ctx.selectedText}&rdquo;
      </span>
      <button
        type="button"
        onClick={onClear}
        style={{
          background: "rgba(0,0,0,0.15)",
          border: "none",
          cursor: "pointer",
          padding: "3px 8px",
          borderRadius: 6,
          fontSize: 11,
          color: "white",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Hapus
      </button>
    </div>
  );
}

// ─── Panel header ─────────────────────────────────────────────────────────────
function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 16px 14px",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
          aria-label="Tutup chatbot"
        >
          <Image
            src="/icons/AI icon.png"
            alt="AI"
            width={32}
            height={32}
            style={{ objectFit: "contain" }}
          />
        </button>
        <span
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "0.01em",
          }}
        >
          Tanyakan AI
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.3)",
          marginBottom: 8,
          flexShrink: 0,
        }}
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Chatbot({
  isOpen,
  onOpen,
  onClose,
  otherPanelOpen,
  selectionContext,
  onClearContext,
}: ChatbotProps) {
  const [hovered, setHovered] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Ref untuk selalu akses messages terbaru di dalam sendToAI (hindari stale closure)
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Ketika selectionContext tersedia (dibuka dari highlight) ─────────────
  useEffect(() => {
    if (isOpen && selectionContext) {
      // Tampilkan pesan AI awal yang mengajak siswa bertanya
      setMessages([
        {
          id: `${Date.now()}-ai-init`,
          type: "ai",
          text: "Apa yang mau kamu tanyakan tentang ini?",
        },
      ]);
      setInput("");
    }
  }, [isOpen, selectionContext]);

  // ── Reset messages ketika panel dibuka tanpa context ────────────────────
  useEffect(() => {
    if (isOpen && !selectionContext) {
      // Reset ke state bersih saat buka dari icon
      setMessages([]);
      setInput("");
    }
  }, [isOpen, selectionContext]);

  // ── Kirim pesan ke API ──────────────────────────────────────────────────
  const sendToAI = useCallback(
    async (question: string) => {
      setIsLoading(true);
      try {
        const body: Record<string, unknown> = { question };

        if (selectionContext) {
          body.selectedText = selectionContext.selectedText;
          body.contextBefore = selectionContext.contextBefore;
          body.contextAfter = selectionContext.contextAfter;
        }

        // ── Sliding window: kirim history 5 percakapan terakhir ──
        const allMessages = messagesRef.current;
        // Filter out the initial AI prompt (ai-init) — not real conversation
        const conversationMsgs = allMessages.filter((m) => !m.id.endsWith("-ai-init"));
        // Ambil maks 10 pesan terakhir (5 pasang tanya-jawab)
        const recent = conversationMsgs.slice(-10);
        if (recent.length > 0) {
          body.history = recent.map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.text,
          }));
        }

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        const answer: string = data.answer ?? "Maaf, Kombi lagi ada kendala nih. Coba tanyakan lagi ya!";

        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-ai`, type: "ai", text: answer },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-ai`,
            type: "ai",
            text: "Maaf, Kombi lagi ada kendala nih. Coba tanyakan lagi ya!",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectionContext]
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      type: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    sendToAI(text);
  }, [input, isLoading, sendToAI]);

  // ── Shared sub-components ────────────────────────────────────────────────────
  const messagesSection = (
    <ChatMessages messages={messages} isLoading={isLoading} />
  );

  const inputSection = (
    <ChatInput
      value={input}
      onChange={setInput}
      onSend={handleSend}
      isLoading={isLoading}
    />
  );

  const contextBar = selectionContext && onClearContext ? (
    <ContextBar ctx={selectionContext} onClear={onClearContext} />
  ) : null;

  const desktopHeader = <PanelHeader onClose={() => { setHovered(false); onClose(); }} />;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          DESKTOP — toggle button (right edge, vertically centred)
      ══════════════════════════════════════════════════════════════ */}
      {!isOpen && !otherPanelOpen && (
        <button
          ref={toggleRef}
          type="button"
          onClick={() => { setHovered(false); onOpen(); }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="hidden md:flex"
          style={{
            position: "fixed",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "#79AE6F",
            border: "none",
            cursor: "pointer",
            padding: 0,
            width: 32,
            height: 32,
            borderRadius: "10px 0 0 10px",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            boxShadow: "-2px 2px 10px rgba(0,0,0,0.15)",
          }}
          aria-label="Buka chatbot AI"
        >
          <Image
            src="/icons/AI icon.png"
            alt="AI"
            width={20}
            height={20}
            style={{ objectFit: "contain", display: "block", width: 20, height: 20 }}
          />
        </button>
      )}

      {/* Portal tooltip */}
      {hovered && !isOpen && !otherPanelOpen && (
        <PortalTooltip label="Tanya AI" anchorRef={toggleRef} />
      )}

      {/* ══════════════════════════════════════════════════════════════
          MOBILE — toggle button (bottom-center, with label)
      ══════════════════════════════════════════════════════════════ */}
      {!isOpen && !otherPanelOpen && (
        <button
          type="button"
          onClick={() => { setHovered(false); onOpen(); }}
          className="flex md:hidden"
          style={{
            position: "fixed",
            bottom: 8,
            left: "50%",
            transform: "translateX(10%)",
            background: "#79AE6F",
            border: "none",
            cursor: "pointer",
            padding: "12px 20px",
            height: 48,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            zIndex: 1000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
          aria-label="Buka chatbot AI"
        >
          <Image
            src="/icons/AI icon.png"
            alt="AI"
            width={22}
            height={22}
            style={{ objectFit: "contain", display: "block" }}
          />
          <span
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            Tanya AI
          </span>
        </button>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MOBILE — backdrop + bottom-sheet panel
      ══════════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className="block md:hidden"
        onClick={() => { setHovered(false); onClose(); }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 1001,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        aria-hidden="true"
      />

      {/* Bottom-sheet panel */}
      <div
        className="flex md:hidden"
        style={{
          position: "fixed",
          bottom: isOpen ? 0 : "-82vh",
          left: 0,
          right: 0,
          height: "82vh",
          background: "#79AE6F",
          flexDirection: "column",
          zIndex: 1002,
          transition: "bottom 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.22)",
        }}
        aria-hidden={!isOpen}
      >
        {/* ── Mobile header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "18px 16px 14px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "0.01em",
            }}
          >
            Tanyakan AI
          </span>

          <button
            type="button"
            onClick={() => { setHovered(false); onClose(); }}
            style={{
              background: "rgba(0,0,0,0.12)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              width: 38,
              height: 38,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Tutup chatbot"
          >
            <Image
              src="/icons/close panel.png"
              alt=""
              width={22}
              height={22}
              style={{ objectFit: "contain", width: 16, height: 16 }}
            />
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.3)",
            marginBottom: 4,
            flexShrink: 0,
          }}
        />

        {contextBar}
        {messagesSection}
        {inputSection}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP — right-side slide-in panel
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="hidden md:flex"
        style={{
          position: "fixed",
          top: 64,
          right: isOpen ? 0 : -340,
          width: 320,
          height: "calc(100vh - 64px)",
          background: "#79AE6F",
          flexDirection: "column",
          zIndex: 1000,
          transition: "right 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: isOpen ? "-4px 0 24px rgba(0,0,0,0.18)" : "none",
          borderRadius: "16px 0 0 16px",
          overflow: "hidden",
        }}
        aria-hidden={!isOpen}
      >
        {desktopHeader}
        {contextBar}
        {messagesSection}
        {inputSection}
      </div>
    </>
  );
}