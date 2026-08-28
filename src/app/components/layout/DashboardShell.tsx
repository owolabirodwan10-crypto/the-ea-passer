"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CircularLogo } from "@/components/ui/CircularLogo";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function DashboardShell({
  title,
  navItems,
  children,
}: {
  title: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-[1280px]">
        <aside className="hidden w-[240px] shrink-0 border-r border-borderSoft px-5 py-6 lg:block">
          <Link href="/" className="mb-8 flex items-center gap-2.5 px-1">
            <CircularLogo size={32} />
            <span className="text-[15px] font-bold">
              EAPA<span className="text-primaryBright">SER</span>
            </span>
          </Link>
          <div className="mb-4 px-1 text-xs font-semibold uppercase tracking-wide text-mutedSoft">
            {title}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/dashboard" || item.href === "/developer" || item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                    active ? "bg-primary/10 text-primaryBright" : "text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/" className="mt-8 block px-3 text-[13px] text-mutedSoft hover:text-text">
            Back to site
          </Link>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
