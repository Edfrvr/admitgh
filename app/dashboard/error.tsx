"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error("[Dashboard error]", error);
  }, [error]);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "80px auto",
        padding: "0 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <AlertTriangle size={22} color="#ef4444" />
      </div>

      <h2
        style={{
          fontFamily: "var(--font-playfair)",
          fontSize: 22,
          fontWeight: 800,
          color: "#faf5ef",
          margin: "0 0 10px",
        }}
      >
        Something went wrong
      </h2>

      <p
        style={{
          fontSize: 14,
          color: "#666",
          lineHeight: 1.65,
          margin: "0 0 28px",
        }}
      >
        {error.message || "An unexpected error occurred. Your data is safe — try refreshing the page."}
      </p>

      <button
        onClick={reset}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 24px",
          borderRadius: 10,
          background: "linear-gradient(135deg, #fbbf24, #d97706)",
          border: "none",
          color: "#0f0d0b",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <RotateCcw size={14} />
        Try again
      </button>
    </div>
  );
}
