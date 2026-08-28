"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, KeyRound, Download } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    licenses: 0,
    downloads: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?next=/dashboard");
        return;
      }

      setUser(user);

      // Fetch stats
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primaryBright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Dashboard</h1>
      <p className="mb-8 text-sm text-muted">
        Welcome back, {user?.user_metadata?.name || "Trader"}.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-primaryBright" />
            <div>
              <p className="text-sm text-muted">Orders</p>
              <p className="text-2xl font-bold">{stats.orders}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-primaryBright" />
            <div>
              <p className="text-sm text-muted">Active Licenses</p>
              <p className="text-2xl font-bold">{stats.licenses}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-primaryBright" />
            <div>
              <p className="text-sm text-muted">Downloads</p>
              <p className="text-2xl font-bold">{stats.downloads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-surface rounded-card border border-border p-5">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="px-4 py-2 bg-primaryBright text-bg rounded-lg hover:opacity-90 transition"
          >
            Browse Marketplace
          </Link>
          <Link
            href="/dashboard/licenses"
            className="px-4 py-2 border border-primaryBright text-primaryBright rounded-lg hover:bg-primaryBright/10 transition"
          >
            My Licenses
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 border border-primaryBright text-primaryBright rounded-lg hover:bg-primaryBright/10 transition"
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
}