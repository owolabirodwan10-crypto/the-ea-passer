"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "CUSTOMER" },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    if (data.user?.confirmed_at) {
      router.push("/dashboard");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-surface p-8 rounded-card border border-border">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Check Your Email</h2>
            <p className="text-muted">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>.
              Please check your inbox and click the link to activate your account.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block px-6 py-2 bg-primaryBright text-bg font-semibold rounded-lg hover:opacity-90 transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primaryBright">EAPASSER</h1>
          <p className="text-muted mt-2">Create your account</p>
        </div>

        <div className="bg-surface p-8 rounded-card border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text placeholder-mutedSoft focus:outline-none focus:border-primaryBright transition"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text placeholder-mutedSoft focus:outline-none focus:border-primaryBright transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text placeholder-mutedSoft focus:outline-none focus:border-primaryBright transition"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primaryBright text-bg font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-primaryBright hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}