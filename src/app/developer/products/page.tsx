import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";

export default async function DeveloperProductsPage() {
  const user = (await getCurrentUser())!;
  const developer = await prisma.developer.findUnique({ where: { userId: user.id } });

  if (!developer) {
    return (
      <EmptyState
        icon={Package}
        title="Not a developer yet"
        description="Apply from the Overview tab to unlock product submission tools."
      />
    );
  }

  const products = await prisma.product.findMany({
    where: { developerId: developer.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display mb-1 text-2xl font-bold">My Products</h1>
          <p className="text-sm text-muted">Everything you&apos;ve listed or drafted.</p>
        </div>
        <Link href="/developer/products/new">
          <Button size="sm"><Plus size={15} /> New product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Create your first EA listing. It stays as a draft until you submit it for admin review."
          action={
            <Link href="/developer/products/new">
              <Button size="sm">Create a product</Button>
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-borderSoft rounded-card border border-border bg-surface">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/developer/products/${p.id}/edit`}
              className="flex items-center justify-between px-5 py-4 hover:bg-surface2"
            >
              <div>
                <div className="text-[14px] font-medium">{p.name}</div>
                <div className="mt-0.5 text-xs text-mutedSoft">{p.category.name} · {p.platform}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13.5px]">{p.currency} {Number(p.price).toFixed(0)}</span>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
