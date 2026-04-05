import type { Metadata } from "next";
import { UNIVERSITIES } from "@/lib/data";
import UniCard from "@/components/universities/UniCard";

export const metadata: Metadata = {
  title: "Universities — AdmitGH",
};

export default function UniversitiesPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Header */}
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
          Universities
        </h1>
        <p style={{ fontSize: 13, color: "#555", margin: "6px 0 0" }}>
          {UNIVERSITIES.length} universities · Click any card for full details and programs
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {UNIVERSITIES.map((uni) => (
          <UniCard key={uni.id} uni={uni} />
        ))}
      </div>
    </div>
  );
}
