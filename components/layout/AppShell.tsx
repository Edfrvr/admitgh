"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import Logo from "@/components/ui/Logo";
import { useProfileContext } from "@/lib/ProfileContext";
import { createClient } from "@/lib/supabase/client";
import { ChatProvider } from "@/lib/ChatContext";
import { calcAggregate, aggregateColor, aggregateLabel } from "@/lib/helpers";

// Lazy-loaded — never SSR'd, so Supabase/profile deps don't prerender
const ChatBubble = dynamic(
  () => import("@/components/chat/ChatBubble"),
  { ssr: false }
);

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/universities", label: "Universities", Icon: Building2 },
  { href: "/dashboard/scholarships", label: "Scholarships", Icon: GraduationCap },
  { href: "/dashboard/counselors", label: "Counselors", Icon: Users },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isLoaded } = useProfileContext();

  // Redirect to auth if no profile name (e.g. direct URL access)
  useEffect(() => {
    if (isLoaded && !profile.name) {
      router.replace("/auth");
    }
  }, [isLoaded, profile.name, router]);

  const agg = isLoaded
    ? calcAggregate(profile.grades, profile.electives)
    : null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  const sidebar = (
    <aside
      style={{
        width: 210,
        height: "100vh",
        background: "#16130f",
        borderRight: "1px solid rgba(255,255,255,0.055)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo row */}
      <div
        style={{
          padding: "18px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Logo size={30} showWordmark />
      </div>

      {/* User greeting */}
      {isLoaded && profile.name && (
        <div
          style={{
            padding: "12px 16px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontWeight: 700,
            }}
          >
            Student
          </div>
          <div style={{ fontSize: 13, color: "#faf5ef", fontWeight: 700, marginTop: 3 }}>
            {profile.name}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "6px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 16px",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "#fbbf24" : "#888",
                background: active ? "rgba(251,191,36,0.07)" : "transparent",
                borderRight: `2px solid ${active ? "#fbbf24" : "transparent"}`,
                transition: "all 0.12s",
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Aggregate pill */}
      {agg !== null && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Aggregate
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: aggregateColor(agg),
                lineHeight: 1,
              }}
            >
              {agg}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: aggregateColor(agg),
                opacity: 0.8,
              }}
            >
              {aggregateLabel(agg)}
            </span>
          </div>
        </div>
      )}

      {/* Sign out */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#555",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <ChatProvider>
    <div style={{ minHeight: "100vh", background: "#0f0d0b" }}>
      {/* ── Mobile header ── */}
      <header
        className="md:hidden"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "rgba(22,19,15,0.96)",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Logo size={28} showWordmark />
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{
            background: "none",
            border: "none",
            color: "#a09080",
            cursor: "pointer",
            padding: 4,
            display: "flex",
          }}
        >
          <Menu size={22} />
        </button>
      </header>

      {/* ── Desktop layout ── */}
      <div className="md:flex" style={{ minHeight: "100vh" }}>
        {/* Desktop sidebar (always visible on md+) */}
        <div className="hidden md:block" style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
          {sidebar}
        </div>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "rgba(0,0,0,0.7)",
            }}
          />
          <div
            className="md:hidden animate-slide-in"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 50,
            }}
          >
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                style={{
                  position: "absolute",
                  top: 14,
                  right: -40,
                  background: "none",
                  border: "none",
                  color: "#a09080",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  zIndex: 51,
                }}
              >
                <X size={22} />
              </button>
            </div>
            {sidebar}
          </div>
        </>
      )}
    </div>
    <ChatBubble />
    </ChatProvider>
  );
}
