"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { useChatContext } from "@/lib/ChatContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUBBLE_SIZE = 60;
const WINDOW_W = 370;
const WINDOW_H = 520;
const EDGE = 20;
const DRAG_THRESHOLD = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface Position {
  x: number;
  y: number;
}

interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

// ─── Quick questions ──────────────────────────────────────────────────────────

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
  const [isClosing, setIsClosing] = useState(false);
  const [bubblePos, setBubblePos] = useState<Position>({ x: -1, y: -1 });
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const drag = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  // ── Init position ──────────────────────────────────────────────────────────
  useEffect(() => {
    function update() {
      setIsMobile(window.innerWidth <= 640);
      setBubblePos({
        x: window.innerWidth - BUBBLE_SIZE - EDGE,
        y: window.innerHeight - BUBBLE_SIZE - EDGE,
      });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  // ── Pending message (from "Ask AI" buttons) ────────────────────────────────
  useEffect(() => {
    if (isOpen && pendingMessage) {
      clearPending();
      void sendMessage(pendingMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingMessage, clearPending]);

  // ── Chat window position (computed from bubble pos) ────────────────────────
  const chatPos = useMemo<Position>(() => {
    if (bubblePos.x === -1) return { x: 0, y: 0 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const x = Math.max(
      EDGE,
      Math.min(vw - WINDOW_W - EDGE, bubblePos.x + BUBBLE_SIZE - WINDOW_W)
    );

    const spaceAbove = bubblePos.y - EDGE;
    const spaceBelow = vh - bubblePos.y - BUBBLE_SIZE - EDGE;
    const y =
      spaceAbove >= WINDOW_H || spaceAbove >= spaceBelow
        ? Math.max(EDGE, bubblePos.y - WINDOW_H - 12)
        : bubblePos.y + BUBBLE_SIZE + 12;

    return { x, y };
  }, [bubblePos]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: bubblePos.x,
      originY: bubblePos.y,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setIsHovered(false);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      drag.current.moved = true;
    }

    setBubblePos({
      x: Math.max(EDGE, Math.min(window.innerWidth - BUBBLE_SIZE - EDGE, drag.current.originX + dx)),
      y: Math.max(EDGE, Math.min(window.innerHeight - BUBBLE_SIZE - EDGE, drag.current.originY + dy)),
    });
  }

  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    const wasDragged = drag.current.moved;
    drag.current.active = false;
    drag.current.moved = false;
    setIsDragging(false);

    if (!wasDragged) {
      if (isOpen) {
        triggerClose();
      } else {
        setIsOpen(true);
      }
    }
  }

  function triggerClose() {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
    }, 180);
  }

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError("");
      setInput("");

      const userId = ++messageIdRef.current;
      const assistantId = ++messageIdRef.current;

      const userMsg: Message = { id: userId, role: "user", content: trimmed };
      const placeholder: Message = { id: assistantId, role: "assistant", content: "" };
      const next: Message[] = [...messages, userMsg, placeholder];
      setMessages(next);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
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

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Request failed.");
        }

        if (!res.body) throw new Error("No response stream.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages([
            ...next.slice(0, -1),
            { id: assistantId, role: "assistant", content: accumulated },
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
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

  // ── Guard: not initialized yet ─────────────────────────────────────────────
  if (bubblePos.x === -1) return null;

  const isEmpty = messages.length === 0;

  // ── Chat window styles (mobile vs desktop) ─────────────────────────────────
  const windowStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        inset: 0,
        width: "100dvw",
        height: "100dvh",
        borderRadius: 0,
        top: 0,
        left: 0,
      }
    : {
        position: "fixed",
        left: chatPos.x,
        top: chatPos.y,
        width: WINDOW_W,
        height: WINDOW_H,
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 40px)",
        borderRadius: 20,
      };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating bubble ── */}
      {/* Outer container: only handles fixed position */}
      <div
        style={{
          position: "fixed",
          left: bubblePos.x,
          top: bubblePos.y,
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          zIndex: 10000,
        }}
      >
        {/* Idle pulse rings — anchored, not floating */}
        {!isOpen && !isDragging && (
          <>
            <div className="bubble-ring" />
            <div className="bubble-ring bubble-ring-2" />
          </>
        )}

        {/* Inner floater: carries button + dot together through the bob */}
        <div
          className={!isOpen && !isDragging ? "bubble-float" : undefined}
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          {/* Main button */}
          <button
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onMouseEnter={() => !isDragging && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={isOpen ? "Close AI advisor" : "Open AI advisor"}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              /* Rich 3-stop gradient for depth */
              background:
                "linear-gradient(145deg, #fde68a 0%, #f59e0b 40%, #b45309 100%)",
              border: "none",
              cursor: isDragging ? "grabbing" : "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              touchAction: "none",
              userSelect: "none",
              /* Layered shadow: inner highlight + inner depth + outer lift + gold aura + ring on hover */
              boxShadow: isHovered && !isOpen
                ? [
                    "inset 0 1px 0 rgba(255,255,255,0.4)",
                    "inset 0 -2px 6px rgba(0,0,0,0.25)",
                    "0 2px 8px rgba(0,0,0,0.4)",
                    "0 8px 24px rgba(0,0,0,0.3)",
                    "0 0 0 1px rgba(251,191,36,0.55)",
                    "0 0 0 8px rgba(251,191,36,0.12)",
                    "0 0 0 15px rgba(251,191,36,0.05)",
                    "0 0 36px rgba(251,191,36,0.4)",
                  ].join(", ")
                : [
                    "inset 0 1px 0 rgba(255,255,255,0.4)",
                    "inset 0 -2px 6px rgba(0,0,0,0.25)",
                    "0 2px 8px rgba(0,0,0,0.4)",
                    "0 8px 28px rgba(0,0,0,0.28)",
                    "0 0 0 1px rgba(251,191,36,0.45)",
                    "0 0 24px rgba(251,191,36,0.28)",
                  ].join(", "),
              transition:
                "box-shadow 0.3s ease, transform 0.2s ease",
              transform: isHovered && !isOpen && !isDragging
                ? "scale(1.06)"
                : "scale(1)",
            }}
          >
            {/* Sphere highlight — top-left white sheen */}
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 10,
                width: "38%",
                height: "32%",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.38) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Icon layer: custom icon ↔ X cross-fade with rotation */}
            <div
              style={{ position: "relative", width: 22, height: 22 }}
            >
              {/* Custom AI icon (visible when closed) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isOpen ? 0 : 1,
                  transform: isOpen
                    ? "rotate(-90deg) scale(0.5)"
                    : "rotate(0deg) scale(1)",
                  transition:
                    "opacity 0.28s ease, transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <AIChatIcon />
              </div>

              {/* X icon (visible when open) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen
                    ? "rotate(0deg) scale(1)"
                    : "rotate(90deg) scale(0.5)",
                  transition:
                    "opacity 0.28s ease, transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <X size={20} color="rgba(15,13,11,0.88)" strokeWidth={2.5} />
              </div>
            </div>
          </button>

          {/* Online status dot */}
          <div
            className="bubble-online-dot"
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
              border: "2.5px solid #0f0d0b",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </div>
      </div>

      {/* ── Chat window ── */}
      {isOpen && (
        <div
          className={isClosing ? "chat-window-exit" : "chat-window-enter"}
          style={{
            ...windowStyle,
            background: "rgba(18, 15, 11, 0.82)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            border: "1px solid rgba(251,191,36,0.1)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
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
              borderBottom: "1px solid rgba(255,255,255,0.055)",
              flexShrink: 0,
              background: "rgba(251,191,36,0.025)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fbbf24, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(251,191,36,0.3)",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={15} color="#0f0d0b" strokeWidth={2.5} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#faf5ef",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  AdmitGH Advisor
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(251,191,36,0.45)",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    marginTop: 1,
                  }}
                >
                  POWERED BY GROQ AI
                </div>
              </div>
            </div>

            <button
              onClick={triggerClose}
              aria-label="Close chat"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#555",
                cursor: "pointer",
                padding: 6,
                display: "flex",
                borderRadius: 8,
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#555";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <X size={14} />
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
              gap: 10,
            }}
          >
            {isEmpty && (
              <EmptyState
                name={profile.name}
                onQuickQuestion={(q) => void sendMessage(q)}
              />
            )}

            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLatest={i === messages.length - 1}
              />
            ))}

            {loading && messages.at(-1)?.content === "" && <TypingDots />}

            {error && (
              <div
                className="chat-msg-fade"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.14)",
                  fontSize: 12,
                  color: "#ef4444",
                  lineHeight: 1.5,
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
              padding: "12px 14px 14px",
              borderTop: "1px solid rgba(255,255,255,0.055)",
              flexShrink: 0,
              background: "rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="chat-input-wrap"
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "8px 10px 8px 12px",
                transition: "border-color 0.15s",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  const wrap = e.currentTarget.closest<HTMLElement>(".chat-input-wrap");
                  if (wrap) wrap.style.borderColor = "rgba(251,191,36,0.22)";
                }}
                onBlur={(e) => {
                  const wrap = e.currentTarget.closest<HTMLElement>(".chat-input-wrap");
                  if (wrap) wrap.style.borderColor = "rgba(255,255,255,0.08)";
                }}
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
                  <Loader2
                    size={14}
                    color="#555"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Send size={14} color={input.trim() ? "#0f0d0b" : "#444"} />
                )}
              </button>
            </div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.12)",
                margin: "6px 2px 0",
                lineHeight: 1.4,
              }}
            >
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({
  name,
  onQuickQuestion,
}: {
  name: string;
  onQuickQuestion: (q: string) => void;
}) {
  return (
    <div className="chat-msg-fade" style={{ textAlign: "center", paddingTop: 14 }}>
      <div
        style={{
          fontSize: 34,
          marginBottom: 12,
          filter: "drop-shadow(0 3px 10px rgba(251,191,36,0.25))",
        }}
      >
        🎓
      </div>
      <p
        style={{
          fontSize: 13,
          color: "#6a5a4a",
          lineHeight: 1.65,
          margin: "0 0 18px",
        }}
      >
        Hi{name ? `, ${name.split(" ")[0]}` : ""}! I&apos;m your AI admissions
        advisor. Ask me anything about your university options.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {QUICK_QUESTIONS.map((q) => (
          <QuickChip key={q} label={q} onClick={() => onQuickQuestion(q)} />
        ))}
      </div>
    </div>
  );
}

function QuickChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: 10,
        background: "rgba(251,191,36,0.05)",
        border: "1px solid rgba(251,191,36,0.1)",
        color: "#8a7a6a",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        transition: "background 0.12s, border-color 0.12s, color 0.12s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(251,191,36,0.1)";
        e.currentTarget.style.borderColor = "rgba(251,191,36,0.22)";
        e.currentTarget.style.color = "#fbbf24";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(251,191,36,0.05)";
        e.currentTarget.style.borderColor = "rgba(251,191,36,0.1)";
        e.currentTarget.style.color = "#8a7a6a";
      }}
    >
      {label}
    </button>
  );
}

function MessageBubble({
  message,
  isLatest,
}: {
  message: Message;
  isLatest: boolean;
}) {
  const isUser = message.role === "user";
  if (!message.content) return null;

  return (
    <div
      className={isLatest ? "chat-msg-fade" : undefined}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "10px 13px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
          background: isUser
            ? "linear-gradient(135deg, rgba(251,191,36,0.16), rgba(217,119,6,0.1))"
            : "rgba(255,255,255,0.05)",
          border: isUser
            ? "1px solid rgba(251,191,36,0.18)"
            : "1px solid rgba(255,255,255,0.06)",
          fontSize: 13,
          color: isUser ? "#fbbf24" : "#b0a090",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

// ─── Premium bubble icon ──────────────────────────────────────────────────────

function AIChatIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back chat bubble — slightly recessed */}
      <rect
        x="1.5"
        y="2"
        width="13"
        height="10"
        rx="3"
        fill="rgba(0,0,0,0.15)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
      />
      <path
        d="M4 12 L3 15.5 L7.5 13"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Front chat bubble — main, brighter */}
      <rect
        x="9.5"
        y="8"
        width="13"
        height="10"
        rx="3"
        fill="rgba(255,255,255,0.2)"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M20 18 L21 21.5 L17 19"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* 4-pointed star sparkle inside front bubble */}
      <path
        d="M16 10.5 L16.65 12.35 L18.5 13 L16.65 13.65 L16 15.5 L15.35 13.65 L13.5 13 L15.35 12.35 Z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );
}

function TypingDots() {
  return (
    <div
      className="chat-msg-fade"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "8px 12px",
        borderRadius: "4px 14px 14px 14px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.06)",
        width: "fit-content",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#fbbf24",
            opacity: 0.35,
            animation: "bounce-dot 1.3s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}
