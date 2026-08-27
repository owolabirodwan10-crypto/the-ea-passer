import type React from "react";
import { redirect } from "next/navigation";
import { LayoutGrid, ShieldCheck, Package, Receipt, KeyRound, Users, Briefcase, Wallet, LifeBuoy } from "lucide-react";
import { getCurrentUser } from "@/server/auth/current-user";
import { userHasPermission } from "@/server/auth/rbac";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/DashboardShell";

const NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Product Moderation", icon: Package },
  { href: "/admin/developers", label: "Developers", icon: Briefcase },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/licenses", label: "Licenses", icon: KeyRound },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  // Server-side authorization is the actual boundary here. This layout only
  // controls which nav renders; every admin API route re-checks permissions
  // independently, since a frontend guard alone would be an IDOR risk.
  const canViewAdmin = await userHasPermission(user, "view_analytics");
  if (!canViewAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-text">
        <div className="max-w-sm rounded-card border border-border bg-surface p-8 text-center">
          <ShieldCheck size={28} className="mx-auto mb-4 text-mutedSoft" />
          <h1 className="mb-2 text-lg font-semibold">Admin access required</h1>
          <p className="text-sm text-muted">Your account role does not have permission to view this area.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell title={`Admin · ${user.role.replace(/_/g, " ")}`} navItems={NAV}>
      {children}
    </DashboardShell>
  );
}
