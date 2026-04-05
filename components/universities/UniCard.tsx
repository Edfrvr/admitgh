"use client";

import Link from "next/link";
import { useProfileContext } from "@/lib/ProfileContext";
import { calcAggregate, countMatches, daysUntil } from "@/lib/helpers";
import type { University, ApplicationStatus } from "@/lib/types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: "#f97316",
  Pending: "#888888",
  Accepted: "#4ade80",
  Rejected: "#ef4444",
};

interface UniCardProps {
  uni: University;
}

export default function UniCard({ uni }: UniCardProps) {
  const { profile, isLoaded } = useProfileContext();

  const agg = isLoaded ? calcAggregate(profile.grades, profile.electives) : null;

  const matchCount =
    agg !== null
      ? uni.courses.filter(
          (c) =>
            c.cutoff >= agg &&
            c.needs.every((n) => profile.electives.includes(n))
        ).length
      : null;

  const days = daysUntil(uni.deadlineDate);
  const status = profile.applied[uni.id] ?? null;

  const deadlineColor =
    days <= 7 ? "#ef4444" : days <= 30 ? "#f97316" : "#fbbf24";

  return (
    <Link
      href={`/dashboard/universities/${uni.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 14,
          padding: "16px",
          cursor: "pointer",
          transition: "border-color 0.12s, background 0.12s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Top row: monogram + status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Monogram */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.1))",
                border: "1px solid rgba(251,191,36,0.25)",
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
              {uni.abbr.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#faf5ef", lineHeight: 1.2 }}>
                {uni.abbr}
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{uni.city}</div>
            </div>
          </div>

          {/* Application status badge */}
          {status && (
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                background: `${STATUS_COLORS[status as ApplicationStatus]}14`,
                color: STATUS_COLORS[status as ApplicationStatus],
                border: `1px solid ${STATUS_COLORS[status as ApplicationStatus]}30`,
                whiteSpace: "nowrap",
              }}
            >
              {status}
            </span>
          )}
        </div>

        {/* University full name */}
        <div style={{ fontSize: 12, color: "#a09080", lineHeight: 1.4 }}>{uni.name}</div>

        {/* Footer: program count + match count + deadline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ fontSize: 11, color: "#555" }}>
              <span style={{ fontWeight: 700, color: "#888" }}>{uni.courses.length}</span>{" "}
              programs
            </div>
            {matchCount !== null && (
              <div style={{ fontSize: 11, color: "#555" }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: matchCount > 0 ? "#4ade80" : "#555",
                  }}
                >
                  {matchCount}
                </span>{" "}
                match{matchCount !== 1 ? "es" : ""}
              </div>
            )}
          </div>

          {/* Deadline badge */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: deadlineColor,
              background: `${deadlineColor}12`,
              border: `1px solid ${deadlineColor}25`,
              padding: "3px 8px",
              borderRadius: 20,
              whiteSpace: "nowrap",
            }}
          >
            {days === 0 ? "Closed" : `${days}d left`}
          </div>
        </div>
      </div>
    </Link>
  );
}
