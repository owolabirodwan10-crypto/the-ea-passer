"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RevokeButton({ licenseId }: { licenseId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          size="sm"
          variant="danger"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await fetch(`/api/admin/licenses/${licenseId}/revoke`, { method: "POST" });
            setLoading(false);
            router.refresh();
          }}
        >
          Confirm
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="text-right">
      <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>Revoke</Button>
    </div>
  );
}
