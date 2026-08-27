"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ModerationActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "reject" | "changes">("idle");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/approve`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not approve.");
      return;
    }
    router.refresh();
  }

  async function handleReject(requestChanges: boolean) {
    if (notes.trim().length < 3) {
      setError("Add a short note explaining the decision.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, requestChanges }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save decision.");
      return;
    }
    setMode("idle");
    setNotes("");
    router.refresh();
  }

  if (mode === "reject" || mode === "changes") {
    return (
      <div className="mt-3 rounded-lg border border-border bg-bg p-3.5">
        <textarea
          autoFocus
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={mode === "reject" ? "Why is this being rejected?" : "What needs to change?"}
          className="mb-2.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary/50"
        />
        {error && <p className="mb-2 text-[12px] text-error">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" variant="danger" disabled={loading} onClick={() => handleReject(mode === "changes")}>
            Confirm {mode === "reject" ? "reject" : "request changes"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setMode("idle"); setError(null); }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <Button size="sm" variant="success" disabled={loading} onClick={handleApprove}>Approve</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("changes")}>Request changes</Button>
        <Button size="sm" variant="danger" onClick={() => setMode("reject")}>Reject</Button>
      </div>
      {error && <p className="mt-2 text-[12px] text-error">{error}</p>}
    </div>
  );
}
