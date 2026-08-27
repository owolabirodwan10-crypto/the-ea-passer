import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { requirePermission, AuthError } from "@/server/auth/rbac";
import { sendEmail } from "@/server/email/provider";

const schema = z.object({
  reply: z.string().min(1).max(4000).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actor = await getCurrentUser();
    await requirePermission(actor, "manage_support");

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id }, include: { customer: true } });
    if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

    if (parsed.data.reply) {
      await prisma.ticketMessage.create({
        data: { ticketId: ticket.id, authorId: actor!.id, content: parsed.data.reply, internal: false },
      });
      await sendEmail({
        to: ticket.customer.email,
        subject: `Re: ${ticket.subject}`,
        html: `<p>${parsed.data.reply}</p>`,
      });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: parsed.data.status ?? (parsed.data.reply ? "WAITING" : undefined),
        assignedToId: actor!.id,
      },
    });

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    console.error("[admin support update]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
