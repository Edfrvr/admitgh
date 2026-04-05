"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  style?: CSSProperties;
}

/**
 * Gold gradient button for onClick actions.
 * Client Component — for navigation, use GoldLink instead.
 */
export default function GoldButton({ children, style, ...rest }: GoldButtonProps) {
  return (
    <button
      {...rest}
      style={{
        padding: "10px 22px",
        borderRadius: 10,
        background: "linear-gradient(135deg,#fbbf24,#d97706)",
        border: "none",
        color: "#1a1410",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
