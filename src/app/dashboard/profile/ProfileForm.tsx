"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ProfileForm({
  initialName,
  email,
  twoFactorEnabled,
}: {
  initialName: string;
  email: string;
  twoFactorEnabled: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name !== initialName ? name : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setStatus({ type: "error", message: data.error ?? "Could not save changes." });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setStatus({
      type: "success",
      message: data.passwordChanged ? "Saved. You were signed out of other sessions." : "Saved.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-6">
      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-medium text-muted">Email</span>
        <div className="rounded-lg border border-borderSoft bg-bg/40 px-3.5 py-2.5 text-sm text-mutedSoft">{email}</div>
      </div>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Full name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </label>

      <div className="mb-4 border-t border-borderSoft pt-4">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-mutedSoft">Change password</span>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">New password</span>
          <input
            type="password"
            minLength={10}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          />
        </label>
      </div>

      {status && (
        <p className={`mb-4 text-[13px] ${status.type === "error" ? "text-error" : "text-success"}`}>{status.message}</p>
      )}

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
