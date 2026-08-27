import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { requirePermission, AuthError } from "@/server/auth/rbac";
import { recordAuditLog } from "@/server/services/audit";
import { notifyAdminTelegram } from "@/server/telegram/notify";

const schema = z.object({
  status: z.enum(["APPROVED", "PROCESSING", "PAID", "REJECTED"]),
  paymentRef: z.string().optional(),
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["PROCESSING", "REJECTED"],
  PROCESSING: ["PAID", "REJECTED"],
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actor = await getCurrentUser();
    await requirePermission(actor, "manage_payouts");

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      include: { developer: { include: { user: true } } },
    });
    if (!payout) return NextResponse.json({ error: "Payout not found." }, { status: 404 });

    const allowedNext = VALID_TRANSITIONS[payout.status] ?? [];
    if (!allowedNext.includes(parsed.data.status)) {
      return NextResponse.json(
        { error: `Cannot move a payout from ${payout.status} to ${parsed.data.status}.` },
        { status: 409 }
      );
    }

    const updated = await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: parsed.data.status,
        paymentRef: parsed.data.paymentRef,
        processedAt: parsed.data.status === "PAID" ? new Date() : payout.processedAt,
      },
    });

    await recordAuditLog({
      actorId: actor!.id,
      action: "PAYOUT_STATUS_UPDATED",
      resource: "Payout",
      resourceId: payout.id,
      metadata: { from: payout.status, to: parsed.data.status },
    });

    if (parsed.data.status === "PAID") {
      await notifyAdminTelegram({
        event: "PAYOUT_REQUESTED",
        summary: `Payout marked paid for ${payout.developer?.user.name ?? "developer"}`,
        fields: { amount: `$${Number(payout.netAmount).toFixed(2)}` },
      });
    }

    return NextResponse.json({ payout: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    console.error("[admin payout update]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
