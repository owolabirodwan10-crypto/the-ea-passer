import type React from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[760px] px-6 py-14">
        <h1 className="font-display mb-2 text-[28px] font-bold">{title}</h1>
        <p className="mb-8 text-xs text-mutedSoft">Last updated {updated}</p>
        <div className="space-y-5 text-[14px] leading-relaxed text-muted">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
