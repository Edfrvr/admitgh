"use client";

import type { ReactNode, CSSProperties } from "react";

interface ClickableCardProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Dark glass card that fires an onClick handler.
 * Client Component — use the static Card for non-interactive containers.
 */
export default function ClickableCard({
  children,
  onClick,
  className = "",
  style,
}: ClickableCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={className}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.055)",
        borderRadius: 13,
        padding: 16,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
