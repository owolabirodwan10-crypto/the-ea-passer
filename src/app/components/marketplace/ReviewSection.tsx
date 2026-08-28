"use client";

import type React from "react";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";

interface ReviewData {
  id: string;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  createdAt: Date;
  customer: { name: string };
}

export function ReviewSection({
  productId,
  reviews,
  canReview,
}: {
  productId: string;
  reviews: ReviewData[];
  canReview: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mb-4">
      <h2 className="mb-4 text-lg font-semibold">Reviews</h2>

      {reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No reviews yet" description="Reviews appear here once verified purchasers leave feedback." />
      ) : (
        <div className="mb-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} className={i < r.rating ? "fill-warning text-warning" : "text-borderSoft"} />
                  ))}
                </div>
                <span className="text-[13px] font-medium">{r.title}</span>
                {r.verifiedPurchase && <span className="text-[11px] text-success">Verified purchase</span>}
              </div>
              <p className="mb-1.5 text-[13.5px] leading-relaxed text-muted">{r.content}</p>
              <span className="text-xs text-mutedSoft">{r.customer.name}</span>
            </div>
          ))}
        </div>
      )}

      {canReview && !submitted && <ReviewForm productId={productId} onSubmitted={() => setSubmitted(true)} />}
      {submitted && (
        <p className="text-[13.5px] text-success">
          Your review was submitted and is pending moderation before it appears publicly.
        </p>
      )}
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, title, content }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not submit review.");
      return;
    }
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-5">
      <h3 className="mb-3 text-sm font-semibold">Leave a review</h3>
      <div className="mb-3 flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button type="button" key={i} onClick={() => setRating(i + 1)}>
            <Star size={20} className={i < rating ? "fill-warning text-warning" : "text-borderSoft"} />
          </button>
        ))}
      </div>
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title"
        className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-mutedSoft focus:border-primary/50"
      />
      <textarea
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience running this EA"
        rows={3}
        className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-mutedSoft focus:border-primary/50"
      />
      {error && <p className="mb-3 text-[13px] text-error">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
