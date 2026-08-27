"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CircularLogo } from "@/components/ui/CircularLogo";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not sign in.");
      return;
    }

    if (data.requiresTwoFactor) {
      setPendingToken(data.pendingToken);
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingToken, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Incorrect code.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-text">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <CircularLogo size={40} />
          <span className="text-lg font-bold">
            EAPA<span className="text-primaryBright">SER</span>
          </span>
        </Link>

        <div className="rounded-card border border-border bg-surface p-7">
          {pendingToken ? (
            <>
              <h1 className="font-display mb-1 text-xl font-bold">Enter your code</h1>
              <p className="mb-6 text-sm text-muted">Open your authenticator app, or use a backup code.</p>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <Field label="Authentication code">
                  <input
                    required
                    autoFocus
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-center text-lg font-mono outline-none focus:border-primary/50"
                  />
                </Field>
                {error && <p className="text-[13px] text-error">{error}</p>}
                <Button type="submit" className="w-full justify-center" disabled={loading}>
                  {loading ? "Verifying..." : "Verify and sign in"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setPendingToken(null); setCode(""); setError(null); }}
                  className="w-full text-center text-[12px] text-mutedSoft hover:text-text"
                >
                  Back to sign in
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display mb-1 text-xl font-bold">Sign in</h1>
              <p className="mb-6 text-sm text-muted">Access your marketplace account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Email">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </Field>

                {error && <p className="text-[13px] text-error">{error}</p>}

                <Button type="submit" className="w-full justify-center" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <p className="mt-5 text-center text-[13px] text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primaryBright hover:underline">
                  Create one
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
