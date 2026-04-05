"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { X, Send, Sparkles, Loader2, BotMessageSquare } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { useChatContext } from "@/lib/ChatContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "What are my best program options?",
  "Am I eligible for any scholarships?",
  "Which university should I apply to first?",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatBubble() {
  const { profile } = useProfileContext();
  const { isOpen, pendingMessage, setIsOpen, clearPending } = useChatContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Consume pending message (triggered by "Ask AI" buttons in other components)
  useEffect(() => {
    if (isOpen && pendingMessage) {
      clearPending();
      void sendMessage(pendingMessage);
    }
    // sendMessage is stable via useCallback — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingMessage, clearPending]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError("");
      setInput("");

      const userMessage: Message = { role: "user", content: trimmed };
      const assistantPlaceholder: Message = { role: "assistant", content: "" };
      const newMessages: Message[] = [...messages, userMessage, assistantPlaceholder];
      setMessages(newMessages);
      setLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            profile: {
              name: profile.name,
              program: profile.program,
              electives: profile.electives,
              grades: profile.grades,
            },
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error ?? "Request failed.");
        }

        if (!response.body) throw new Error("No response stream.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages([
            ...newMessages.slice(0, -1),
            { role: "assistant", content: accumulated },
          ]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        // Remove the empty assistant placeholder on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, profile]
  );

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;

  // ── Closed state — floating button ────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI advisor"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fbbf24, #d97706)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(251,191,36,0.35)",
          zIndex: 9999,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(251,191,36,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(251,191,36,0.35)";
        }}
      >
        <BotMessageSquare size={22} color="#0f0d0b" strokeWidth={2.2} />
      </button>
    );
  }

  // ── Open state — chat window ───────────────────────────────────────────────
  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 360,
        height: 520,
        maxHeight: "calc(100vh - 48px)",
        borderRadius: 18,
        background: "#16130f",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fbbf24, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={14} color="#0f0d0b" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#faf5ef", lineHeight: 1.2 }}>
              AdmitGH Advisor
            </div>
            <div style={{ fontSize: 10, color: "#555", fontWeight: 500 }}>
              Powered by Claude AI
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close chat"
          style={{
            background: "none",
            border: "none",
            color: "#444",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            borderRadius: 6,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Welcome / empty state */}
        {isEmpty && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎓</div>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: "0 0 16px" }}>
              Hi{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}! I&apos;m your AI
              admissions advisor. Ask me anything about your university options.
            </p>
            {/* Quick question chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: "rgba(251,191,36,0.06)",
                    border: "1px solid rgba(251,191,36,0.14)",
                    color: "#a09080",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(251,191,36,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(251,191,36,0.06)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Typing indicator when loading and last message is empty */}
        {loading && messages.at(-1)?.content === "" && <TypingDots />}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              fontSize: 12,
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "8px 10px 8px 12px",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about admissions…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#faf5ef",
              fontSize: 13,
              fontFamily: "inherit",
              resize: "none",
              lineHeight: 1.5,
              maxHeight: 80,
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg, #fbbf24, #d97706)"
                  : "rgba(255,255,255,0.05)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            {loading ? (
              <Loader2 size={14} color="#555" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Send size={14} color={input.trim() ? "#0f0d0b" : "#444"} />
            )}
          </button>
        </div>
        <p style={{ fontSize: 10, color: "#333", margin: "6px 2px 0", lineHeight: 1.4 }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (!message.content) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "10px 13px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser
            ? "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(217,119,6,0.12))"
            : "rgba(255,255,255,0.05)",
          border: isUser
            ? "1px solid rgba(251,191,36,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
          fontSize: 13,
          color: isUser ? "#fbbf24" : "#a09080",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 6px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#444",
            animation: "pulse-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
