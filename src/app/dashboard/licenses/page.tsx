"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, CheckCircle, XCircle, Clock } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export default function LicensesPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLicenses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/dashboard/licenses");
        return;
      }

      try {
        const res = await fetch("/api/licenses");
        const data = await res.json();
        setLicenses(data);
      } catch (error) {
        console.error("Failed to fetch licenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
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
      <h1 className="font-display mb-1 text-2xl font-bold">My Licenses</h1>
      <p className="mb-8 text-sm text-muted">Manage your active licenses.</p>

      {licenses.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <KeyRound className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
          <p className="text-muted">No licenses found.</p>
          <Link href="/marketplace" className="text-primaryBright hover:underline inline-block mt-2">
            Browse marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {licenses.map((license) => (
            <div key={license.id} className="bg-surface rounded-card border border-border p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{license.product?.name || "License"}</p>
                  <p className="text-sm font-mono text-muted">{license.licenseKey}</p>
                </div>
                <div className="text-right">
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    license.status === "ACTIVE" ? "bg-success/20 text-success" :
                    license.status === "EXPIRED" ? "bg-error/20 text-error" :
                    "bg-warning/20 text-warning"
                  }`}>
                    {license.status === "ACTIVE" && <CheckCircle className="w-3 h-3" />}
                    {license.status === "EXPIRED" && <XCircle className="w-3 h-3" />}
                    {license.status === "PENDING" && <Clock className="w-3 h-3" />}
                    {license.status}
                  </span>
                  {license.expiresAt && (
                    <p className="text-xs text-muted mt-1">
                      Expires: {new Date(license.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}