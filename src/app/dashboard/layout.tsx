import type React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Package, KeyRound, User, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/orders", label: "My Purchases", icon: Package },
  { href: "/dashboard/licenses", label: "My Licenses", icon: KeyRound },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <aside className="fixed top-0 left-0 h-full w-64 bg-surface border-r border-border p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primaryBright">EAPASSER</h1>
          <p className="text-sm text-muted mt-1">Welcome, {user.user_metadata?.name || "User"}</p>
        </div>

        <nav className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted hover:text-text hover:bg-bg transition"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={async () => {
              const supabase = createBrowserSupabaseClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted hover:text-error hover:bg-bg transition w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      </aside>

      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}