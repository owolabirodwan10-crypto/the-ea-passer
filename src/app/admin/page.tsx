import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard, StatusBadge, EmptyState } from "@/components/ui/Primitives";
import { Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    userCount,
    developerCount,
    pendingProducts,
    approvedProducts,
    orderCount,
    paidOrders,
    pendingPayouts,
    pendingReviews,
    recentAudit,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.developer.count(),
    prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.product.count({ where: { status: "APPROVED" } }),
    prisma.order.count(),
    prisma.order.findMany({ where: { status: "PAID" }, select: { total: true } }),
    prisma.payout.count({ where: { status: "REQUESTED" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { actor: true } }),
  ]);

  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Dashboard</h1>
      <p className="mb-8 text-sm text-muted">Live figures from the database. Nothing here is estimated.</p>

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total revenue" value={`$${revenue.toFixed(0)}`} />
        <StatCard label="Users" value={String(userCount)} />
        <StatCard label="Developers" value={String(developerCount)} />
        <StatCard label="Orders" value={String(orderCount)} />
        <StatCard label="Approved products" value={String(approvedProducts)} />
        <StatCard label="Pending review" value={String(pendingProducts)} hint={pendingProducts > 0 ? "Needs attention" : undefined} />
        <StatCard label="Pending payouts" value={String(pendingPayouts)} />
        <StatCard label="Pending reviews" value={String(pendingReviews)} />
      </div>

      <h2 className="mb-4 text-[15px] font-semibold">Recent activity</h2>
      {recentAudit.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" description="Actions across the platform will be logged here." />
      ) : (
        <div className="divide-y divide-borderSoft rounded-card border border-border bg-surface">
          {recentAudit.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-5 py-3.5 text-[13px]">
              <div>
                <span className="font-medium">{log.action.replace(/_/g, " ")}</span>
                <span className="ml-2 text-mutedSoft">{log.resource}</span>
              </div>
              <span className="text-mutedSoft">{log.actor?.name ?? "system"} · {log.createdAt.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link href="/admin/products" className="text-[13px] text-primaryBright hover:underline">
          Review pending products →
        </Link>
      </div>
    </div>
  );
}
