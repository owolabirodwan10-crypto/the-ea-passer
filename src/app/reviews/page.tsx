import type { Metadata } from "next";
import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EmptyState } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Verified purchase reviews from customers running EAs listed on EAPASER.",
};

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { customer: true, product: true },
  });

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[900px] px-6 py-10">
        <h1 className="font-display mb-1 text-[28px] font-bold">Reviews</h1>
        <p className="mb-8 text-sm text-muted">
          Only customers with a verified purchase can leave a review, and every review is moderated before it appears here.
        </p>

        {reviews.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No reviews yet" description="Reviews from verified purchasers will appear here as EAs are bought and used." />
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-card border border-border bg-surface p-5">
                <div className="mb-2 flex items-center justify-between">
                  <Link href={`/marketplace/${r.product.slug}`} className="text-[13.5px] font-medium hover:text-primaryBright">
                    {r.product.name}
                  </Link>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? "fill-warning text-warning" : "text-borderSoft"} />
                    ))}
                  </div>
                </div>
                <h3 className="mb-1 text-[13.5px] font-semibold">{r.title}</h3>
                <p className="mb-2 text-[13.5px] leading-relaxed text-muted">{r.content}</p>
                <span className="text-xs text-mutedSoft">{r.customer.name} · Verified purchase</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
