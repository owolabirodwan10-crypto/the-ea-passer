import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EmptyState } from "@/components/ui/Primitives";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Forex Brokers",
  description: "Broker directory with platform and EA compatibility, managed by the EAPASER team.",
};

export default async function BrokersPage() {
  let brokers = [];
  
  try {
    brokers = await prisma.broker.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
  }

  // Return statement should be here, NOT inside the try/catch
  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <h1 className="font-display mb-1 text-[28px] font-bold">Brokers</h1>
        <p className="mb-8 text-sm text-muted">Broker profiles maintained by the EAPASER team, not user submitted.</p>

        {brokers.length === 0 ? (
          <EmptyState icon={Building2} title="No brokers listed yet" description="Broker profiles will appear here as the team adds them." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brokers.map((b) => (
              <div key={b.id} className="rounded-card border border-border bg-surface p-5">
                <h3 className="mb-1.5 text-[15px] font-semibold">{b.name}</h3>
                {b.description && <p className="mb-3 line-clamp-3 text-[13.5px] text-muted">{b.description}</p>}
                {b.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {b.platforms.map((p) => (
                      <span key={p} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-mutedSoft">{p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}