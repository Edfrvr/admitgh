"use client";

import { useProfileContext } from "@/lib/ProfileContext";
import { SHS_PROGRAMS } from "@/lib/data";
import SectionTitle from "@/components/ui/SectionTitle";

const MAX_ELECTIVES = 4;

export default function ElectivePicker() {
  const { profile, setProfile } = useProfileContext();

  const pool: string[] = profile.program ? (SHS_PROGRAMS[profile.program] ?? []) : [];

  function toggleElective(subject: string) {
    const selected = profile.electives;
    const isSelected = selected.includes(subject);

    if (isSelected) {
      setProfile((prev) => ({
        ...prev,
        electives: prev.electives.filter((e) => e !== subject),
      }));
    } else if (selected.length < MAX_ELECTIVES) {
      setProfile((prev) => ({
        ...prev,
        electives: [...prev.electives, subject],
      }));
    }
  }

  if (!profile.program) {
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
        <SectionTitle>Electives</SectionTitle>
        <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
          Select your SHS program above to see elective options.
        </p>
      </div>
    );
  }

  const selectedCount = profile.electives.length;
  const atMax = selectedCount >= MAX_ELECTIVES;

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
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: atMax ? "#fbbf24" : "#555",
            }}
          >
            {selectedCount}/{MAX_ELECTIVES} selected
          </span>
        }
      >
        Electives
      </SectionTitle>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {pool.map((subject) => {
          const selected = profile.electives.includes(subject);
          const disabled = !selected && atMax;
          return (
            <button
              key={subject}
              onClick={() => toggleElective(subject)}
              disabled={disabled}
              style={{
                padding: "6px 13px",
                borderRadius: 20,
                border: selected
                  ? "1px solid rgba(251,191,36,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: selected ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.02)",
                color: selected ? "#fbbf24" : disabled ? "#444" : "#888",
                fontSize: 12,
                fontWeight: selected ? 700 : 400,
                cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.12s",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {selected && <span style={{ marginRight: 5 }}>✓</span>}
              {subject}
            </button>
          );
        })}
      </div>
    </div>
  );
}
