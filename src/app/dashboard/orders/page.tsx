import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";

export default async function CustomerOrdersPage() {
  const user = (await getCurrentUser())!;

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } }, payments: true },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">My Purchases</h1>
      <p className="mb-8 text-sm text-muted">Every order placed with this account.</p>

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No purchases yet" description="Orders you place in the marketplace will show up here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-card border border-border bg-surface p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-mono text-[13px] text-mutedSoft">{order.orderNumber}</div>
                  <div className="text-xs text-mutedSoft">{order.createdAt.toDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[15px] font-semibold">
                    {order.currency} {Number(order.total).toFixed(0)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div className="space-y-1.5 border-t border-borderSoft pt-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[13.5px]">
                    <span>{item.product.name}</span>
                    <span className="font-mono text-mutedSoft">
                      {order.currency} {Number(item.unitPrice).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
