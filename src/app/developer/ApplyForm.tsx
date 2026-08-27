"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Primitives";

interface ExistingApplication {
  status: string;
  reviewNotes: string | null;
}

export function ApplyForm({ existingApplication }: { existingApplication: ExistingApplication | null }) {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (existingApplication?.status === "SUBMITTED" || existingApplication?.status === "UNDER_REVIEW") {
    return (
      <div className="rounded-card border border-border bg-surface p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold">Application status</span>
          <StatusBadge status={existingApplication.status} />
        </div>
        <p className="text-[13.5px] text-muted">
          Your application is with the review team. You&apos;ll be notified once a decision is made.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-success/30 bg-success/[0.06] p-5 text-[13.5px] text-success">
        Application submitted. An admin will review it shortly.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/developer/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, website, message }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not submit application.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-6">
      {existingApplication?.status === "REJECTED" && (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/[0.06] p-3 text-[13px] text-error">
          Your previous application was not approved{existingApplication.reviewNotes ? `: ${existingApplication.reviewNotes}` : "."}
          {" "}You can apply again below.
        </div>
      )}
      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Company or brand name (optional)</span>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </label>
      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Website or portfolio (optional)</span>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </label>
      <label className="mb-5 block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Tell us about what you build</span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </label>
      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit application"}
      </Button>
    </form>
  );
}
