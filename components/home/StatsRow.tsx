"use client";

import { useProfileContext } from "@/lib/ProfileContext";
import { calcAggregate, aggregateColor, aggregateLabel, countMatches } from "@/lib/helpers";
import { UNIVERSITIES } from "@/lib/data";

export default function StatsRow() {
  const { profile, isLoaded } = useProfileContext();

  const agg = isLoaded ? calcAggregate(profile.grades, profile.electives) : null;
  const matchCount = agg !== null ? countMatches(UNIVERSITIES, agg, profile.electives) : 0;
  const appliedCount = Object.values(profile.applied).filter(Boolean).length;

  const stats = [
    {
      label: "Aggregate",
      value: agg !== null ? String(agg) : "—",
      sub: agg !== null ? aggregateLabel(agg) : "Enter grades below",
      color: agg !== null ? aggregateColor(agg) : "#555",
    },
    {
      label: "Programs Match",
      value: isLoaded ? String(matchCount) : "—",
      sub: matchCount === 1 ? "program eligible" : "programs eligible",
      color: "#fbbf24",
    },
    {
      label: "Applications",
      value: String(appliedCount),
      sub: appliedCount === 1 ? "university applied" : "universities applied",
      color: "#4ade80",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 24,
      }}
    >
      {stats.map(({ label, value, sub, color }) => (
        <div
          key={label}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.055)",
            borderRadius: 13,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}
