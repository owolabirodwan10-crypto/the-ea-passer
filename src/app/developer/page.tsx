"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { 
  Package, 
  Users, 
  TrendingUp, 
  Wallet,
  Plus,
  ArrowRight,
  LayoutGrid,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function DeveloperPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?next=/developer");
        return;
      }

      setUser(user);
      
      // Fetch developer products
      try {
        const res = await fetch("/api/developer/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalEarned(data.totalEarned || 0);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primaryBright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Developer Dashboard</h1>
          <p className="text-muted mt-1">Manage your products and earnings.</p>
        </div>
        <Link href="/developer/products/new" className="btn-primary flex items-center gap-2 mt-4 sm:mt-0">
          <Plus className="w-4 h-4" />
          List New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-primaryBright" />
            <div>
              <p className="text-sm text-muted">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primaryBright" />
            <div>
              <p className="text-sm text-muted">Total Earnings</p>
              <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primaryBright" />
            <div>
              <p className="text-sm text-muted">Active Listings</p>
              <p className="text-2xl font-bold">{products.filter(p => p.status === "APPROVED").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-surface rounded-card border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Your Products</h2>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
            <p className="text-muted">No products listed yet.</p>
            <Link href="/developer/products/new" className="text-primaryBright hover:underline inline-block mt-2">
              List your first product →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex flex-wrap items-center justify-between p-4 bg-bg rounded-lg border border-border">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.status === "APPROVED" ? "bg-success/20 text-success" :
                      product.status === "PENDING_REVIEW" ? "bg-warning/20 text-warning" :
                      "bg-mutedSoft/20 text-mutedSoft"
                    }`}>
                      {product.status || "Draft"}
                    </span>
                    {product.featured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primaryBright/20 text-primaryBright">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <span className="text-sm font-medium">${product.price || 0}</span>
                  <Link href={`/product/${product.slug}`} className="text-primaryBright hover:underline text-sm">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}