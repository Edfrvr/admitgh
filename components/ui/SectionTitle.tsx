import type { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  /** Optional right-aligned action slot (e.g. an "Edit" button). */
  action?: ReactNode;
}

/**
 * Uppercase section header with optional right-hand action.
 * Server Component.
 */
export default function SectionTitle({ children, action }: SectionTitleProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <h3
        style={{
          color: "#a09080",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {children}
      </h3>
      {action}
    </div>
  );
}
