"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { COUNSELORS } from "@/lib/data";
import type { Counselor } from "@/lib/types";

function CounselorCard({ counselor }: { counselor: Counselor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.055)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "18px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 14,
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avatar */}
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(217,119,6,0.1))",
              border: "1px solid rgba(251,191,36,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#fbbf24",
              flexShrink: 0,
              letterSpacing: -0.5,
            }}
          >
            {counselor.photo}
          </div>

          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#faf5ef",
                lineHeight: 1.2,
              }}
            >
              {counselor.name}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
              {counselor.area}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#555",
                marginTop: 4,
              }}
            >
              <MapPin size={10} />
              {counselor.city}
            </div>
          </div>
        </div>

        <div style={{ color: "#444", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#888",
              lineHeight: 1.65,
              margin: "14px 0 16px",
            }}
          >
            {counselor.about}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <a
              href={`https://wa.me/${counselor.tel}`}
              target="_blank"
              rel="noopener noreferrer"
              style={contactStyle("#25d366")}
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
            <a href={`mailto:${counselor.mail}`} style={contactStyle("#fbbf24")}>
              <Mail size={13} />
              Email
            </a>
            <a href={`tel:+${counselor.tel}`} style={contactStyle("#818cf8")}>
              <Phone size={13} />
              Call
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function contactStyle(accent: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 16px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: `${accent}12`,
    color: accent,
    border: `1px solid ${accent}28`,
    textDecoration: "none",
  };
}

export default function CounselorsClient() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: 26,
            fontWeight: 800,
            color: "#faf5ef",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Counselors
        </h1>
        <p style={{ fontSize: 13, color: "#555", margin: "6px 0 0" }}>
          Get personalised guidance from experienced Ghanaian admissions experts.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {COUNSELORS.map((counselor) => (
          <CounselorCard key={counselor.name} counselor={counselor} />
        ))}
      </div>
    </div>
  );
}
