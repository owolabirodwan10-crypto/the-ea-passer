"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VersionUploadForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [version, setVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setLoading(true);
    setError(null);

    const form = new FormData();
    form.set("file", file);
    form.set("version", version);
    form.set("releaseNotes", releaseNotes);

    const res = await fetch(`/api/developer/products/${productId}/versions`, {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }

    setVersion("");
    setReleaseNotes("");
    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-5">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Version</span>
          <input
            required
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">File (.ex4, .ex5, .set, .zip, .pdf)</span>
          <input
            required
            type="file"
            accept=".ex4,.ex5,.set,.zip,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-[13px] text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-bg file:px-2.5 file:py-1.5 file:text-[12px] file:text-text"
          />
        </label>
      </div>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Release notes (optional)</span>
        <input
          value={releaseNotes}
          onChange={(e) => setReleaseNotes(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary/50"
        />
      </label>
      {error && <p className="mb-3 text-[12.5px] text-error">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        <UploadCloud size={14} /> {loading ? "Uploading..." : "Upload version"}
      </Button>
    </form>
  );
}
