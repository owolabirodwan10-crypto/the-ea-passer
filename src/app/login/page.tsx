"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await supabase.auth.getSession();

      const role = data.user?.user_metadata?.role || "CUSTOMER";
      const redirectPath = role === "ADMIN" || role === "SUPER_ADMIN" ? "/admin" : next;

      window.location.href = redirectPath;
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primaryBright/30 shadow-lg shadow-primaryBright/10 flex-shrink-0">
                <Image
                  src="/icon.png"
                  alt="EAPASSER"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="text-3xl font-bold text-primaryBright">EAPASSER</span>
            </div>
          </Link>
          <p className="text-muted mt-3">Sign in to your account</p>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text placeholder-mutedSoft focus:outline-none focus:ring-2 focus:ring-primaryBright/50 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text placeholder-mutedSoft focus:outline-none focus:ring-2 focus:ring-primaryBright/50 transition"
                placeholder="••••••••"
                required
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
              className="w-full py-3 bg-primaryBright text-bg font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 text-base"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Don't have an account?{" "}
              <Link href="/register" className="text-primaryBright hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}