import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Dark glass card container.
 * Server Component — for clickable cards, use ClickableCard instead.
 */
export default function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.055)",
        borderRadius: 13,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
