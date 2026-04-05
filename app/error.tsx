"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0f0d0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 22px",
            }}
          >
            <AlertTriangle size={24} color="#ef4444" />
          </div>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#faf5ef",
              margin: "0 0 10px",
            }}
          >
            AdmitGH encountered an error
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 1.65,
              margin: "0 0 28px",
            }}
          >
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          <button
            onClick={reset}
            style={{
              padding: "11px 28px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #fbbf24, #d97706)",
              border: "none",
              color: "#0f0d0b",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}
