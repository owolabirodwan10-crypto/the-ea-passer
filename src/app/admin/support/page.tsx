import { LifeBuoy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/Primitives";
import { AdminTicketPanel } from "./AdminTicketPanel";

export default async function AdminSupportPage() {
  const tickets = await prisma.supportTicket.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] } },
    orderBy: { updatedAt: "asc" },
    include: { customer: true, messages: { orderBy: { createdAt: "asc" }, include: { author: true } } },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Support</h1>
      <p className="mb-8 text-sm text-muted">Open tickets, oldest activity first.</p>

      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No open tickets" description="New tickets from customers will appear here." />
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <AdminTicketPanel
              key={t.id}
              ticketId={t.id}
              subject={t.subject}
              status={t.status}
              customerName={`${t.customer.name} · ${t.customer.email}`}
              messages={t.messages.map((m) => ({
                id: m.id,
                content: m.content,
                authorName: m.author.name,
                createdAt: m.createdAt.toISOString(),
              }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
