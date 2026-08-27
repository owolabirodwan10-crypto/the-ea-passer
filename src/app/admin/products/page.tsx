import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/Primitives";
import { ModerationActions } from "./ModerationActions";

export default async function AdminProductModerationPage() {
  const pending = await prisma.product.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { submittedAt: "asc" },
    include: { developer: { include: { user: true } }, category: true },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Product Moderation</h1>
      <p className="mb-8 text-sm text-muted">Listings submitted by developers, waiting on a decision.</p>

      {pending.length === 0 ? (
        <EmptyState icon={Package} title="Nothing pending review" description="Submitted products will appear here." />
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="rounded-card border border-border bg-surface p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-semibold">{p.name}</h3>
                  <p className="mt-0.5 text-xs text-mutedSoft">
                    {p.developer.companyName ?? p.developer.user.name} · {p.category.name} · {p.platform}
                  </p>
                </div>
                <span className="font-mono text-[14px] font-semibold">{p.currency} {Number(p.price).toFixed(0)}</span>
              </div>
              <p className="mb-4 text-[13.5px] leading-relaxed text-muted">{p.shortDescription}</p>
              <ModerationActions productId={p.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
