import { redirect } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EmptyState, StatusBadge } from "@/components/ui/Primitives";
import { NewTicketForm } from "./NewTicketForm";

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/support");

  const tickets = await prisma.supportTicket.findMany({
    where: { customerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />
      <div className="mx-auto max-w-[820px] px-6 py-10">
        <h1 className="font-display mb-1 text-[28px] font-bold">Help Center</h1>
        <p className="mb-8 text-sm text-muted">Open a ticket and the support team will reply here.</p>

        <div className="mb-10">
          <NewTicketForm />
        </div>

        <h2 className="mb-4 text-[15px] font-semibold">Your tickets</h2>
        {tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No tickets yet" description="Tickets you open will show up here with the full reply thread." />
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-card border border-border bg-surface p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold">{t.subject}</h3>
                  <StatusBadge status={t.status} />
                </div>
                <div className="space-y-2.5">
                  {t.messages.map((m) => (
                    <div key={m.id} className="rounded-lg border border-borderSoft bg-bg/40 p-3 text-[13px] text-muted">
                      {m.content}
                    </div>
                  ))}
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
