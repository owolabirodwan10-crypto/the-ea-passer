import { KeyRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";
import { DownloadButton } from "./DownloadButton";

export default async function CustomerLicensesPage() {
  const user = (await getCurrentUser())!;

  const licenses = await prisma.license.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { versions: { orderBy: { releaseDate: "desc" }, take: 1 } } } },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">My Licenses</h1>
      <p className="mb-8 text-sm text-muted">Licensed products tied to your account.</p>

      {licenses.length === 0 ? (
        <EmptyState icon={KeyRound} title="No licenses yet" description="A license is created automatically for every product you buy." />
      ) : (
        <div className="space-y-3">
          {licenses.map((license) => {
            const version = license.product.versions[0];
            return (
              <div key={license.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface p-5">
                <div>
                  <div className="text-[14.5px] font-semibold">{license.product.name}</div>
                  <div className="font-mono mt-1 text-xs text-mutedSoft">{license.licenseKey}</div>
                  <div className="mt-1 text-xs text-mutedSoft">
                    {license.activationCount} / {license.activationLimit} activations used
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={license.status} />
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
