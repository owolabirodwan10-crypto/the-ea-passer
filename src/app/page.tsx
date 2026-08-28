import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  BarChart3, 
  Users,
  Star,
  TrendingUp,
  Check,
  ChevronRight
} from "lucide-react";

// ✅ Define types
interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number | null;
  sale_price: number | null;
  platform: string | null;
  featured: boolean;
  category: { name: string } | null;
  images: { url: string; is_main: boolean }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export default async function HomePage() {
  // ✅ Explicitly type the arrays
  let featured: Product[] = [];
  let categories: Category[] = [];
  let listingCount = 0;

  try {
    // Fetch featured products
    const featuredProducts = await prisma.product.findMany({
      where: { 
        status: "APPROVED",
        featured: true,
      },
      include: {
        images: {
          where: { is_main: true },
          take: 1,
        },
        category: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
    featured = featuredProducts as Product[];

    // Fetch categories
    const categoriesData = await prisma.productCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });
    categories = categoriesData as Category[];

    // Get total product count
    listingCount = await prisma.product.count({
      where: { status: "APPROVED" },
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primaryBright/10 border border-primaryBright/20 text-primaryBright text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Professional Trading Technology
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Trade Smarter.
                <br />
                <span className="text-primaryBright">Automate With Confidence.</span>
              </h1>
              <p className="mt-6 text-lg text-muted max-w-lg">
                Professional Forex automation, prop-firm solutions and trading technology 
                designed around disciplined execution and risk management.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace" className="btn-primary">
                  Explore Marketplace
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/performance" className="btn-secondary">
                  View Performance
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-white">{listingCount}+</p>
                  <p className="text-sm text-muted">Trading Systems</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-white">1000+</p>
                  <p className="text-sm text-muted">Active Traders</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-white">100+</p>
                  <p className="text-sm text-muted">Active Licenses</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="glass p-6 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">Account Equity</p>
                      <p className="text-2xl font-bold text-white">$124,583.42</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Daily P/L</p>
                      <p className="text-2xl font-bold text-success">+$2,847.18</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-muted">Drawdown</p>
                      <p className="text-lg font-semibold text-white">8.2%</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-muted">Win Rate</p>
                      <p className="text-lg font-semibold text-primaryBright">67.4%</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-muted">Profit Factor</p>
                      <p className="text-lg font-semibold text-white">1.82</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Active Trades</span>
                      <span className="text-sm font-medium text-primaryBright">4</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">EURUSD</span>
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">XAUUSD</span>
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded">GBPUSD</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-500 rounded">BTCUSD</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted">EA Status</p>
                      <p className="text-sm font-medium text-success">● EAPASSER Active</p>
                    </div>
                    <span className="text-xs text-muted">Demo Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 border-y border-border">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {['MT4', 'MT5', 'Forex', 'Gold', 'Indices', 'Prop Firms', 'Automation', 'Risk Management'].map((item) => (
              <span key={item} className="text-sm font-medium text-muted hover:text-primaryBright transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Featured <span className="text-primaryBright">Systems</span>
                </h2>
                <p className="text-muted mt-2">Premium trading systems trusted by traders worldwide.</p>
              </div>
              <Link href="/marketplace" className="text-primaryBright hover:underline flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="card group overflow-hidden hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="relative h-48 bg-surface overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-mutedSoft">
                        No Image
                      </div>
                    )}
                    {product.featured && (
                      <span className="absolute top-3 right-3 badge badge-featured">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {product.category && (
                        <span className="badge badge-primary text-xs">
                          {product.category.name}
                        </span>
                      )}
                      {product.platform && (
                        <span className="badge badge-gray text-xs">
                          {product.platform}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted line-clamp-2">
                      {product.short_description || "Professional trading system"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        {product.sale_price ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primaryBright">
                              ${product.sale_price}
                            </span>
                            <span className="text-sm text-mutedSoft line-through">
                              ${product.price}
                            </span>
                          </div>
                        ) : product.price ? (
                          <span className="text-xl font-bold">
                            ${product.price}
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-primaryBright">Free</span>
                        )}
                      </div>
                      <span className="text-primaryBright group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-surface/30">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-center mb-8">
              Browse by <span className="text-primaryBright">Category</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/marketplace?category=${category.slug}`}
                  className="bg-surface rounded-card border border-border p-4 text-center hover:border-primaryBright/30 transition hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">{category.icon || "📊"}</div>
                  <p className="text-sm font-medium">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-brand-blue-charcoal to-brand-blue-charcoal/90">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Elevate Your Trading?
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mt-4">
            Join thousands of traders using EAPASSER for automated execution,
            risk management, and consistent performance.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/marketplace" className="btn-primary">
              Explore Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="btn-secondary border-white/30 text-white hover:bg-white/10">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}