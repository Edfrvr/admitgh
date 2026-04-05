import { CORE_SUBJECTS, GRADE_VALUES } from "./data";
import type { Grade, University } from "./types";

/** Convert a grade string to its numeric value (A1=1 … F9=9). */
export function gradeValue(grade: Grade): number {
  return GRADE_VALUES[grade];
}

/**
 * Calculate WASSCE aggregate: best 3 core + best 3 elective.
 * Returns null if not enough grades have been entered.
 */
export function calcAggregate(
  grades: Record<string, Grade>,
  electives: string[]
): number | null {
  const coreVals = CORE_SUBJECTS
    .map((s) => grades[s])
    .filter((g): g is Grade => Boolean(g))
    .map(gradeValue)
    .sort((a, b) => a - b)
    .slice(0, 3);

  const electiveVals = electives
    .map((s) => grades[s])
    .filter((g): g is Grade => Boolean(g))
    .map(gradeValue)
    .sort((a, b) => a - b)
    .slice(0, 3);

  if (coreVals.length < 3 || electiveVals.length < 3) return null;

  return (
    coreVals.reduce((a, b) => a + b, 0) +
    electiveVals.reduce((a, b) => a + b, 0)
  );
}

/** Tailwind-safe color string for an aggregate value. */
export function aggregateColor(agg: number): string {
  if (agg <= 10) return "#34d399";
  if (agg <= 14) return "#4ade80";
  if (agg <= 18) return "#fbbf24";
  if (agg <= 24) return "#f97316";
  return "#ef4444";
}

/** Human-readable label for an aggregate value. */
export function aggregateLabel(agg: number): string {
  if (agg <= 10) return "Excellent";
  if (agg <= 14) return "Very Good";
  if (agg <= 18) return "Good";
  if (agg <= 24) return "Fair";
  return "Limited";
}

/**
 * Count programs across all universities that the student is eligible for.
 * Accepts universities as a parameter so this works with both hardcoded data
 * and Supabase-fetched data without changing call sites.
 */
export function countMatches(
  universities: University[],
  agg: number | null,
  electives: string[]
): number {
  if (agg === null) return 0;
  return universities.reduce(
    (count, uni) =>
      count +
      uni.courses.filter(
        (p) => p.cutoff >= agg && p.needs.every((n) => electives.includes(n))
      ).length,
    0
  );
}

/** Days remaining until a deadline date string (ISO format). */
export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
