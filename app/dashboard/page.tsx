import type { Metadata } from "next";
import StatsRow from "@/components/home/StatsRow";
import ProgramSelector from "@/components/home/ProgramSelector";
import ElectivePicker from "@/components/home/ElectivePicker";
import GradeEntry from "@/components/home/GradeEntry";
import WhatIfSimulator from "@/components/home/WhatIfSimulator";
import ApplicationsList from "@/components/home/ApplicationsList";
import QuickActions from "@/components/home/QuickActions";

export const metadata: Metadata = {
  title: "Dashboard — AdmitGH",
};

export default function DashboardPage() {
  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "28px 20px 60px",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: 26,
            fontWeight: 800,
            color: "#faf5ef",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Your Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#555", margin: "6px 0 0" }}>
          Set up your profile below to see your university matches.
        </p>
      </div>

      {/* Stats */}
      <StatsRow />

      {/* Program + Electives side by side on wider screens */}
      <ProgramSelector />
      <ElectivePicker />

      {/* Grades (collapsible) */}
      <GradeEntry />

      {/* What-If Simulator */}
      <WhatIfSimulator />

      {/* Applications */}
      <ApplicationsList />

      {/* Quick nav */}
      <QuickActions />
    </div>
  );
}
