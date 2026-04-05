"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { CORE_SUBJECTS } from "@/lib/data";
import { calcAggregate, aggregateColor, aggregateLabel } from "@/lib/helpers";
import GradeSelect from "@/components/ui/GradeSelect";
import SectionTitle from "@/components/ui/SectionTitle";
import type { Grade } from "@/lib/types";

export default function GradeEntry() {
  const [open, setOpen] = useState(false);
  const { profile, setProfile } = useProfileContext();

  const agg = calcAggregate(profile.grades, profile.electives);
  const allSubjects = [...CORE_SUBJECTS, ...profile.electives];

  function handleGradeChange(subject: string, grade: Grade | "") {
    setProfile((prev) => {
      const grades = { ...prev.grades };
      if (grade === "") {
        delete grades[subject];
      } else {
        grades[subject] = grade;
      }
      return { ...prev, grades };
    });
  }

  const filledCount = allSubjects.filter((s) => profile.grades[s]).length;

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
            {filledCount > 0 && (
              <span style={{ color: "#555", marginRight: 2 }}>
                {filledCount}/{allSubjects.length} filled
              </span>
            )}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        }
      >
        WASSCE Grades
      </SectionTitle>

      {/* Aggregate preview (always visible) */}
      {agg !== null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            borderRadius: 20,
            background: `${aggregateColor(agg)}14`,
            border: `1px solid ${aggregateColor(agg)}33`,
            marginBottom: open ? 16 : 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, color: aggregateColor(agg) }}>
            {agg}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: aggregateColor(agg) }}>
            {aggregateLabel(agg)}
          </span>
        </div>
      )}

      {!agg && !open && (
        <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
          {allSubjects.length === 0
            ? "Select a program and electives first."
            : "Click to enter your grades and calculate your aggregate."}
        </p>
      )}

      {/* Collapsible grade inputs */}
      {open && (
        <div className="animate-fade-in">
          {allSubjects.length === 0 ? (
            <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
              Select a program and electives above first.
            </p>
          ) : (
            <>
              {/* Core subjects */}
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
                  Core Subjects
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 10,
                  }}
                >
                  {CORE_SUBJECTS.map((subject) => (
                    <GradeSelect
                      key={subject}
                      subject={subject}
                      value={profile.grades[subject] ?? ""}
                      onChange={handleGradeChange}
                    />
                  ))}
                </div>
              </div>

              {/* Elective subjects */}
              {profile.electives.length > 0 && (
                <div>
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
                    Elective Subjects
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {profile.electives.map((subject) => (
                      <GradeSelect
                        key={subject}
                        subject={subject}
                        value={profile.grades[subject] ?? ""}
                        onChange={handleGradeChange}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
