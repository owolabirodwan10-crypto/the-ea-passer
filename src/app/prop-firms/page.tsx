import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EmptyState } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Prop Firms",
  description: "Prop firm challenge and EA compatibility directory maintained by EAPASER.",
};

// ✅ Define the PropFirm type
interface PropFirm {
  id: string;
  name: string;
  description: string | null;
  eaCompatible: boolean;
  website: string | null;
  accountSizes: string[];
}

export default async function PropFirmsPage() {
  // ✅ Explicitly type the firms array
  let firms: PropFirm[] = [];
  
  try {
    const result = await prisma.propFirm.findMany({ 
      where: { status: "PUBLISHED" }, 
      orderBy: { name: "asc" } 
    });
    firms = result as PropFirm[];
  } catch (error) {
    console.error('Error fetching prop firms:', error);
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <h1 className="font-display mb-1 text-[28px] font-bold">Prop Firms</h1>
        <p className="mb-8 text-sm text-muted">
          Challenge rules and EA compatibility change often. This directory only shows what has been confirmed and entered by the team.
        </p>

        {firms.length === 0 ? (
          <EmptyState icon={Trophy} title="No prop firms listed yet" description="Prop firm profiles will appear here as the team adds them." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {firms.map((f) => (
              <div key={f.id} className="rounded-card border border-border bg-surface p-5">
                <h3 className="mb-1.5 text-[15px] font-semibold">{f.name}</h3>
                {f.description && <p className="mb-3 line-clamp-3 text-[13.5px] text-muted">{f.description}</p>}
                <div className="flex items-center gap-2 text-[11px] text-mutedSoft">
                  <span>{f.eaCompatible ? "✅ EA compatible" : "❌ EA compatibility not confirmed"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}