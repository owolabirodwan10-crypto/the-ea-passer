import Link from "next/link";
import { Package, KeyRound, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { StatCard, EmptyState, StatusBadge } from "@/components/ui/Primitives";

export default async function DashboardOverviewPage() {
  const user = (await getCurrentUser())!;

  const [orderCount, activeLicenseCount, downloadCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { customerId: user.id } }),
    prisma.license.count({ where: { customerId: user.id, status: "ACTIVE" } }),
    prisma.download.count({ where: { customerId: user.id } }),
    prisma.order.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { product: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Overview</h1>
      <p className="mb-8 text-sm text-muted">Your purchases, licenses and downloads at a glance.</p>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value={String(orderCount)} />
        <StatCard label="Active licenses" value={String(activeLicenseCount)} />
        <StatCard label="Downloads" value={String(downloadCount)} />
      </div>

      <h2 className="mb-4 text-[15px] font-semibold">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No purchases yet"
          description="Orders you place in the marketplace will show up here."
          action={
            <Link href="/marketplace" className="text-sm text-primaryBright hover:underline">
              Browse the marketplace
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-borderSoft rounded-card border border-border bg-surface">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-[13.5px] font-medium">
                  {order.items.map((i) => i.product.name).join(", ")}
                </div>
                <div className="font-mono mt-0.5 text-xs text-mutedSoft">{order.orderNumber}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13.5px]">
                  {order.currency} {Number(order.total).toFixed(0)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
