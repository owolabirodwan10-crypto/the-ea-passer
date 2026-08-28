import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Zap, 
  Shield, 
  BarChart3,
  TrendingUp,
  Download,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react'
import { Metadata } from 'next'
import { GetAccessButton } from '@/components/GetAccessButton'

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  })

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${product.name} - EAPASSER`,
    description: product.short_description || 'Professional trading system',
    keywords: `${product.name}, Forex EA, MT4 EA, MT5 EA, ${product.category?.name || ''}, Trading Automation`,
    openGraph: {
      title: `${product.name} - EAPASSER`,
      description: product.short_description || 'Professional trading system',
      images: product.images && product.images.length > 0 ? [product.images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      images: {
        orderBy: { sort_order: 'asc' },
      },
      videos: true,
      features: {
        orderBy: { sort_order: 'asc' },
      },
      faqs: {
        orderBy: { sort_order: 'asc' },
      },
      versions: {
        orderBy: { release_date: 'desc' },
      },
      performance_records: {
        include: {
          metrics: true,
          charts: true,
        },
      },
    },
  })

  if (!product || product.status !== 'APPROVED') {
    notFound()
  }

  const mainImage = product.images.find(img => img.is_main) || product.images[0]

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-fluorescent-blue">Home</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-brand-fluorescent-blue">Marketplace</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/marketplace?category=${product.category.name}`} className="hover:text-brand-fluorescent-blue">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </div>

      {/* Product Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
            {product.featured && (
              <span className="absolute top-4 left-4 badge badge-featured">
                <Star className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.slice(0, 4).map((image) => (
                <div key={image.id} className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.alt_text || product.name}
                    width={200}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {product.category && (
              <span className="badge badge-primary">
                {product.category.name}
              </span>
            )}
            {product.platform && (
              <span className="badge badge-gray">
                {product.platform}
              </span>
            )}
            {product.risk_level && (
              <span className={`badge ${
                product.risk_level === 'LOW' ? 'badge-success' :
                product.risk_level === 'MEDIUM' ? 'badge-warning' : 'badge-danger'
              }`}>
                {product.risk_level} Risk
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold">{product.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">
            {product.short_description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            {product.sale_price ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-brand-fluorescent-blue">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : product.price ? (
              <span className="text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
            ) : (
              <span className="text-3xl font-bold text-brand-fluorescent-blue">Free</span>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <GetAccessButton
              productId={product.id}
              productName={product.name}
              telegramUsername={product.telegram_username || undefined}
              telegramUrl={product.telegram_url || undefined}
              telegramMessage={product.telegram_message || undefined}
              className="btn-primary flex-1 justify-center text-center"
            />
            <button className="btn-secondary flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask Question
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Forex and CFD trading involves substantial risk. Past performance does not guarantee future results.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {product.views_count > 0 && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-lg font-semibold">{product.views_count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
              </div>
            )}
            {product.versions && product.versions.length > 0 && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-lg font-semibold">v{product.versions[0].version}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest Version</p>
              </div>
            )}
            {product.strategy_type && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-lg font-semibold truncate">{product.strategy_type}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Strategy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rest of the product details... */}
    </div>
  )
}