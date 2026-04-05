"use client";

import { useProfileContext } from "@/lib/ProfileContext";
import { SHS_PROGRAMS } from "@/lib/data";
import SectionTitle from "@/components/ui/SectionTitle";

const PROGRAM_NAMES = Object.keys(SHS_PROGRAMS);

export default function ProgramSelector() {
  const { profile, setProfile } = useProfileContext();

  function selectProgram(program: string) {
    if (profile.program === program) return;
    setProfile((prev) => ({
      ...prev,
      program,
      // Clear electives and their grades when program changes
      electives: [],
      grades: Object.fromEntries(
        Object.entries(prev.grades).filter(
          ([subject]) => !SHS_PROGRAMS[prev.program ?? ""]?.includes(subject)
        )
      ),
    }));
  }

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
      <SectionTitle>SHS Program</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 8,
        }}
      >
        {PROGRAM_NAMES.map((program) => {
          const active = profile.program === program;
          return (
            <button
              key={program}
              onClick={() => selectProgram(program)}
              style={{
                padding: "9px 12px",
                borderRadius: 9,
                border: active
                  ? "1px solid rgba(251,191,36,0.5)"
                  : "1px solid rgba(255,255,255,0.07)",
                background: active ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.02)",
                color: active ? "#fbbf24" : "#888",
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 0.12s",
              }}
            >
              {program}
            </button>
          );
        })}
      </div>
    </div>
  );
}
