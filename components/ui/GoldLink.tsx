import Link from "next/link";
import type { CSSProperties } from "react";

interface GoldLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Gold gradient CTA styled as a button but rendered as a Next.js Link.
 * Server Component — zero client-side JS.
 * Use GoldButton for onClick actions instead.
 */
export default function GoldLink({ href, children, className = "", style }: GoldLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      style={{
        display: "inline-block",
        padding: "10px 22px",
        borderRadius: 10,
        background: "linear-gradient(135deg,#fbbf24,#d97706)",
        color: "#1a1410",
        fontWeight: 700,
        fontSize: 13,
        textDecoration: "none",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </Link>
  );
}
