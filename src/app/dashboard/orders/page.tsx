"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ✅ ADD THIS IMPORT
import { Package } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/dashboard/orders");
        return;
      }

      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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
      <h1 className="font-display mb-1 text-2xl font-bold">My Orders</h1>
      <p className="mb-8 text-sm text-muted">View your purchase history.</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <Package className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
          <p className="text-muted">No orders yet.</p>
          <Link href="/marketplace" className="text-primaryBright hover:underline inline-block mt-2">
            Browse marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface rounded-card border border-border p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.product?.name || "Order"}</p>
                  <p className="text-sm text-muted">Order #{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === "PAID" ? "bg-success/20 text-success" :
                    order.status === "PENDING" ? "bg-warning/20 text-warning" :
                    "bg-mutedSoft/20 text-mutedSoft"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}