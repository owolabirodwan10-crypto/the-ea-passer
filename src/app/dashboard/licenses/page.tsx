"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { DownloadButton } from "./DownloadButton";

interface License {
  id: string;
  licenseKey: string;
  status: string;
  activationCount: number;
  activationLimit: number;
  expiresAt: string | null;
  product: {
    name: string;
    versions: { version: string; releaseDate: string }[];
  };
}

export default function CustomerLicensesPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [licenses, setLicenses] = useState<License[]>([]);
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
        if (!res.ok) throw new Error("Failed to fetch licenses");
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
      <p className="mb-8 text-sm text-muted">Licensed products tied to your account.</p>

      {licenses.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <KeyRound className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
          <p className="text-muted">No licenses yet.</p>
          <p className="text-xs text-mutedSoft mt-1">A license is created automatically for every product you buy.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {licenses.map((license) => {
            const version = license.product?.versions?.[0];
            return (
              <div
                key={license.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface p-5"
              >
                <div>
                  <div className="text-[14.5px] font-semibold">{license.product?.name || "Product"}</div>
                  <div className="font-mono mt-1 text-xs text-mutedSoft">{license.licenseKey}</div>
                  <div className="mt-1 text-xs text-mutedSoft">
                    {license.activationCount || 0} / {license.activationLimit || 1} activations used
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    license.status === "ACTIVE" ? "bg-success/20 text-success" :
                    license.status === "EXPIRED" ? "bg-error/20 text-error" :
                    license.status === "REVOKED" ? "bg-error/20 text-error" :
                    "bg-warning/20 text-warning"
                  }`}>
                    {license.status || "INACTIVE"}
                  </span>
                  {license.status === "ACTIVE" && version ? (
                    <DownloadButton licenseId={license.id} />
                  ) : (
                    <span className="text-xs text-mutedSoft">
                      {version ? "License inactive" : "No file uploaded yet"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}