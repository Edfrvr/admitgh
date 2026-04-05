"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Globe, ExternalLink, Lightbulb, CheckCircle, ArrowLeftRight, MessageCircle } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { useChatContext } from "@/lib/ChatContext";
import { calcAggregate, aggregateColor, daysUntil } from "@/lib/helpers";
import Tag from "@/components/ui/Tag";
import SectionTitle from "@/components/ui/SectionTitle";
import UniComparison from "@/components/universities/UniComparison";
import type { University, ApplicationStatus, Course } from "@/lib/types";

const STATUS_OPTIONS: ApplicationStatus[] = ["Applied", "Pending", "Accepted", "Rejected"];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: "#f97316",
  Pending: "#888888",
  Accepted: "#4ade80",
  Rejected: "#ef4444",
};

interface UniDetailProps {
  uni: University;
}

function generateInsight(
  uni: University,
  electives: string[],
  agg: number | null
): string {
  if (agg === null) {
    return `Enter your WASSCE grades on the dashboard to see a personalised analysis of how well you match ${uni.abbr}'s programs.`;
  }

  const eligible = uni.courses.filter(
    (c) => c.cutoff >= agg && c.needs.every((n) => electives.includes(n))
  );

  if (eligible.length === 0) {
    const closest = uni.courses.reduce((best, c) =>
      Math.abs(c.cutoff - agg) < Math.abs(best.cutoff - agg) ? c : best
    );
    const gap = agg - closest.cutoff;
    if (gap > 0 && gap <= 4) {
      return `You're very close — your aggregate of ${agg} is only ${gap} point(s) away from qualifying for ${closest.title} at ${uni.abbr}. Consider remarking weak subjects; a small improvement could open this door.`;
    }
    return `With an aggregate of ${agg}, you don't currently meet the cut-off for ${uni.abbr}'s programs. Focus on improving core subject grades. The most accessible program here requires ${closest.cutoff}.`;
  }

  if (eligible.length >= 3) {
    return `Excellent match — your aggregate of ${agg} qualifies you for ${eligible.length} programs at ${uni.abbr}, including ${eligible[0].title}. Apply before the ${uni.window} admissions window closes.`;
  }

  const names = eligible.map((p) => p.title).join(" and ");
  return `Your aggregate of ${agg} qualifies you for ${names} at ${uni.abbr}. Apply during the ${uni.window} admissions window — your deadline is ${uni.deadlineDate}.`;
}

function ProgramRow({
  course,
  agg,
  electives,
}: {
  course: Course;
  agg: number | null;
  electives: string[];
}) {
  const meetsAgg = agg !== null && agg <= course.cutoff;
  const hasElectives = course.needs.every((n) => electives.includes(n));
  const eligible = meetsAgg && hasElectives;

  let badgeLabel = "No Grades Yet";
  let badgeColor = "#555555";

  if (agg !== null) {
    if (eligible) {
      badgeLabel = "Eligible";
      badgeColor = "#4ade80";
    } else if (meetsAgg && !hasElectives && course.needs.length > 0) {
      badgeLabel = "Electives Missing";
      badgeColor = "#f97316";
    } else {
      badgeLabel = "Not Qualified";
      badgeColor = "#ef4444";
    }
  }

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 11,
        background: eligible ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.015)",
        border: eligible
          ? "1px solid rgba(74,222,128,0.12)"
          : "1px solid rgba(255,255,255,0.05)",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#faf5ef" }}>
            {course.title}
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{course.dept}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "#555" }}>
            Agg ≤{" "}
            <span style={{ fontWeight: 700, color: agg !== null && agg <= course.cutoff ? "#4ade80" : "#888" }}>
              {course.cutoff}
            </span>
          </span>
          <Tag color={badgeColor}>{badgeLabel}</Tag>
        </div>
      </div>

      {/* Required electives */}
      {course.needs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {course.needs.map((n) => {
            const has = electives.includes(n);
            return (
              <span
                key={n}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: has ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.08)",
                  color: has ? "#4ade80" : "#ef4444",
                  border: `1px solid ${has ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.15)"}`,
                }}
              >
                {has && "✓ "}{n}
              </span>
            );
          })}
        </div>
      )}

      {/* Careers */}
      <div style={{ fontSize: 11, color: "#555" }}>
        <span style={{ color: "#444", fontWeight: 600 }}>Careers: </span>
        {course.careers}
      </div>
    </div>
  );
}

