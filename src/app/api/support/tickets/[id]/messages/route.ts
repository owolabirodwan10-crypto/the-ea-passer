import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { userHasPermission } from "@/server/auth/rbac";

const messageSchema = z.object({ content: z.string().min(1).max(4000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  const isOwner = ticket.customerId === user.id;
  const isStaff = await userHasPermission(user, "manage_support");
  if (!isOwner && !isStaff) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const parsed = messageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const message = await prisma.ticketMessage.create({
    data: { ticketId: ticket.id, authorId: user.id, content: parsed.data.content, internal: false },
  });

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: isStaff ? "WAITING" : "IN_PROGRESS", updatedAt: new Date() },
  });

  return NextResponse.json({ message }, { status: 201 });
}
