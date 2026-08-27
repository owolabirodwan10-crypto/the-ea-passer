import { Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";
import { PayoutActions } from "./PayoutActions";

export default async function AdminPayoutsPage() {
  const payouts = await prisma.payout.findMany({
    orderBy: { requestedAt: "desc" },
    take: 100,
    include: { developer: { include: { user: true } }, affiliate: { include: { user: true } } },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Payouts</h1>
      <p className="mb-8 text-sm text-muted">
        Move a payout through its lifecycle. Marking a payout paid does not itself move money —
        that still happens with your payout provider; this records the outcome.
      </p>

      {payouts.length === 0 ? (
        <EmptyState icon={Wallet} title="No payout requests yet" description="Requests will appear here as developers and affiliates request payouts." />
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => {
            const name = p.developer?.user.name ?? p.affiliate?.user.name ?? "Unknown";
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface p-5">
                <div>
                  <div className="text-[14px] font-medium">{name}</div>
                  <div className="font-mono mt-0.5 text-[13px] text-mutedSoft">
                    ${Number(p.netAmount).toFixed(2)} net · ${Number(p.amount).toFixed(2)} gross
                  </div>
                  <div className="mt-0.5 text-xs text-mutedSoft">Requested {p.requestedAt.toDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={p.status} />
                  <PayoutActions payoutId={p.id} status={p.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
