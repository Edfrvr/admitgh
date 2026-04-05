"use client";

import Link from "next/link";
import { useProfileContext } from "@/lib/ProfileContext";
import { UNIVERSITIES } from "@/lib/data";
import SectionTitle from "@/components/ui/SectionTitle";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: "#f97316",
  Pending: "#888888",
  Accepted: "#4ade80",
  Rejected: "#ef4444",
};

export default function ApplicationsList() {
  const { profile } = useProfileContext();

  const applications = UNIVERSITIES.filter(
    (u) => profile.applied[u.id] != null
  );

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.055)",
        borderRadius: 13,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <SectionTitle>Applications</SectionTitle>

      {applications.length === 0 ? (
        <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
          No applications yet.{" "}
          <Link
            href="/dashboard/universities"
            style={{ color: "#fbbf24", textDecoration: "none", fontWeight: 600 }}
          >
            Browse universities →
          </Link>
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {applications.map((uni) => {
            const status = profile.applied[uni.id] as ApplicationStatus;
            const color = STATUS_COLORS[status];
            return (
              <Link
                key={uni.id}
                href={`/dashboard/universities/${uni.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.055)",
                  textDecoration: "none",
                  transition: "border-color 0.12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Monogram */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(251,191,36,0.1)",
                      border: "1px solid rgba(251,191,36,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#fbbf24",
                      flexShrink: 0,
                    }}
                  >
                    {uni.abbr.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#faf5ef" }}>
                      {uni.abbr}
                    </div>
                    <div style={{ fontSize: 11, color: "#555" }}>{uni.city}</div>
                  </div>
                </div>

                {/* Status badge */}
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    background: `${color}14`,
                    color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