export default function UniDetail({ uni }: UniDetailProps) {
  const [showComparison, setShowComparison] = useState(false);
  const { profile, setProfile, isLoaded } = useProfileContext();
  const { openWithMessage } = useChatContext();

  const agg = isLoaded ? calcAggregate(profile.grades, profile.electives) : null;
  const currentStatus = (profile.applied[uni.id] ?? null) as ApplicationStatus | null;

  const eligibleCount = agg !== null
    ? uni.courses.filter(
        (c) => c.cutoff >= agg && c.needs.every((n) => profile.electives.includes(n))
      ).length
    : 0;

  const days = daysUntil(uni.deadlineDate);
  const deadlineColor = days <= 7 ? "#ef4444" : days <= 30 ? "#f97316" : "#fbbf24";

  function setStatus(status: ApplicationStatus | null) {
    setProfile((prev) => {
      const applied = { ...prev.applied };
      if (status === null) {
        delete applied[uni.id];
      } else {
        applied[uni.id] = status;
      }
      return { ...prev, applied };
    });
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Back link */}
      <Link
        href="/dashboard/universities"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "#555",
          textDecoration: "none",
          marginBottom: 20,
          fontWeight: 600,
        }}
      >
        ← All Universities
      </Link>

      {/* ── Header card ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 14,
          padding: "22px 24px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        {/* Monogram */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(217,119,6,0.12))",
            border: "1px solid rgba(251,191,36,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
            color: "#fbbf24",
            flexShrink: 0,
          }}
        >
          {uni.abbr.slice(0, 2)}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 22,
              fontWeight: 800,
              color: "#faf5ef",
              margin: "0 0 4px",
              lineHeight: 1.2,
            }}
          >
            {uni.name}
          </h1>
          <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 6 }}>
            "{uni.motto}"
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#555" }}>📍 {uni.city}</span>
            <span style={{ fontSize: 12, color: "#555" }}>Est. {uni.founded}</span>
            <span style={{ fontSize: 12, color: "#555" }}>🎓 {uni.size} students</span>
          </div>
        </div>

        {/* Deadline countdown */}
        <div
          style={{
            textAlign: "center",
            padding: "12px 20px",
            borderRadius: 11,
            background: `${deadlineColor}0d`,
            border: `1px solid ${deadlineColor}25`,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: deadlineColor, lineHeight: 1 }}>
            {days}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: deadlineColor, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>
            days left
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{uni.window}</div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div
        className="stats-grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {[
          { label: "Students", value: uni.size },
          { label: "Programs", value: String(uni.courses.length) },
          { label: "Window", value: uni.window },
          {
            label: "You Qualify For",
            value: agg !== null ? `${eligibleCount}` : "—",
            color: eligibleCount > 0 ? "#4ade80" : undefined,
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 11,
              padding: "12px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: color ?? "#faf5ef", lineHeight: 1, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 10, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Contact card ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 13,
          padding: "16px 18px",
          marginBottom: 14,
        }}
      >
        <SectionTitle>Contact & Apply</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <a
            href={`mailto:${uni.email}`}
            style={contactLinkStyle}
          >
            <Mail size={13} /> {uni.email}
          </a>
          <a
            href={`tel:${uni.phone.replace(/\s/g, "")}`}
            style={contactLinkStyle}
          >
            <Phone size={13} /> {uni.phone}
          </a>
          <a href={uni.site} target="_blank" rel="noopener noreferrer" style={contactLinkStyle}>
            <Globe size={13} /> Website
          </a>
          <a
            href={uni.apply}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...contactLinkStyle,
              background: "linear-gradient(135deg, #fbbf24, #d97706)",
              color: "#1a1410",
              border: "none",
              fontWeight: 700,
            }}
          >
            <ExternalLink size={13} /> Apply Now
          </a>
        </div>
      </div>

      {/* ── AI Insight card ── */}
      <div
        style={{
          background: "rgba(251,191,36,0.04)",
          border: "1px solid rgba(251,191,36,0.12)",
          borderRadius: 13,
          padding: "16px 18px",
          marginBottom: 14,
          display: "flex",
          gap: 12,
        }}
      >
        <Lightbulb size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#fbbf24",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 6,
            }}
          >
            AI Insight
          </div>
          <p style={{ fontSize: 13, color: "#a09080", margin: "0 0 12px", lineHeight: 1.6 }}>
            {generateInsight(uni, profile.electives, agg)}
          </p>
          <button
            onClick={() =>
              openWithMessage(
                `Tell me more about my chances at ${uni.name}. My aggregate is ${agg ?? "not yet computed"} and my electives are: ${profile.electives.join(", ") || "none selected"}.`
              )
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 9,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
              color: "#fbbf24",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <MessageCircle size={12} />
            Ask AI more
          </button>
        </div>
      </div>

      {/* ── Application status ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 13,
          padding: "16px 18px",
          marginBottom: 14,
        }}
      >
        <SectionTitle>Application Status</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {STATUS_OPTIONS.map((status) => {
            const active = currentStatus === status;
            const color = STATUS_COLORS[status];
            return (
              <button
                key={status}
                onClick={() => setStatus(active ? null : status)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
                  background: active ? `${color}18` : "transparent",
                  color: active ? color : "#555",
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.12s",
                }}
              >
                {active && <CheckCircle size={12} />}
                {status}
              </button>
            );
          })}
          {currentStatus && (
            <button
              onClick={() => setStatus(null)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "transparent",
                color: "#444",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Programs ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 13,
          padding: "16px 18px",
          marginBottom: 14,
        }}
      >
        <SectionTitle
          action={
            agg !== null && eligibleCount > 0 ? (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>
                {eligibleCount} eligible
              </span>
            ) : undefined
          }
        >
          Programs
        </SectionTitle>
        {uni.courses.map((course) => (
          <ProgramRow
            key={course.title}
            course={course}
            agg={agg}
            electives={profile.electives}
          />
        ))}
      </div>

      {/* ── Compare section ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 13,
          padding: "16px 18px",
        }}
      >
        <SectionTitle
          action={
            <button
              onClick={() => setShowComparison((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 9,
                border: showComparison
                  ? "1px solid rgba(129,140,248,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: showComparison
                  ? "rgba(129,140,248,0.1)"
                  : "transparent",
                color: showComparison ? "#818cf8" : "#666",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.12s",
              }}
            >
              <ArrowLeftRight size={12} />
              {showComparison ? "Hide" : "Compare"}
            </button>
          }
        >
          Compare Universities
        </SectionTitle>

        {showComparison ? (
          <div className="animate-fade-in">
            <UniComparison primaryUni={uni} />
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "#444", margin: 0 }}>
            Compare {uni.abbr} side-by-side with another university.
          </p>
        )}
      </div>
    </div>
  );
}

const contactLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 14px",
  borderRadius: 9,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#a09080",
  fontSize: 12,
  fontWeight: 500,
  textDecoration: "none",
  transition: "background 0.12s",
};
