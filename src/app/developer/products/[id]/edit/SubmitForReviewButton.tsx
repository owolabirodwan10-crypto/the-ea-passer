"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SubmitForReviewButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/developer/products/${productId}/submit`, { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not submit for review.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Button variant="success" onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit for review"}
      </Button>
      {error && <p className="mt-2 text-[13px] text-error">{error}</p>}
    </div>
  );
}
