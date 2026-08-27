"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Primitives";

export interface VersionRow {
  id: string;
  version: string;
  status: string;
  releaseDate: string;
  releaseNotes: string | null;
}

export function VersionList({ productId, versions }: { productId: string; versions: VersionRow[] }) {
  return (
    <div className="divide-y divide-borderSoft rounded-card border border-border bg-surface">
      {versions.map((v) => (
        <VersionRowItem key={v.id} productId={productId} version={v} />
      ))}
    </div>
  );
}

function VersionRowItem({ productId, version }: { productId: string; version: VersionRow }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/developer/products/${productId}/versions/${version.id}/download`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not get a download link.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div>
        <div className="font-mono text-[13.5px] font-medium">v{version.version}</div>
        <div className="mt-0.5 text-xs text-mutedSoft">
          {new Date(version.releaseDate).toDateString()}
          {version.releaseNotes ? ` · ${version.releaseNotes}` : ""}
        </div>
        {error && <p className="mt-1 text-[11px] text-error">{error}</p>}
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={version.status} />
        <Button size="sm" variant="ghost" onClick={handleDownload} disabled={loading}>
          <Download size={13} /> {loading ? "Preparing..." : "Download"}
        </Button>
      </div>
    </div>
  );
}
