import type { Metadata } from "next";
import { ProfileProvider } from "@/lib/ProfileContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Dashboard — AdmitGH",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <AppShell>{children}</AppShell>
    </ProfileProvider>
  );
}
