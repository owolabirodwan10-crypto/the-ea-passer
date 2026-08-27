import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EmptyState } from "@/components/ui/Primitives";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Learn",
  description: "Guides on Forex EAs, backtesting, risk management and automated trading.",
};

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <h1 className="font-display mb-1 text-[28px] font-bold">Learn</h1>
        <p className="mb-8 text-sm text-muted">Guides on EAs, backtesting, risk and automated trading.</p>

        {posts.length === 0 ? (
          <EmptyState icon={BookOpen} title="No articles published yet" description="Guides and articles will appear here as the content team publishes them." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/45"
              >
                {post.category && <span className="text-[11px] font-semibold uppercase tracking-wide text-primaryBright">{post.category}</span>}
                <h3 className="mt-2 mb-1.5 text-[15px] font-semibold leading-snug">{post.title}</h3>
                {post.excerpt && <p className="line-clamp-3 text-[13.5px] text-muted">{post.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
