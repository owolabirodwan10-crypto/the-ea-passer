"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { CircularLogo } from "@/components/ui/CircularLogo";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not create your account.");
      return;
    }
    setDone(true);
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
          {done ? (
            <div className="text-center">
              <h1 className="font-display mb-2 text-xl font-bold">Check your email</h1>
              <p className="text-sm leading-relaxed text-muted">
                If that email can be registered, we&apos;ve sent a verification link. Confirm it to
                activate your account, then sign in.
              </p>
              <Link href="/login" className="mt-5 inline-block text-sm text-primaryBright hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display mb-1 text-xl font-bold">Create your account</h1>
              <p className="mb-6 text-sm text-muted">Browse the marketplace and manage licenses.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Full name">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </Field>
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
                    minLength={10}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
                  />
                  <span className="mt-1 block text-[11px] text-mutedSoft">
                    At least 10 characters, with a letter and a number or symbol.
                  </span>
                </Field>

                {error && <p className="text-[13px] text-error">{error}</p>}

                <Button type="submit" className="w-full justify-center" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <p className="mt-5 text-center text-[13px] text-muted">
                Already have an account?{" "}
                <Link href="/login" className="text-primaryBright hover:underline">
                  Sign in
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
