import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) return {};
  return { title: post.seoTitle ?? post.title, description: post.seoDescription ?? post.excerpt ?? undefined };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || post.status !== "PUBLISHED") notFound();

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <article className="mx-auto max-w-[720px] px-6 py-14">
        {post.category && <span className="text-[11px] font-semibold uppercase tracking-wide text-primaryBright">{post.category}</span>}
        <h1 className="font-display mt-2 mb-6 text-[32px] font-bold leading-tight">{post.title}</h1>
        <div className="whitespace-pre-line text-[15px] leading-relaxed text-muted">{post.content}</div>
      </article>
      <SiteFooter />
    </div>
  );
}
