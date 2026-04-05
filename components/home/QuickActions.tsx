"use client";

import Link from "next/link";
import { Building2, GraduationCap, Users, ChevronRight } from "lucide-react";
import { useProfileContext } from "@/lib/ProfileContext";
import { calcAggregate, countMatches } from "@/lib/helpers";
import { UNIVERSITIES, SCHOLARSHIPS } from "@/lib/data";
import SectionTitle from "@/components/ui/SectionTitle";

export default function QuickActions() {
  const { profile, isLoaded } = useProfileContext();

  const agg = isLoaded ? calcAggregate(profile.grades, profile.electives) : null;
  const matchCount = agg !== null ? countMatches(UNIVERSITIES, agg, profile.electives) : null;
  const eligibleScholarships = agg !== null
    ? SCHOLARSHIPS.filter((s) => s.aggReq === null || agg <= s.aggReq).length
    : null;

  const actions = [
    {
      href: "/dashboard/universities",
      label: "Universities",
      description: matchCount !== null
        ? `${matchCount} program${matchCount !== 1 ? "s" : ""} you qualify for`
        : "Browse all universities",
      Icon: Building2,
      accent: "#fbbf24",
    },
    {
      href: "/dashboard/scholarships",
      label: "Scholarships",
      description: eligibleScholarships !== null
        ? `${eligibleScholarships} you may qualify for`
        : "Explore funding options",
      Icon: GraduationCap,
      accent: "#4ade80",
    },
    {
      href: "/dashboard/counselors",
      label: "Counselors",
      description: "Get expert admissions advice",
      Icon: Users,
      accent: "#818cf8",
    },
  ];

  return (
    <div>
      <SectionTitle>Quick Actions</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {actions.map(({ href, label, description, Icon, accent }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.055)",
              textDecoration: "none",
              transition: "border-color 0.12s, background 0.12s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: `${accent}14`,
                  border: `1px solid ${accent}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} color={accent} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#faf5ef" }}>
                  {label}
                </div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                  {description}
                </div>
              </div>
            </div>
            <ChevronRight size={14} color="#444" />
          </Link>
        ))}
      </div>
    </div>
  );
}
