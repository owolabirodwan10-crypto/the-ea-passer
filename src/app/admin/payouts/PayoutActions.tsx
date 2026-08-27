"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const NEXT_ACTION: Record<string, { label: string; status: string; variant: "success" | "danger" }[]> = {
  REQUESTED: [
    { label: "Approve", status: "APPROVED", variant: "success" },
    { label: "Reject", status: "REJECTED", variant: "danger" },
  ],
  APPROVED: [
    { label: "Mark processing", status: "PROCESSING", variant: "success" },
    { label: "Reject", status: "REJECTED", variant: "danger" },
  ],
  PROCESSING: [
    { label: "Mark paid", status: "PAID", variant: "success" },
    { label: "Reject", status: "REJECTED", variant: "danger" },
  ],
};

export function PayoutActions({ payoutId, status }: { payoutId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actions = NEXT_ACTION[status] ?? [];

  if (actions.length === 0) return null;

  async function handleUpdate(newStatus: string) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/payouts/${payoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not update.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-2">
        {actions.map((a) => (
          <Button key={a.status} size="sm" variant={a.variant} disabled={loading} onClick={() => handleUpdate(a.status)}>
            {a.label}
          </Button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-[11px] text-error">{error}</p>}
    </div>
  );
}
