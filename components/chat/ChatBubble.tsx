"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { X, Send, Loader2 } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { useChatContext } from "@/lib/ChatContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

// ─── Quick suggestions ────────────────────────────────────────────────────────

const QUICK_QUESTIONS = [
  "Best programs for me?",
  "Am I eligible for scholarships?",
  "Which university first?",
  "What does my aggregate mean?",
  "Career options for my electives?",
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
  const [isMobile, setIsMobile] = useState(false);
  const [bubblePos, setBubblePos] = useState({ bottom: 20, right: 20 });

  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bubblePosRef = useRef({ bottom: 20, right: 20 });
  const dragInfo = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startRight: 20,
    startBottom: 20,
    moved: false,
  });

  // ── Detect viewport size ──────────────────────────────────────────────────
  useEffect(() => {
    function sync() {
      setIsMobile(window.innerWidth < 640);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // ── Global drag listeners for the floating bubble ────────────────────────
  useEffect(() => {
    function onMove(clientX: number, clientY: number) {
      if (!dragInfo.current.active) return;
      const dx = clientX - dragInfo.current.startX;
      const dy = clientY - dragInfo.current.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragInfo.current.moved = true;
      if (!dragInfo.current.moved) return;
      const right = Math.max(8, Math.min(window.innerWidth - 64, dragInfo.current.startRight - dx));
      const bottom = Math.max(8, Math.min(window.innerHeight - 64, dragInfo.current.startBottom - dy));
      bubblePosRef.current = { right, bottom };
      setBubblePos({ right, bottom });
    }
    function onEnd() {
      dragInfo.current.active = false;
    }
    function onMouseMove(e: MouseEvent) {
      onMove(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      if (dragInfo.current.active && dragInfo.current.moved) e.preventDefault();
      onMove(t.clientX, t.clientY);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []); // setBubblePos and refs are stable — safe with []

  // ── Auto-scroll to latest message ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input when chat opens ───────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 220);
  }, [isOpen]);

  // ── Consume pending message (triggered by "Ask AI" buttons elsewhere) ─────
  useEffect(() => {
    if (isOpen && pendingMessage) {
      clearPending();
      void sendMessage(pendingMessage);
    }
    // sendMessage is stable via useCallback — safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingMessage, clearPending]);

  // ── Open / close ──────────────────────────────────────────────────────────
  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsClosing(true);
    // Wait for exit animation to finish before unmounting
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
    }, 180);
  }

  // ── Send message ──────────────────────────────────────────────────────────
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

  const isEmpty = messages.length === 0;

  // ── CSS animation class — separate desktop / mobile paths ─────────────────
  //   Mobile: every keyframe carries translate(-50%,-50%) so centering is
  //   preserved through the animation. fill-mode:both prevents position flash.
  //   Desktop: origin is bottom-right (set in CSS), no translate needed.
  const panelClass = isMobile
    ? isClosing
      ? "panel-out-mobile"
      : "panel-in-mobile"
    : isClosing
    ? "panel-out-desktop"
    : "panel-in-desktop";

  // ── Panel dimensions & position ───────────────────────────────────────────
  //   Desktop: fixed 380×520 anchored bottom-right, 20px from edges.
  //   Mobile : centered via top/left 50% + translate in CSS animation.
  //            Width: viewport minus 40px (20px each side), capped at 400px.
  //            Height: 75dvh capped at 540px — never 100vh.
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        // transform is handled entirely by the CSS animation class
        width: "calc(100vw - 40px)",
        maxWidth: 400,
        height: "75dvh",
        maxHeight: 540,
        borderRadius: 20,
        zIndex: 9998,
      }
    : {
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 380,
        height: 520,
        borderRadius: 20,
        zIndex: 9998,
      };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating bubble — disappears when chat is open ── */}
      {!isOpen && (
        <button
          aria-label="Open AI advisor"
          className="bubble-idle"
          onMouseDown={(e) => {
            dragInfo.current = {
              active: true,
              startX: e.clientX,
              startY: e.clientY,
              startRight: bubblePosRef.current.right,
              startBottom: bubblePosRef.current.bottom,
              moved: false,
            };
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            dragInfo.current = {
              active: true,
              startX: t.clientX,
              startY: t.clientY,
              startRight: bubblePosRef.current.right,
              startBottom: bubblePosRef.current.bottom,
              moved: false,
            };
          }}
          onClick={() => {
            if (dragInfo.current.moved) return;
            handleOpen();
          }}
          style={{
            position: "fixed",
            bottom: bubblePos.bottom,
            right: bubblePos.right,
            width: 58,
            height: 58,
            borderRadius: "50%",
            background:
              "linear-gradient(145deg, #fde68a 0%, #f59e0b 45%, #b45309 100%)",
            border: "1.5px solid rgba(255,255,255,0.22)",
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexShrink: 0,
            userSelect: "none",
            touchAction: "none",
          }}
        >
          <AdmitIcon size={24} />

          {/* Online indicator */}
          <span
            className="dot-online"
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4ade80, #16a34a)",
              border: "2.5px solid #0f0d0b",
              display: "block",
            }}
          />
        </button>
      )}

      {/* ── Mobile backdrop — tap anywhere outside to close ── */}
      {isOpen && isMobile && !isClosing && (
        <div
          onClick={handleClose}
          role="button"
          aria-label="Close chat"
          tabIndex={-1}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            zIndex: 9997,
          }}
        />
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className={panelClass}
          style={{
            ...panelStyle,
            background: "rgba(14, 11, 8, 0.95)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            border: "1px solid rgba(251, 191, 36, 0.11)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.04)",
              "0 8px 32px rgba(0,0,0,0.5)",
              "0 24px 64px rgba(0,0,0,0.4)",
            ].join(", "),
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* ── Header ────────────────────────────────────────────────────── */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              height: 48,
              minHeight: 48,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
              background: "rgba(251,191,36,0.025)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, #fde68a 0%, #f59e0b 45%, #b45309 100%)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 10px rgba(251,191,36,0.3)",
                }}
              >
                <AdmitIcon size={15} />
              </div>

              {/* Name + online status */}
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#faf5ef",
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                  }}
                >
                  AdmitGH Advisor
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 1,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4ade80",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "#4ade80",
                      fontWeight: 500,
                      letterSpacing: "0.03em",
                    }}
                  >
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close chat"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#555",
                flexShrink: 0,
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.14)";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#555";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <X size={14} />
            </button>
          </header>

          {/* ── Messages area ─────────────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 14px 4px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 0, // critical: lets flex-child shrink below content size
            }}
          >
            {/* Welcome / empty state */}
            {isEmpty && (
              <div
                className="msg-in"
                style={{
                  textAlign: "center",
                  padding: "20px 10px 10px",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>🎓</div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#5a4a3a",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  Hi{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}!
                  I&apos;m your AI admissions advisor. Ask me anything about
                  your university options.
                </p>
              </div>
            )}

            {/* Conversation messages */}
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLatest={i === messages.length - 1}
              />
            ))}

            {/* Typing indicator (shown while waiting for first token) */}
            {loading && messages.at(-1)?.content === "" && <TypingDots />}

            {/* Error */}
            {error && (
              <div
                className="msg-in"
                style={{
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.13)",
                  fontSize: 12,
                  color: "#ef4444",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} style={{ height: 2 }} />
          </div>

          {/* ── Quick questions — horizontal scroll row ────────────────────── */}
          <div
            className="no-scrollbar"
            style={{
              display: "flex",
              gap: 7,
              padding: "9px 14px",
              overflowX: "auto",
              flexShrink: 0,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => void sendMessage(q)}
                disabled={loading}
                style={{
                  flexShrink: 0,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "rgba(251,191,36,0.07)",
                  border: "1px solid rgba(251,191,36,0.14)",
                  color: "#7a6a55",
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  lineHeight: 1.4,
                  transition: "background 0.12s, border-color 0.12s, color 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "rgba(251,191,36,0.13)";
                    e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)";
                    e.currentTarget.style.color = "#fbbf24";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(251,191,36,0.07)";
                  e.currentTarget.style.borderColor = "rgba(251,191,36,0.14)";
                  e.currentTarget.style.color = "#7a6a55";
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* ── Input bar ─────────────────────────────────────────────────── */}
          <div
            style={{
              padding: "10px 14px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <div
              className="chat-input-row"
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                padding: "8px 10px 8px 14px",
                transition: "border-color 0.15s",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  const row = e.currentTarget.closest<HTMLElement>(".chat-input-row");
                  if (row) row.style.borderColor = "rgba(251,191,36,0.28)";
                }}
                onBlur={(e) => {
                  const row = e.currentTarget.closest<HTMLElement>(".chat-input-row");
                  if (row) row.style.borderColor = "rgba(255,255,255,0.09)";
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
                  // 16px minimum prevents iOS Safari auto-zoom on focus
                  fontSize: 16,
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
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background:
                    input.trim() && !loading
                      ? "linear-gradient(135deg, #fbbf24, #d97706)"
                      : "rgba(255,255,255,0.06)",
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
                    size={15}
                    color="#555"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Send size={15} color={input.trim() ? "#0f0d0b" : "#444"} />
                )}
              </button>
            </div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.1)",
                margin: "5px 2px 0",
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
      className={isLatest ? "msg-in" : undefined}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "84%",
          padding: "9px 13px",
          borderRadius: isUser
            ? "14px 14px 4px 14px"
            : "4px 14px 14px 14px",
          background: isUser
            ? "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.1))"
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

// ─── AdmitIcon — custom graduation cap SVG ───────────────────────────────────
// A clean mortarboard icon: the diamond cap board + the arch beneath it.
// Reads clearly at any size from 14px to 28px.

function AdmitIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Cap board — the iconic diamond flat top of a mortarboard */}
      <path
        d="M12 4L23 9.5L12 15L1 9.5L12 4Z"
        fill="white"
        fillOpacity="0.96"
      />
      {/* Cap body — the arch beneath, suggesting the cap worn on the head */}
      <path
        d="M5.5 12V17C5.5 17 8 20.5 12 20.5C16 20.5 18.5 17 18.5 17V12"
        stroke="white"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tassel string — the right side hanging element */}
      <line
        x1="23"
        y1="9.5"
        x2="23"
        y2="15"
        stroke="white"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Tassel end — the hanging ball */}
      <circle cx="23" cy="16.2" r="1.4" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div
      className="msg-in"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "9px 13px",
        borderRadius: "4px 14px 14px 14px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.06)",
        width: "fit-content",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#f59e0b",
            animation: "dot-bounce 1.3s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}
