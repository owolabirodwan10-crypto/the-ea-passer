import { KeyRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";
import { RevokeButton } from "./RevokeButton";

export default async function AdminLicensesPage() {
  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: true, product: true },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Licenses</h1>
      <p className="mb-8 text-sm text-muted">Most recent 100 licenses. Revoking blocks further downloads immediately.</p>

      {licenses.length === 0 ? (
        <EmptyState icon={KeyRound} title="No licenses yet" description="Licenses are created automatically when an order is paid." />
      ) : (
        <div className="divide-y divide-borderSoft rounded-card border border-border bg-surface">
          {licenses.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <div className="text-[13.5px] font-medium">{l.product.name}</div>
                <div className="mt-0.5 text-xs text-mutedSoft">{l.customer.name} · {l.customer.email}</div>
                <div className="font-mono mt-0.5 text-[11px] text-mutedSoft">{l.licenseKey}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={l.status} />
                {l.status === "ACTIVE" && <RevokeButton licenseId={l.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
