import type { Metadata } from "next";
import CounselorsClient from "@/components/dashboard/CounselorsClient";

export const metadata: Metadata = {
  title: "Counselors — AdmitGH",
  description:
    "Connect with experienced Ghanaian admissions counselors for personalised university application guidance.",
};

export default function CounselorsPage() {
  return <CounselorsClient />;
}
