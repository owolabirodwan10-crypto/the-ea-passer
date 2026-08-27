import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: true, items: { include: { product: true } } },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Orders</h1>
      <p className="mb-8 text-sm text-muted">Most recent 100 orders across the marketplace.</p>

      {orders.length === 0 ? (
        <EmptyState icon={Receipt} title="No orders yet" description="Orders will appear here as customers check out." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-borderSoft text-xs uppercase tracking-wide text-mutedSoft">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-borderSoft last:border-0">
                  <td className="font-mono px-5 py-3 text-mutedSoft">{o.orderNumber}</td>
                  <td className="px-5 py-3">{o.customer.name}</td>
                  <td className="px-5 py-3">{o.items.map((i) => i.product.name).join(", ")}</td>
                  <td className="font-mono px-5 py-3">{o.currency} {Number(o.total).toFixed(0)}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-mutedSoft">{o.createdAt.toDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
