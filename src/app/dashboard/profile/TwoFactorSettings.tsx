"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Stage = "idle" | "enrolling" | "backup-codes";

export function TwoFactorSettings({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [stage, setStage] = useState<Stage>("idle");
  const [secret, setSecret] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startEnroll() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/account/2fa/enroll", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not start enrollment.");
      return;
    }
    setSecret(data.secret);
    setOtpAuthUrl(data.otpAuthUrl);
    setStage("enrolling");
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/account/2fa/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Incorrect code.");
      return;
    }
    setBackupCodes(data.backupCodes);
    setEnabled(true);
    setStage("backup-codes");
    setCode("");
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/account/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not disable.");
      return;
    }
    setEnabled(false);
    setStage("idle");
    setPassword("");
  }

  if (stage === "backup-codes") {
    return (
      <div className="rounded-card border border-success/30 bg-success/[0.05] p-6">
        <h3 className="mb-1.5 text-sm font-semibold text-success">Two-factor authentication enabled</h3>
        <p className="mb-4 text-[13px] text-muted">
          Save these backup codes somewhere safe. Each one can be used once if you lose access to
          your authenticator app. They will not be shown again.
        </p>
        <div className="font-mono mb-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-bg p-4 text-[13px]">
          {backupCodes.map((c) => <span key={c}>{c}</span>)}
        </div>
        <Button size="sm" onClick={() => setStage("idle")}>Done</Button>
      </div>
    );
  }

  if (stage === "enrolling") {
    return (
      <form onSubmit={confirmEnroll} className="rounded-card border border-border bg-surface p-6">
        <h3 className="mb-1.5 text-sm font-semibold">Set up your authenticator app</h3>
        <p className="mb-4 text-[13px] leading-relaxed text-muted">
          Add a new account in your authenticator app using this key, then enter the 6-digit code
          it generates.
        </p>
        <div className="font-mono mb-4 break-all rounded-lg border border-border bg-bg p-3 text-[13px]">
          {secret}
        </div>
        <p className="mb-4 break-all text-[11px] text-mutedSoft">{otpAuthUrl}</p>
        <input
          required
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          className="font-mono mb-3 w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-center text-lg outline-none focus:border-primary/50"
        />
        {error && <p className="mb-3 text-[13px] text-error">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Confirming..." : "Confirm and enable"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setStage("idle")}>Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Two-factor authentication</h3>
        <span className={`text-[11px] font-semibold ${enabled ? "text-success" : "text-mutedSoft"}`}>
          {enabled ? "Enabled" : "Not enabled"}
        </span>
      </div>
      <p className="mb-4 text-[13px] text-muted">
        {enabled
          ? "Your account requires a code from your authenticator app at sign in."
          : "Add an authenticator app code as a second sign-in step."}
      </p>

      {enabled ? (
        <form onSubmit={disable} className="space-y-3">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          />
          {error && <p className="text-[13px] text-error">{error}</p>}
          <Button type="submit" size="sm" variant="danger" disabled={loading}>
            {loading ? "Disabling..." : "Disable two-factor authentication"}
          </Button>
        </form>
      ) : (
        <>
          {error && <p className="mb-3 text-[13px] text-error">{error}</p>}
          <Button size="sm" onClick={startEnroll} disabled={loading}>
            {loading ? "Starting..." : "Set up two-factor authentication"}
          </Button>
        </>
      )}
    </div>
  );
}
