"use client";

import { GRADES } from "@/lib/data";
import type { Grade } from "@/lib/types";

interface GradeSelectProps {
  subject: string;
  value: Grade | "";
  onChange: (subject: string, grade: Grade | "") => void;
}

/**
 * Single-subject grade dropdown.
 * Client Component — fires onChange on selection.
 */
export default function GradeSelect({ subject, value, onChange }: GradeSelectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        htmlFor={`grade-${subject}`}
        style={{
          fontSize: 11,
          color: "#a09080",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {subject}
      </label>
      <select
        id={`grade-${subject}`}
        value={value}
        onChange={(e) => onChange(subject, e.target.value as Grade | "")}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: value ? "#faf5ef" : "#666666",
          fontSize: 13,
          fontWeight: 600,
          padding: "7px 10px",
          cursor: "pointer",
          outline: "none",
          width: "100%",
        }}
      >
        <option value="">—</option>
        {GRADES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    </div>
  );
}
