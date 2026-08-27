import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { requirePermission, AuthError } from "@/server/auth/rbac";
import { recordAuditLog } from "@/server/services/audit";
import { sendEmail } from "@/server/email/provider";

const bodySchema = z.object({
  notes: z.string().min(3).max(1000),
  requestChanges: z.boolean().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actor = await getCurrentUser();
    await requirePermission(actor, "approve_products");

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Provide review notes." }, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { developer: { include: { user: true } } },
    });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    if (product.status !== "PENDING_REVIEW") {
      return NextResponse.json({ error: "Only products pending review can be actioned here." }, { status: 409 });
    }

    const newStatus = parsed.data.requestChanges ? "CHANGES_REQUESTED" : "REJECTED";

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { status: newStatus, reviewNotes: parsed.data.notes },
    });

    await recordAuditLog({
      actorId: actor!.id,
      action: newStatus === "REJECTED" ? "PRODUCT_REJECTED" : "PRODUCT_CHANGES_REQUESTED",
      resource: "Product",
      resourceId: product.id,
      metadata: { notes: parsed.data.notes },
    });

    await sendEmail({
      to: product.developer.user.email,
      subject: `Update on "${product.name}"`,
      html: `<p>${newStatus === "REJECTED" ? "Your listing was not approved." : "Changes were requested on your listing."}</p><p>${parsed.data.notes}</p>`,
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    console.error("[product reject]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
