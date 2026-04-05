"use client";

import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { calcAggregate } from "@/lib/helpers";
import { SCHOLARSHIPS } from "@/lib/data";

export default function ScholarshipsClient() {
  const { profile, isLoaded } = useProfileContext();
  const agg = isLoaded ? calcAggregate(profile.grades, profile.electives) : null;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>
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
          Scholarships
        </h1>
        <p style={{ fontSize: 13, color: "#555", margin: "6px 0 0" }}>
          {agg !== null
            ? `Based on your aggregate of ${agg}, here's your eligibility for available scholarships.`
            : "Enter your grades on the dashboard to see personalised eligibility."}
        </p>
      </div>

      {/* Scholarship cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SCHOLARSHIPS.map((s) => {
          const qualifies =
            agg !== null && (s.aggReq === null || agg <= s.aggReq);
          const unknownEligibility = agg === null;

          const badgeColor = unknownEligibility
            ? "#666666"
            : qualifies
            ? "#4ade80"
            : "#f97316";
          const badgeLabel = unknownEligibility
            ? "Enter Grades"
            : qualifies
            ? "May Qualify"
            : "Check Requirements";
          const BadgeIcon =
            qualifies && !unknownEligibility ? CheckCircle : AlertCircle;

          return (
            <div
              key={s.name}
              style={{
                background: qualifies
                  ? "rgba(74,222,128,0.03)"
                  : "rgba(255,255,255,0.02)",
                border: qualifies
                  ? "1px solid rgba(74,222,128,0.1)"
                  : "1px solid rgba(255,255,255,0.055)",
                borderRadius: 14,
                padding: "18px 20px",
              }}
            >
              {/* Top row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#faf5ef",
                      marginBottom: 3,
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>{s.provider}</div>
                </div>

                {/* Eligibility badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: `${badgeColor}14`,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}30`,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <BadgeIcon size={11} />
                  {badgeLabel}
                </div>
              </div>

              {/* Details row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 10,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#444",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Type
                  </span>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {s.type}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#444",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    Deadline
                  </span>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {s.deadline}
                  </div>
                </div>
                {s.aggReq !== null && (
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#444",
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                      }}
                    >
                      Min. Aggregate
                    </span>
                    <div
                      style={{
                        fontSize: 12,
                        color:
                          agg !== null && agg <= s.aggReq ? "#4ade80" : "#888",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      ≤ {s.aggReq}
                      {agg !== null && (
                        <span style={{ fontWeight: 400, color: "#555" }}>
                          {" "}
                          (yours: {agg})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Eligibility text */}
              <p
                style={{
                  fontSize: 12,
                  color: "#666",
                  margin: "0 0 12px",
                  lineHeight: 1.5,
                }}
              >
                {s.eligibility}
              </p>

              {/* Link */}
              {s.link && (
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fbbf24",
                    textDecoration: "none",
                  }}
                >
                  Learn More <ExternalLink size={11} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
