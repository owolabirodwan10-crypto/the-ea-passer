import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";

export interface ProductCardData {
  slug: string;
  name: string;
  shortDescription: string;
  price: number | string;
  currency: string;
  platform: string;
  verified: boolean;
  ratingAverage: number | string;
  ratingCount: number;
  developer: { companyName: string | null; user: { name: string } };
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const rating = Number(product.ratingAverage);
  const developerName = product.developer.companyName ?? product.developer.user.name;

  return (
    <Link
      href={`/marketplace/${product.slug}`}
      className="group flex flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/45 hover:bg-surface2"
    >
      <div className="mb-4 flex h-32 items-center justify-center rounded-lg border border-borderSoft bg-[radial-gradient(circle_at_30%_20%,rgba(47,124,246,0.12),transparent_60%)] text-mutedSoft">
        <span className="font-mono text-xs">{product.platform}</span>
      </div>

      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-snug">{product.name}</h3>
        {product.verified && (
          <span title="Verified listing" className="mt-0.5 shrink-0 text-primaryBright">
            <BadgeCheck size={16} />
          </span>
        )}
      </div>
      <div className="mb-2.5 text-xs text-mutedSoft">{developerName}</div>
      <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-muted">{product.shortDescription}</p>

      <div className="mt-auto flex items-center justify-between border-t border-borderSoft pt-3.5">
        <div className="flex items-center gap-1 text-xs text-muted">
          {product.ratingCount > 0 ? (
            <>
              <Star size={13} className="fill-warning text-warning" />
              <span className="font-medium text-text">{rating.toFixed(1)}</span>
              <span>({product.ratingCount})</span>
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
        <div className="font-mono text-[15px] font-semibold">
          {product.currency} {Number(product.price).toFixed(0)}
        </div>
      </div>
    </Link>
  );
}
