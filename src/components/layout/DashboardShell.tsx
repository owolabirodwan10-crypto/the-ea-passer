"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  navItems: NavItem[];
}

export function DashboardShell({ children, title, navItems }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 h-full w-64 bg-surface border-r border-border p-4 overflow-y-auto">
          <div className="mb-8">
            <Link href="/">
              <h1 className="text-xl font-bold text-primaryBright">EAPASSER</h1>
            </Link>
            <p className="text-sm text-muted mt-1">{title}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
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
          </nav>
        </aside>
        {/* Main content */}
        <main className="ml-64 p-8 w-full">{children}</main>
      </div>
    </div>
  );
}