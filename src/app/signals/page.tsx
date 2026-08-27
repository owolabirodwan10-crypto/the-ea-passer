import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EmptyState } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Signal Providers",
  description: "Forex signal providers listed on EAPASER, with risk information where available.",
};

export default async function SignalsPage() {
  const providers = await prisma.signalProvider.findMany({ where: { status: "PUBLISHED" }, orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <h1 className="font-display mb-1 text-[28px] font-bold">Signals</h1>
        <p className="mb-8 text-sm text-muted">Signal providers do not guarantee results. Review risk information before subscribing.</p>

        {providers.length === 0 ? (
          <EmptyState icon={Radio} title="No signal providers listed yet" description="Providers will appear here once added by the team." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <div key={p.id} className="rounded-card border border-border bg-surface p-5">
                <h3 className="mb-1.5 text-[15px] font-semibold">{p.name}</h3>
                {p.description && <p className="mb-2 line-clamp-3 text-[13.5px] text-muted">{p.description}</p>}
                {p.riskInfo && <p className="text-[11px] text-warning">{p.riskInfo}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
