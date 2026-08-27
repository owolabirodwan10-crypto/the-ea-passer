import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { StatCard } from "@/components/ui/Primitives";
import { ApplyForm } from "./ApplyForm";

export default async function DeveloperOverviewPage() {
  const user = (await getCurrentUser())!;

  const developer = await prisma.developer.findUnique({ where: { userId: user.id } });

  if (!developer) {
    const application = await prisma.developerApplication.findUnique({ where: { userId: user.id } });
    return (
      <div className="max-w-xl">
        <h1 className="font-display mb-1 text-2xl font-bold">Become a developer</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          Apply to list Expert Advisors on EAPASER. An admin reviews every application before you
          get access to the product submission tools.
        </p>
        <ApplyForm existingApplication={application} />
      </div>
    );
  }

  const [productCounts, orderItems, payouts] = await Promise.all([
    prisma.product.groupBy({ by: ["status"], where: { developerId: developer.id }, _count: true }),
    prisma.orderItem.findMany({
      where: { product: { developerId: developer.id }, order: { status: "PAID" } },
      include: { order: true },
    }),
    prisma.payout.findMany({ where: { developerId: developer.id }, orderBy: { requestedAt: "desc" }, take: 5 }),
  ]);

  const countByStatus = Object.fromEntries(productCounts.map((c) => [c.status, c._count]));
  const grossSales = orderItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const commissionRate = Number(developer.commissionRate) / 100;
  const earnings = grossSales * commissionRate;
  const paidOut = payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + Number(p.netAmount), 0);

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Overview</h1>
      <p className="mb-8 text-sm text-muted">
        {developer.verified ? "Verified developer account." : "Developer account pending verification."}
      </p>

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Approved products" value={String(countByStatus.APPROVED ?? 0)} />
        <StatCard label="Pending review" value={String(countByStatus.PENDING_REVIEW ?? 0)} />
        <StatCard label="Gross sales" value={`$${grossSales.toFixed(0)}`} />
        <StatCard label="Your earnings" value={`$${earnings.toFixed(0)}`} hint={`${(commissionRate * 100).toFixed(0)}% commission rate`} />
      </div>

      <div className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-mutedSoft">Payout balance</h2>
        <div className="flex items-center gap-8">
          <div>
            <div className="font-mono text-2xl font-semibold">${(earnings - paidOut).toFixed(0)}</div>
            <div className="mt-1 text-xs text-mutedSoft">Available</div>
          </div>
          <div>
            <div className="font-mono text-2xl font-semibold text-mutedSoft">${paidOut.toFixed(0)}</div>
            <div className="mt-1 text-xs text-mutedSoft">Paid out</div>
          </div>
        </div>
      </div>
    </div>
  );
}
