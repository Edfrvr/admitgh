"use client";

import { useState } from "react";
import { Sparkles, RotateCcw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { CORE_SUBJECTS, UNIVERSITIES } from "@/lib/data";
import { calcAggregate, aggregateColor, aggregateLabel, countMatches } from "@/lib/helpers";
import GradeSelect from "@/components/ui/GradeSelect";
import SectionTitle from "@/components/ui/SectionTitle";
import type { Grade } from "@/lib/types";

export default function WhatIfSimulator() {
  const { profile } = useProfileContext();
  const [open, setOpen] = useState(false);
  const [whatIfGrades, setWhatIfGrades] = useState<Record<string, Grade>>({});

  const allSubjects = [...CORE_SUBJECTS, ...profile.electives];
  const hasSubjects = allSubjects.length > 0;

  // Merge profile grades with what-if overrides
  const mergedGrades = { ...profile.grades, ...whatIfGrades };

  const currentAgg = calcAggregate(profile.grades, profile.electives);
  const whatIfAgg = calcAggregate(mergedGrades, profile.electives);

  const currentMatches =
    currentAgg !== null
      ? countMatches(UNIVERSITIES, currentAgg, profile.electives)
      : 0;
  const whatIfMatches =
    whatIfAgg !== null
      ? countMatches(UNIVERSITIES, whatIfAgg, profile.electives)
      : 0;

  const aggDiff =
    currentAgg !== null && whatIfAgg !== null ? currentAgg - whatIfAgg : null;
  const matchDiff = whatIfMatches - currentMatches;

  function handleGradeChange(subject: string, grade: Grade | "") {
    setWhatIfGrades((prev) => {
      const next = { ...prev };
      if (grade === "") {
        delete next[subject];
      } else {
        next[subject] = grade;
      }
      return next;
    });
  }

  function reset() {
    setWhatIfGrades({});
  }

  const hasChanges = Object.keys(whatIfGrades).length > 0;

  return (
    <div
      style={{
        background: "rgba(251,191,36,0.03)",
        border: "1px solid rgba(251,191,36,0.1)",
        borderRadius: 13,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <SectionTitle
        action={
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888",
              fontSize: 12,
              fontWeight: 600,
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        }
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={13} color="#fbbf24" />
          What-If Simulator
        </span>
      </SectionTitle>

      {/* Preview line (always visible) */}
      <p style={{ fontSize: 12, color: "#555", margin: "0 0 0" }}>
        Temporarily adjust grades to see how your aggregate and matches would change.
      </p>

      {/* Expanded content */}
      {open && (
        <div className="animate-fade-in" style={{ marginTop: 16 }}>
          {!hasSubjects ? (
            <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
              Select a program and electives on the dashboard first.
            </p>
          ) : (
            <>
              {/* Grade inputs */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 10,
                  }}
                >
                  Adjust any grade (changes are temporary)
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 10,
                  }}
                >
                  {allSubjects.map((subject) => (
                    <GradeSelect
                      key={subject}
                      subject={subject}
                      value={whatIfGrades[subject] ?? profile.grades[subject] ?? ""}
                      onChange={handleGradeChange}
                    />
                  ))}
                </div>
              </div>

              {/* Comparison result */}
              {(whatIfAgg !== null || currentAgg !== null) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: 12,
                    alignItems: "center",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.055)",
                    borderRadius: 11,
                    padding: "14px 16px",
                    marginBottom: 12,
                  }}
                >
                  {/* Current */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 6 }}>
                      Current
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: currentAgg !== null ? aggregateColor(currentAgg) : "#555",
                        lineHeight: 1,
                      }}
                    >
                      {currentAgg ?? "—"}
                    </div>
                    {currentAgg !== null && (
                      <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                        {aggregateLabel(currentAgg)} · {currentMatches} matches
                      </div>
                    )}
                  </div>

                  {/* Delta */}
                  <div style={{ textAlign: "center" }}>
                    {aggDiff !== null && aggDiff !== 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {aggDiff > 0 ? (
                          <TrendingUp size={18} color="#4ade80" />
                        ) : (
                          <TrendingDown size={18} color="#ef4444" />
                        )}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: aggDiff > 0 ? "#4ade80" : "#ef4444",
                          }}
                        >
                          {aggDiff > 0 ? `−${aggDiff}` : `+${Math.abs(aggDiff)}`}
                        </span>
                      </div>
                    ) : (
                      <Minus size={16} color="#444" />
                    )}
                  </div>

                  {/* What-if */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 6 }}>
                      What-If
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: whatIfAgg !== null ? aggregateColor(whatIfAgg) : "#555",
                        lineHeight: 1,
                      }}
                    >
                      {whatIfAgg ?? "—"}
                    </div>
                    {whatIfAgg !== null && (
                      <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                        {aggregateLabel(whatIfAgg)} · {whatIfMatches} matches
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Match highlight */}
              {hasChanges && matchDiff !== 0 && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 9,
                    background:
                      matchDiff > 0
                        ? "rgba(74,222,128,0.08)"
                        : "rgba(239,68,68,0.08)",
                    border: `1px solid ${matchDiff > 0 ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`,
                    fontSize: 12,
                    fontWeight: 600,
                    color: matchDiff > 0 ? "#4ade80" : "#ef4444",
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  {matchDiff > 0
                    ? `🎉 ${matchDiff} new program${matchDiff !== 1 ? "s" : ""} would become eligible!`
                    : `${Math.abs(matchDiff)} program${Math.abs(matchDiff) !== 1 ? "s" : ""} would become ineligible.`}
                </div>
              )}

              {/* Reset */}
              {hasChanges && (
                <button
                  onClick={reset}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: "#666",
                    fontSize: 12,
                    cursor: "pointer",
                    padding: "6px 14px",
                    fontFamily: "inherit",
                  }}
                >
                  <RotateCcw size={12} />
                  Reset to actual grades
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
