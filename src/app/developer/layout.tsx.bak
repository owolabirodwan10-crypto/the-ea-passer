import type React from "react";
import { redirect } from "next/navigation";
import { LayoutGrid, Package, Wallet } from "lucide-react";
import { getCurrentUser } from "@/server/auth/current-user";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/DashboardShell";

const NAV: DashboardNavItem[] = [
  { href: "/developer", label: "Overview", icon: LayoutGrid },
  { href: "/developer/products", label: "My Products", icon: Package },
  { href: "/developer/payouts", label: "Payouts", icon: Wallet },
];

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/developer");

  return (
    <DashboardShell title={`Developer · ${user.name}`} navItems={NAV}>
      {children}
    </DashboardShell>
  );
}
