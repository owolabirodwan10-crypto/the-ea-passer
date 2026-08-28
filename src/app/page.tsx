import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { 
  ArrowRight, 
  Zap, 
  Star,
  ChevronRight,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Target,
  Award,
  Globe,
  Bot,
  Sparkles,
  Coins,
  ChartLine,
  Gauge,
  Cpu,
  LineChart,
  CandlestickChart,
  DollarSign,
  Building2,
  Wallet,
  BadgeCheck
} from "lucide-react";

// Category icon mapping
const categoryIcons: Record<string, any> = {
  "Forex Robots": Bot,
  "Forex EAs": Bot,
  "MT4 EAs": Cpu,
  "MT5 EAs": Cpu,
  "Gold EAs": Coins,
  "Scalping EAs": Gauge,
  "Prop Firm EAs": Award,
  "AI EAs": Sparkles,
  "Indicators": ChartLine,
  "Signals": CandlestickChart,
  "VPS": Globe,
};

export default async function HomePage() {
  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: { 
      status: "APPROVED",
      featured: true,
    },
    include: {
      category: true,
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Fetch categories
  const categories = await prisma.productCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  // Get total product count
  const listingCount = await prisma.product.count({
    where: { status: "APPROVED" },
  });

  // Get images for each product
  const featured = await Promise.all(
    featuredProducts.map(async (product) => {
      let mainImage = null;
      try {
        const images = await prisma.productImage.findMany({
          where: { 
            product_id: product.id,
            is_main: true,
          },
          take: 1,
        });
        if (images && images.length > 0) {
          mainImage = images[0];
        }
      } catch (error) {
        mainImage = null;
      }
      
      return {
        ...product,
        images: mainImage ? [{ url: mainImage.url, is_main: true }] : [],
      };
    })
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
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
                <Link href="/marketplace" className="btn-primary text-sm sm:text-base px-6 py-3">
                  Explore Marketplace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link href="/performance" className="btn-secondary text-sm sm:text-base px-6 py-3">
                  View Performance
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-white">{listingCount}+</p>
                  <p className="text-sm text-muted">Trading Systems</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-white">1,000+</p>
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
              <div className="glass p-6 rounded-2xl border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">Account Equity</p>
                      <p className="text-2xl font-bold text-white">$124,583.42</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Daily P/L</p>
                      <p className="text-2xl font-bold text-green-400">+$2,847.18</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <p className="text-xs text-muted">Drawdown</p>
                      <p className="text-lg font-semibold text-white">8.2%</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <p className="text-xs text-muted">Win Rate</p>
                      <p className="text-lg font-semibold text-primaryBright">67.4%</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <p className="text-xs text-muted">Profit Factor</p>
                      <p className="text-lg font-semibold text-white">1.82</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Active Trades</span>
                      <span className="text-sm font-medium text-primaryBright">4</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full">EURUSD</span>
                      <span className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">XAUUSD</span>
                      <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">GBPUSD</span>
                      <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">BTCUSD</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted">EA Status</p>
                      <p className="text-sm font-medium text-green-400">● EAPASSER Active</p>
                    </div>
                    <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded">Demo Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-6 border-y border-border">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {[
              { icon: Bot, label: "MT4" },
              { icon: Cpu, label: "MT5" },
              { icon: DollarSign, label: "Forex" },
              { icon: Coins, label: "Gold" },
              { icon: LineChart, label: "Indices" },
              { icon: Award, label: "Prop Firms" },
              { icon: Gauge, label: "Automation" },
              { icon: Shield, label: "Risk Management" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primaryBright transition-colors">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why EAPASSER */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              Why <span className="text-primaryBright">EAPASSER</span>
            </h2>
            <p className="text-muted mt-2 max-w-2xl mx-auto">
              Built around professionalism, transparency, and technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Risk-First Approach',
                description: 'Every system is designed with risk management at its core. No guaranteed profits, just disciplined execution.',
              },
              {
                icon: TrendingUp,
                title: 'Verified Performance',
                description: 'Real data, real results. Backtest, demo, and live performance clearly labeled for transparency.',
              },
              {
                icon: Users,
                title: 'Professional Support',
                description: 'Continuous development, customer support, and regular updates to keep your systems performing.',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="card p-6 text-center hover:scale-[1.02] transition-all duration-300">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primaryBright/10 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primaryBright" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 bg-surface/30">
          <div className="container-custom">
            <div className="flex flex-wrap items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Featured <span className="text-primaryBright">Systems</span>
                </h2>
                <p className="text-muted mt-1">Premium trading systems trusted by traders worldwide.</p>
              </div>
              <Link href="/marketplace" className="text-primaryBright hover:underline flex items-center gap-1 mt-2 sm:mt-0">
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
                      <div className="w-full h-full flex items-center justify-center text-mutedSoft bg-surface2">
                        <Bot className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    {product.featured && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-primaryBright text-bg text-xs font-semibold rounded-full">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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
                    <h3 className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted line-clamp-2">
                      {product.short_description || "Professional trading system"}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between">
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
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-center mb-8">
              Browse by <span className="text-primaryBright">Category</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const Icon = categoryIcons[category.name] || BarChart3;
                return (
                  <Link
                    key={category.id}
                    href={`/marketplace?category=${category.slug}`}
                    className="bg-surface rounded-card border border-border p-4 text-center hover:border-primaryBright/30 transition hover:scale-[1.02] group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-primaryBright/10 flex items-center justify-center mb-3 group-hover:bg-primaryBright/20 transition">
                      <Icon className="w-6 h-6 text-primaryBright" />
                    </div>
                    <p className="text-sm font-medium">{category.name}</p>
                  </Link>
                );
              })}
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
            <Link href="/marketplace" className="btn-primary text-sm sm:text-base px-6 py-3">
              Explore Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/contact" className="btn-secondary border-white/30 text-white hover:bg-white/10 text-sm sm:text-base px-6 py-3">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}