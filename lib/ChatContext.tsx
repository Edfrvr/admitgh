"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface ChatContextValue {
  isOpen: boolean;
  pendingMessage: string;
  openWithMessage: (message: string) => void;
  setIsOpen: (open: boolean) => void;
  clearPending: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  const openWithMessage = useCallback((message: string) => {
    setPendingMessage(message);
    setIsOpen(true);
  }, []);

  const clearPending = useCallback(() => setPendingMessage(""), []);

  return (
    <ChatContext.Provider
      value={{ isOpen, pendingMessage, openWithMessage, setIsOpen, clearPending }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
