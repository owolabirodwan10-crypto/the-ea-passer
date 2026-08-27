import { Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";

export default async function AdminDevelopersPage() {
  const developers = await prisma.developer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      products: { select: { status: true } },
      payouts: { where: { status: "REQUESTED" }, select: { id: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Developers</h1>
      <p className="mb-8 text-sm text-muted">Every developer account, with product counts and pending payout requests.</p>

      {developers.length === 0 ? (
        <EmptyState icon={Briefcase} title="No developers yet" description="Approved developer applications appear here." />
      ) : (
        <div className="divide-y divide-borderSoft rounded-card border border-border bg-surface">
          {developers.map((d) => {
            const approved = d.products.filter((p) => p.status === "APPROVED").length;
            const pending = d.products.filter((p) => p.status === "PENDING_REVIEW").length;
            return (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="text-[13.5px] font-medium">{d.companyName ?? d.user.name}</div>
                  <div className="text-xs text-mutedSoft">{d.user.email}</div>
                </div>
                <div className="flex items-center gap-4 text-[12.5px] text-muted">
                  <span>{approved} live</span>
                  <span>{pending} pending</span>
                  {d.payouts.length > 0 && (
                    <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-warning">
                      {d.payouts.length} payout request{d.payouts.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {d.verified ? <StatusBadge status="APPROVED" /> : <StatusBadge status="PENDING_REVIEW" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
