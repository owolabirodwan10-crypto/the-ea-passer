import type { Metadata } from "next";
import { Crosshair, Search, MessageSquare, BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "EA Scout",
  description: "How EAPASER sources and vets Expert Advisors before they reach the marketplace.",
};

const PIPELINE = [
  { icon: Search, title: "Research", desc: "The team researches developers and products worth evaluating, across public sources and direct outreach." },
  { icon: MessageSquare, title: "Contact and qualify", desc: "Promising developers are contacted. Products that don't meet baseline requirements are not pursued further." },
  { icon: BadgeCheck, title: "Review and list", desc: "Qualified submissions go through the same admin review as any developer-submitted product before going live." },
];

export default function ScoutPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[820px] px-6 py-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primaryBright">
          <Crosshair size={13} /> EA Scout
        </span>
        <h1 className="font-display mt-4 mb-4 text-[32px] font-bold leading-tight">
          Behind the marketplace is an active sourcing process
        </h1>
        <p className="mb-10 max-w-xl text-[15px] leading-relaxed text-muted">
          Not every EA on EAPASER arrives through a developer application. The EA Scout team also
          researches and reaches out to developers directly. Either path ends at the same place:
          nothing goes live without an admin reviewing it first.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PIPELINE.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-card border border-border bg-surface p-5">
                <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primaryBright">
                  <Icon size={17} />
                </div>
                <h3 className="mb-1.5 text-[14.5px] font-semibold">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-muted">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-[13px] text-mutedSoft">
          Developer, and want to skip the outreach step? You can{" "}
          <a href="/developer" className="text-primaryBright hover:underline">apply directly</a> instead.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
