// ─── Grades ───────────────────────────────────────────────────────────────────

export type Grade = "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "E8" | "F9";

/** Sparse map of subject name → grade. Not all subjects may be filled in. */
export type GradeMap = Record<string, Grade>;

// ─── Application ──────────────────────────────────────────────────────────────

export type ApplicationStatus = "Applied" | "Pending" | "Accepted" | "Rejected";

// ─── University & Programs ────────────────────────────────────────────────────

export interface Course {
  title: string;
  /** Aggregate cut-off (lower is stricter — e.g. 8 = very competitive). */
  cutoff: number;
  /** Elective subjects required for this course. Empty = no elective requirement. */
  needs: string[];
  dept: string;
  careers: string;
}

export interface University {
  id: number;
  name: string;
  abbr: string;
  city: string;
  founded: number;
  /** Approximate student population as a display string, e.g. "~40,000". */
  size: string;
  email: string;
  phone: string;
  site: string;
  apply: string;
  /** Admissions window label, e.g. "Jan — Apr". */
  window: string;
  motto: string;
  /** ISO date string for application deadline, e.g. "2026-04-30". */
  deadlineDate: string;
  courses: Course[];
}

// ─── Scholarships ─────────────────────────────────────────────────────────────

export interface Scholarship {
  name: string;
  provider: string;
  type: string;
  eligibility: string;
  deadline: string;
  link: string;
  /** Minimum aggregate required (null = no aggregate requirement). */
  aggReq: number | null;
}

// ─── Counselors ───────────────────────────────────────────────────────────────

export interface Counselor {
  name: string;
  area: string;
  /** Phone number for WhatsApp & tel: links (no + prefix). */
  tel: string;
  mail: string;
  city: string;
  about: string;
  /** Two-letter initials shown as avatar, e.g. "AS". */
  photo: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  program: string | null;
  electives: string[];
  grades: GradeMap;
  applied: Record<number, ApplicationStatus | null>;
}

// ─── Enriched Course (used on university detail page) ─────────────────────────

export interface EnrichedCourse extends Course {
  /** Student has all required electives. */
  hasElectives: boolean;
  /** Student's aggregate meets the cut-off. */
  meetsAggregate: boolean;
  /** Fully eligible: has electives AND meets aggregate. */
  eligible: boolean;
}
