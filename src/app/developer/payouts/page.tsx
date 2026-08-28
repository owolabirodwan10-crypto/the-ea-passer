"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

interface Payout {
  id: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: string;
  paymentRef: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export default function DeveloperPayoutsPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?next=/developer/payouts");
        return;
      }

      setUser(user);

      try {
        const res = await fetch("/api/developer/payouts");
        if (!res.ok) throw new Error("Failed to fetch payouts");
        const data = await res.json();
        setPayouts(data.payouts || []);
        setTotalEarned(data.totalEarned || 0);
        setPendingAmount(data.pendingAmount || 0);
      } catch (err: any) {
        setError(err.message || "Failed to load payouts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/20 text-success"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case "REQUESTED":
        return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-warning/20 text-warning"><Clock className="w-3 h-3" /> Pending</span>;
      case "APPROVED":
        return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primaryBright/20 text-primaryBright"><Clock className="w-3 h-3" /> Approved</span>;
      case "PROCESSING":
        return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500"><Clock className="w-3 h-3" /> Processing</span>;
      case "REJECTED":
        return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-error/20 text-error"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="text-xs px-2 py-1 rounded-full bg-mutedSoft/20 text-mutedSoft">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primaryBright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Developer Payouts</h1>
      <p className="mb-8 text-sm text-muted">Track your earnings and payout history.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-sm text-muted">Total Earned</p>
          <p className="text-2xl font-bold text-success">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-sm text-muted">Pending</p>
          <p className="text-2xl font-bold text-warning">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-sm text-muted">Total Payouts</p>
          <p className="text-2xl font-bold">{payouts.length}</p>
        </div>
      </div>

      {/* Payouts List */}
      {payouts.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
          <p className="text-muted">No payouts yet.</p>
          <p className="text-xs text-mutedSoft mt-1">Payouts will appear here once processed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div key={payout.id} className="bg-surface rounded-card border border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${payout.netAmount.toFixed(2)}</span>
                    {getStatusBadge(payout.status)}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Commission: ${payout.commission.toFixed(2)} • 
                    Requested: {new Date(payout.requestedAt).toLocaleDateString()}
                    {payout.processedAt && ` • Processed: ${new Date(payout.processedAt).toLocaleDateString()}`}
                  </div>
                  {payout.paymentRef && (
                    <div className="text-xs text-mutedSoft mt-1">
                      Ref: {payout.paymentRef}
                    </div>
                  )}
                </div>
                <ArrowUpRight className="w-4 h-4 text-mutedSoft" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}