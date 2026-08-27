import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { EmptyState } from "@/components/ui/Primitives";
import { MarketplaceFilters } from "./filters";
import type { Prisma, ProductPlatform, RiskLevel } from "@prisma/client";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse Forex Expert Advisors, indicators and signals reviewed before listing on EAPASER.",
};

const PAGE_SIZE = 12;

const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { approvedAt: "desc" },
  rating: { ratingAverage: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
};

interface MarketplaceSearchParams {
  q?: string;
  category?: string;
  platform?: string;
  risk?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: MarketplaceSearchParams;
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const sortKey = SORT_MAP[searchParams.sort ?? "newest"] ? searchParams.sort! : "newest";

  const where: Prisma.ProductWhereInput = {
    status: "APPROVED",
    ...(searchParams.q
      ? {
          OR: [
            { name: { contains: searchParams.q, mode: "insensitive" } },
            { shortDescription: { contains: searchParams.q, mode: "insensitive" } },
            { developer: { companyName: { contains: searchParams.q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
    ...(searchParams.platform ? { platform: searchParams.platform as ProductPlatform } : {}),
    ...(searchParams.risk ? { riskLevel: searchParams.risk as RiskLevel } : {}),
    ...(searchParams.minPrice || searchParams.maxPrice
      ? {
          price: {
            ...(searchParams.minPrice ? { gte: Number(searchParams.minPrice) } : {}),
            ...(searchParams.maxPrice ? { lte: Number(searchParams.maxPrice) } : {}),
          },
        }
      : {}),
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_MAP[sortKey],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { developer: { include: { user: true } } },
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Helper function to build query string - FIXED HERE
  const buildQueryString = (params: MarketplaceSearchParams, pageNum: number): string => {
    const urlParams = new URLSearchParams();
    
    // Only add defined values
    if (params.q) urlParams.set('q', params.q);
    if (params.category) urlParams.set('category', params.category);
    if (params.platform) urlParams.set('platform', params.platform);
    if (params.risk) urlParams.set('risk', params.risk);
    if (params.minPrice) urlParams.set('minPrice', params.minPrice);
    if (params.maxPrice) urlParams.set('maxPrice', params.maxPrice);
    if (params.sort) urlParams.set('sort', params.sort);
    if (pageNum > 1) urlParams.set('page', String(pageNum));
    
    return urlParams.toString();
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />

      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-[28px] font-bold">Marketplace</h1>
          <p className="mt-1.5 text-sm text-muted">
            {totalCount} {totalCount === 1 ? "listing" : "listings"} reviewed and approved for sale.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <MarketplaceFilters categories={categories} searchParams={searchParams} />

          <div>
            {products.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="No EAs match these filters"
                description="Try widening your price range or clearing a filter. Approved listings appear here automatically as developers submit products and admin review clears them."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
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

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const queryString = buildQueryString(searchParams, p);
                      const href = queryString ? `?${queryString}` : '';
                      
                      return (
                        <a
                          key={p}
                          href={href}
                          className={`rounded-md border px-3 py-1.5 text-sm ${
                            p === page 
                              ? "border-primary bg-primary/10 text-primaryBright" 
                              : "border-border text-muted hover:text-text"
                          }`}
                        >
                          {p}
                        </a>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}