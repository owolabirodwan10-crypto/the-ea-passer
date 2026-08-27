import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { notifyAdminTelegram } from "@/server/telegram/notify";
import { recordAuditLog } from "@/server/services/audit";

const createSchema = z.object({
  subject: z.string().min(4).max(150),
  message: z.string().min(10).max(4000),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const tickets = await prisma.supportTicket.findMany({
    where: { customerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const ticket = await prisma.supportTicket.create({
    data: {
      customerId: user.id,
      subject: parsed.data.subject,
      status: "OPEN",
      messages: { create: [{ authorId: user.id, content: parsed.data.message }] },
    },
    include: { messages: true },
  });

  await recordAuditLog({ actorId: user.id, action: "SUPPORT_TICKET_CREATED", resource: "SupportTicket", resourceId: ticket.id });

  await notifyAdminTelegram({
    event: "NEW_SUPPORT_TICKET",
    summary: `New ticket: ${ticket.subject}`,
    fields: { from: user.email },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
