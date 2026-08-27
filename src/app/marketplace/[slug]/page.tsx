import type React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star, ShieldCheck, BadgeCheck, Layers, Gauge } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BuyButton } from "@/components/marketplace/BuyButton";
import { ReviewSection } from "@/components/marketplace/ReviewSection";
import { getCurrentUser } from "@/server/auth/current-user";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return {};
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        developer: { include: { user: true } },
        category: true,
        performanceRecords: { orderBy: { createdAt: "desc" } },
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          include: { customer: true },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!product || (product.status !== "APPROVED" && user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN")) {
    notFound();
  }

  const existingLicense = user
    ? await prisma.license.findFirst({ where: { productId: product!.id, customerId: user.id, status: "ACTIVE" } })
    : null;

  const p = product!;
  const developerName = p.developer.companyName ?? p.developer.user.name;

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />

      <div className="mx-auto max-w-[1180px] px-6 py-10">
        {p.status !== "APPROVED" && (
          <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
            Admin preview: this listing is currently {p.status.replace("_", " ").toLowerCase()} and is not visible to customers.
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-5 flex items-center gap-2 text-xs text-mutedSoft">
              <span>{p.category.name}</span>
              <span>/</span>
              <span className="font-mono">{p.platform}</span>
            </div>

            <div className="mb-2 flex items-start justify-between gap-4">
              <h1 className="font-display text-3xl font-bold">{p.name}</h1>
              {p.verified && (
                <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primaryBright">
                  <BadgeCheck size={13} /> Verified listing
                </span>
              )}
            </div>
            <p className="mb-1 text-sm text-muted">by {developerName}</p>

            <div className="mb-8 flex items-center gap-1.5 text-sm">
              {p.ratingCount > 0 ? (
                <>
                  <Star size={14} className="fill-warning text-warning" />
                  <span className="font-medium">{p.ratingAverage.toString()}</span>
                  <span className="text-mutedSoft">({p.ratingCount} reviews)</span>
                </>
              ) : (
                <span className="text-mutedSoft">No reviews yet</span>
              )}
            </div>

            <div className="mb-10 aspect-video rounded-card border border-borderSoft bg-[radial-gradient(circle_at_30%_20%,rgba(47,124,246,0.12),transparent_60%)]" />

            <Section title="Description">
              <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-muted">{p.description}</p>
            </Section>

            <Section title="Strategy">
              <p className="text-[14.5px] leading-relaxed text-muted">
                {p.strategy ?? "Not provided by the developer yet."}
              </p>
            </Section>

            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <SpecItem icon={Gauge} label="Risk level" value={p.riskLevel} />
              <SpecItem icon={Layers} label="Markets" value={p.supportedMarkets.join(", ") || "Not specified"} />
              <SpecItem icon={ShieldCheck} label="Requirements" value={p.requirements ?? "Not specified"} />
            </div>

            <Section title="Performance evidence">
              {p.performanceRecords.length === 0 ? (
                <p className="text-[14.5px] text-mutedSoft">
                  No performance evidence has been submitted for this EA yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {p.performanceRecords.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-surface p-4 text-[13.5px]">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">{r.source}</span>
                        <span className={r.verified ? "text-success" : "text-mutedSoft"}>
                          {r.verified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-mutedSoft sm:grid-cols-4">
                        {r.winRate != null && <span>Win rate: {r.winRate.toString()}%</span>}
                        {r.profitFactor != null && <span>Profit factor: {r.profitFactor.toString()}</span>}
                        {r.maxDrawdown != null && <span>Max drawdown: {r.maxDrawdown.toString()}%</span>}
                        {r.tradeCount != null && <span>Trades: {r.tradeCount}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-mutedSoft">
                Performance data is submitted by the developer or admin with a stated source and does
                not guarantee future results. Automated trading carries risk of loss.
              </p>
            </Section>

            <ReviewSection productId={p.id} reviews={p.reviews} canReview={Boolean(existingLicense)} />
          </div>

          <aside>
            <div className="sticky top-6 rounded-card border border-border bg-surface p-6">
              <div className="mb-5 font-mono text-3xl font-semibold">
                {p.currency} {Number(p.price).toFixed(0)}
              </div>
              <BuyButton productId={p.id} alreadyOwned={Boolean(existingLicense)} isSignedIn={Boolean(user)} />
              <div className="mt-5 space-y-2.5 border-t border-borderSoft pt-5 text-[13px] text-muted">
                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-success" /> Reviewed before listing</div>
                <div className="flex items-center gap-2"><BadgeCheck size={14} className="text-success" /> Licensed download, not a bare file</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <Icon size={16} className="mb-2 text-primaryBright" />
      <div className="mb-0.5 text-xs text-mutedSoft">{label}</div>
      <div className="text-[13.5px] font-medium">{value}</div>
    </div>
  );
}
