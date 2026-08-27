import Link from "next/link";
import {
  Search, ShieldCheck, Lock, ArrowRight, Radar, TrendingUp, Layers,
  Gauge, Coins, Crosshair, BadgeCheck, LineChart, ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { EmptyState } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORY_ICONS: Record<string, typeof Layers> = {
  "forex-robots": Layers,
  "mt4-eas": Gauge,
  "mt5-eas": Gauge,
  "gold-eas": Coins,
  "scalping-eas": TrendingUp,
  "prop-firm-eas": BadgeCheck,
  "ai-eas": Crosshair,
  indicators: LineChart,
};

const STEPS = [
  { n: "01", t: "Discover", d: "Filter by platform, market and strategy to find EAs that fit how you trade." },
  { n: "02", t: "Compare", d: "Review pricing, requirements and any performance evidence developers submitted." },
  { n: "03", t: "Buy", d: "Checkout securely. Your license and download unlock as soon as payment clears." },
  { n: "04", t: "Activate", d: "Install on your terminal, activate your license, and get update notifications." },
];

export default async function HomePage() {
  let featured = [];
  let categories = [];
  let listingCount = 0;
  
  try {
    const results = await Promise.all([
      prisma.product.findMany({
        where: { status: "APPROVED", featured: true },
        take: 6,
        orderBy: { approvedAt: "desc" },
        include: { developer: { include: { user: true } } },
      }),
      prisma.productCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 8 }),
      prisma.product.count({ where: { status: "APPROVED" } }),
    ]);
    
    featured = results[0];
    categories = results[1];
    listingCount = results[2];
  } catch (error) {
    console.error('Error fetching data for homepage:', error);
  }

  // Return statement MUST be outside the try/catch
  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />

      <div className="mx-auto max-w-[1180px] px-6">
        <section className="grid grid-cols-1 items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primaryBright">
              <Radar size={13} /> Forex automation marketplace
            </span>
            <h1 className="font-display mt-5 text-[40px] font-bold leading-[1.08] tracking-tight lg:text-[52px]">
              Find, verify and run <br />
              <span className="bg-gradient-to-r from-chrome to-primaryBright bg-clip-text text-transparent">
                the right EA
              </span>
              , not just any EA.
            </h1>
            <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-muted">
              EAPASER is where traders discover Expert Advisors, developers list and sell their
              work, and every listing goes through review before it reaches the marketplace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/marketplace">
                <Button>
                  Explore EAs <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/developer/products/new">
                <Button variant="ghost">List Your EA</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-[13px] text-muted">
              <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-success" /> Reviewed before listing</span>
              <span className="flex items-center gap-2"><Lock size={15} className="text-success" /> Protected downloads</span>
              <span className="flex items-center gap-2"><BadgeCheck size={15} className="text-success" /> Verified purchase reviews only</span>
            </div>
          </div>

          <div className="rounded-card border border-border bg-gradient-to-b from-surface to-[#0c0e14] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_#34D399]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wide text-muted">
                  Marketplace status
                </span>
              </div>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-mutedSoft">Live data</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Approved listings" value={String(listingCount)} />
              <StatBlock label="Categories" value={String(categories.length)} />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-mutedSoft">
              These numbers come directly from the database. As developers submit EAs and admin
              review clears them, this panel updates automatically.
            </p>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-[1180px] px-6"><div className="ep-signal-line" /></div>

      <div className="mx-auto max-w-[1180px] px-6">
        <section className="py-16">
          <SectionHead
            eyebrow="Browse by category"
            title="Every kind of strategy, organized the way traders search"
            desc="Filter by platform, market and style. Every category page supports sorting by rating, price and verification status."
          />
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Layers;
              return (
                <Link
                  key={c.slug}
                  href={`/marketplace?category=${c.slug}`}
                  className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/45 hover:bg-surface2"
                >
                  <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primaryBright">
                    <Icon size={17} />
                  </div>
                  <div className="text-[14.5px] font-semibold">{c.name}</div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="py-16">
          <SectionHead eyebrow="Featured EAs" title="Marketplace listings" />
          {featured.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No EAs published yet"
              description="Approved listings will appear here automatically as developers submit products and admin review clears them. Nothing is shown here until it is real."
              action={
                <Link href="/marketplace">
                  <Button variant="ghost" size="sm">Browse the marketplace</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    slug: product.slug,
                    name: product.name,
                    shortDescription: product.shortDescription,
                    price: product.price.toString(),
                    currency: product.currency,
                    platform: product.platform,
                    verified: product.verified,
                    ratingAverage: product.ratingAverage.toString(),
                    ratingCount: product.ratingCount,
                    developer: {
                      companyName: product.developer.companyName,
                      user: { name: product.developer.user.name },
                    },
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="py-16">
          <SectionHead eyebrow="How it works" title="From discovery to a running EA" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="font-mono mb-3.5 block text-[13px] text-primaryBright">{s.n}</span>
                <h4 className="mb-2 text-[15.5px] font-semibold">{s.t}</h4>
                <p className="text-[13.5px] leading-relaxed text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="flex flex-col items-start justify-between gap-8 rounded-[18px] border border-primary/25 bg-gradient-to-br from-primary/[0.14] to-primaryBright/[0.05] p-9 sm:p-13 lg:flex-row lg:items-center">
            <div>
              <h3 className="font-display mb-2.5 max-w-[420px] text-[26px] font-bold">
                Sell your EA to traders who are actually looking
              </h3>
              <p className="max-w-[420px] text-[14.5px] leading-relaxed text-muted">
                Submit for review, set your price, and manage versions and payouts from a
                developer dashboard built for this market.
              </p>
            </div>
            <Link href="/developer/products/new" className="shrink-0">
              <Button>
                Apply as a developer <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-surface2/40 px-4 py-3.5 rounded-lg">
      <div className="text-[21px] font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] text-mutedSoft">{label}</div>
    </div>
  );
}

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <span className="text-xs font-semibold uppercase tracking-wider text-primaryBright">{eyebrow}</span>
      <h2 className="font-display mt-1.5 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[30px]">
        {title}
      </h2>
      {desc && <p className="mt-3 max-w-[580px] text-[14.5px] leading-relaxed text-muted">{desc}</p>}
    </div>
  );
}