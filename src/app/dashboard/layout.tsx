"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  KeyRound,
  User,
  LogOut,
  Home,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/orders", label: "My Purchases", icon: Package },
  { href: "/dashboard/licenses", label: "My Licenses", icon: KeyRound },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createBrowserSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-surface border-r border-border p-4 overflow-y-auto">
        <div className="mb-8">
          <Link href="/">
            <h1 className="text-xl font-bold text-primaryBright cursor-pointer hover:opacity-80 transition">
              EAPASSER
            </h1>
          </Link>
          <p className="text-sm text-muted mt-1">Dashboard</p>
        </div>

        <nav className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                  isActive
                    ? "bg-primaryBright/10 text-primaryBright"
                    : "text-muted hover:text-text hover:bg-bg"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted hover:text-text hover:bg-bg transition"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted hover:text-error hover:bg-bg transition w-full mt-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}