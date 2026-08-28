"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  ShieldCheck,
  Package,
  Receipt,
  KeyRound,
  Users,
  Briefcase,
  Wallet,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Product Moderation", icon: Package },
  { href: "/admin/developers", label: "Developers", icon: Briefcase },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/licenses", label: "Licenses", icon: KeyRound },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/admin");
        return;
      }

      const role = user.user_metadata?.role || "CUSTOMER";
      const isAdminUser = role === "ADMIN" || role === "SUPER_ADMIN";

      if (!isAdminUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setUserName(user.user_metadata?.name || "Admin");
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="spinner w-8 h-8 border-4 border-primaryBright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-text">
        <div className="max-w-sm rounded-card border border-border bg-surface p-8 text-center">
          <ShieldCheck size={28} className="mx-auto mb-4 text-mutedSoft" />
          <h1 className="mb-2 text-lg font-semibold">Admin access required</h1>
          <p className="text-sm text-muted">
            Your account role does not have permission to view this area.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-primaryBright text-bg rounded-lg hover:opacity-90 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <aside className="fixed top-0 left-0 h-full w-64 bg-surface border-r border-border p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primaryBright">EAPASSER</h1>
          <p className="text-sm text-muted mt-1">Admin · {userName}</p>
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
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted hover:text-error hover:bg-bg transition w-full mt-4"
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