import type React from "react";
import { redirect } from "next/navigation";
import { LayoutGrid, Package, KeyRound, User } from "lucide-react";
import { getCurrentUser } from "@/server/auth/current-user";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/DashboardShell";

const NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/orders", label: "My Purchases", icon: Package },
  { href: "/dashboard/licenses", label: "My Licenses", icon: KeyRound },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <DashboardShell title={`Signed in as ${user.name}`} navItems={NAV}>
      {children}
    </DashboardShell>
  );
}
