import type { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  /** Hex color string. Defaults to gold. */
  color?: string;
}

/**
 * Small pill badge used throughout the app.
 * Server Component — no interactivity.
 */
export default function Tag({ children, color = "#fbbf24" }: TagProps) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 600,
        background: `${color}14`,
        color,
        border: `1px solid ${color}22`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
