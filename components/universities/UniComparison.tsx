"use client";

import { useState } from "react";
import { useProfileContext } from "@/lib/ProfileContext";
import { UNIVERSITIES } from "@/lib/data";
import { calcAggregate, daysUntil } from "@/lib/helpers";
import type { University } from "@/lib/types";

interface UniComparisonProps {
  primaryUni: University;
}

function eligibleCount(uni: University, agg: number | null, electives: string[]): number {
  if (agg === null) return 0;
  return uni.courses.filter(
    (c) => c.cutoff >= agg && c.needs.every((n) => electives.includes(n))
  ).length;
}

export default function UniComparison({ primaryUni }: UniComparisonProps) {
  const { profile, isLoaded } = useProfileContext();
  const [secondaryId, setSecondaryId] = useState<number | "">("");

  const agg = isLoaded ? calcAggregate(profile.grades, profile.electives) : null;

  const secondaryUni =
    secondaryId !== ""
      ? UNIVERSITIES.find((u) => u.id === secondaryId) ?? null
      : null;

  const otherUnis = UNIVERSITIES.filter((u) => u.id !== primaryUni.id);

  const primaryEligible = eligibleCount(primaryUni, agg, profile.electives);
  const secondaryEligible = secondaryUni
    ? eligibleCount(secondaryUni, agg, profile.electives)
    : null;

  const primaryDays = daysUntil(primaryUni.deadlineDate);
  const secondaryDays = secondaryUni ? daysUntil(secondaryUni.deadlineDate) : null;

  function better(a: number, b: number | null, higherIsBetter = true): boolean {
    if (b === null) return false;
    return higherIsBetter ? a > b : a < b;
  }

  const rows: Array<{
    label: string;
    primary: string;
    secondary: string | null;
    primaryWins?: boolean;
    secondaryWins?: boolean;
  }> = [
    {
      label: "City",
      primary: primaryUni.city,
      secondary: secondaryUni?.city ?? null,
    },
    {
      label: "Founded",
      primary: String(primaryUni.founded),
      secondary: secondaryUni ? String(secondaryUni.founded) : null,
      primaryWins: secondaryUni ? primaryUni.founded < secondaryUni.founded : false,
      secondaryWins: secondaryUni ? secondaryUni.founded < primaryUni.founded : false,
    },
    {
      label: "Student Size",
      primary: primaryUni.size,
      secondary: secondaryUni?.size ?? null,
    },
    {
      label: "Programs",
      primary: String(primaryUni.courses.length),
      secondary: secondaryUni ? String(secondaryUni.courses.length) : null,
      primaryWins: secondaryUni
        ? better(primaryUni.courses.length, secondaryUni.courses.length)
        : false,
      secondaryWins: secondaryUni
        ? better(secondaryUni.courses.length, primaryUni.courses.length)
        : false,
    },
    {
      label: "You Qualify For",
      primary: agg !== null ? `${primaryEligible} program${primaryEligible !== 1 ? "s" : ""}` : "—",
      secondary:
        secondaryUni && agg !== null
          ? `${secondaryEligible} program${secondaryEligible !== 1 ? "s" : ""}`
          : secondaryUni
          ? "—"
          : null,
      primaryWins: secondaryEligible !== null ? better(primaryEligible, secondaryEligible) : false,
      secondaryWins:
        secondaryEligible !== null ? better(secondaryEligible, primaryEligible) : false,
    },
    {
      label: "Deadline",
      primary: `${primaryDays}d left`,
      secondary: secondaryDays !== null ? `${secondaryDays}d left` : null,
      primaryWins: secondaryDays !== null ? better(primaryDays, secondaryDays) : false,
      secondaryWins: secondaryDays !== null ? better(secondaryDays, primaryDays) : false,
    },
    {
      label: "Admissions Window",
      primary: primaryUni.window,
      secondary: secondaryUni?.window ?? null,
    },
  ];

  return (
    <div>
      {/* University picker */}
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="compare-select"
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            color: "#a09080",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 8,
          }}
        >
          Compare with
        </label>
        <select
          id="compare-select"
          value={secondaryId}
          onChange={(e) =>
            setSecondaryId(e.target.value === "" ? "" : Number(e.target.value))
          }
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 9,
            color: secondaryId !== "" ? "#faf5ef" : "#666",
            fontSize: 13,
            padding: "9px 12px",
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
            width: "100%",
            maxWidth: 320,
          }}
        >
          <option value="">Select a university…</option>
          {otherUnis.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Comparison table */}
      {secondaryUni ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    width: "25%",
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#fbbf24",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    width: "37.5%",
                  }}
                >
                  {primaryUni.abbr}
                </th>
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#818cf8",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    width: "37.5%",
                  }}
                >
                  {secondaryUni.abbr}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, primary, secondary, primaryWins, secondaryWins }) => (
                <tr
                  key={label}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#666",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: primaryWins ? 700 : 400,
                      color: primaryWins ? "#4ade80" : "#a09080",
                      textAlign: "center",
                      background: primaryWins ? "rgba(74,222,128,0.04)" : "transparent",
                    }}
                  >
                    {primary}
                    {primaryWins && (
                      <span style={{ marginLeft: 4, fontSize: 10 }}>✓</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: secondaryWins ? 700 : 400,
                      color: secondaryWins ? "#4ade80" : "#a09080",
                      textAlign: "center",
                      background: secondaryWins ? "rgba(74,222,128,0.04)" : "transparent",
                    }}
                  >
                    {secondary ?? "—"}
                    {secondaryWins && (
                      <span style={{ marginLeft: 4, fontSize: 10 }}>✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "#444", margin: 0 }}>
          Select a second university above to see a side-by-side comparison.
        </p>
      )}
    </div>
  );
}
