import type { Metadata } from "next";
import ScholarshipsClient from "@/components/dashboard/ScholarshipsClient";

export const metadata: Metadata = {
  title: "Scholarships — AdmitGH",
  description:
    "Discover Ghanaian scholarships that match your WASSCE aggregate. See personalised eligibility based on your grades.",
};

export default function ScholarshipsPage() {
  return <ScholarshipsClient />;
}
