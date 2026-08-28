"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DownloadButton({ licenseId }: { licenseId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/downloads/${licenseId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not start the download.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Storage provider is not configured yet. Try again once an administrator connects one.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <Button size="sm" variant="ghost" onClick={handleDownload} disabled={loading}>
        <Download size={14} /> {loading ? "Preparing..." : "Download"}
      </Button>
      {error && <p className="mt-1.5 max-w-[220px] text-[11px] text-error">{error}</p>}
    </div>
  );
}