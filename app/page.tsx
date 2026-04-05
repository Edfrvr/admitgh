import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import GoldLink from "@/components/ui/GoldLink";

export const metadata: Metadata = {
  title: "AdmitGH — Find Your University Match",
  description:
    "Enter your WASSCE grades and instantly discover which Ghanaian universities and programs you qualify for. Free, instant, AI-powered.",
};

const STATS = [
  { value: "6+", label: "Universities" },
  { value: "50+", label: "Programs" },
  { value: "AI", label: "Advisor" },
  { value: "Free", label: "Always" },
] as const;

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f0d0b", display: "flex", flexDirection: "column" }}>
      {/* ── Nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "rgba(15,13,11,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Logo size={34} showWordmark />
        <GoldLink href="/auth" style={{ padding: "8px 20px", fontSize: 13 }}>
          Get Started →
        </GoldLink>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            background: "radial-gradient(ellipse at center, rgba(251,191,36,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px",
            borderRadius: 20,
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", letterSpacing: 1, textTransform: "uppercase" }}>
            Free · Instant · AI-Powered
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(38px, 7vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#faf5ef",
            margin: "0 0 24px",
            maxWidth: 780,
          }}
        >
          Find Your Perfect{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #fbbf24, #d97706)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            University Match
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#a09080",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 0 40px",
          }}
        >
          Enter your WASSCE grades and instantly discover which Ghanaian
          universities and programs you qualify for — with AI guidance.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <GoldLink href="/auth" style={{ padding: "13px 28px", fontSize: 15, borderRadius: 12 }}>
            Get Started Free →
          </GoldLink>
          <Link
            href="/auth"
            style={{
              display: "inline-block",
              padding: "13px 28px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#a09080",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "border-color 0.15s, color 0.15s",
            }}
          >
            How It Works
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "0 24px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.055)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "22px 40px",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.055)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#fbbf24",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px 24px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          color: "#444",
          fontSize: 12,
        }}
      >
        © {new Date().getFullYear()} AdmitGH · Built for Ghanaian students
      </footer>
    </div>
  );
}
