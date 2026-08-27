import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/server/auth/session";
import { requirePermission, AuthError } from "@/server/auth/rbac";
import { recordAuditLog } from "@/server/services/audit";
import { notifyAdminTelegram } from "@/server/telegram/notify";
import { sendEmail } from "@/server/email/provider";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionToken = cookies().get("eapaser_session")?.value;
    const actor = await getSessionUser(sessionToken);
    await requirePermission(actor, "approve_products");

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { developer: { include: { user: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    if (product.status !== "PENDING_REVIEW" && product.status !== "CHANGES_REQUESTED") {
      return NextResponse.json(
        { error: "Only products pending review can be approved." },
        { status: 409 }
      );
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    await recordAuditLog({
      actorId: actor!.id,
      action: "PRODUCT_APPROVED",
      resource: "Product",
      resourceId: product.id,
    });

    await sendEmail({
      to: product.developer.user.email,
      subject: `${product.name} is now live on EAPASER`,
      html: `<p>Your listing "${product.name}" has been approved and is now visible in the marketplace.</p>`,
    });

    await notifyAdminTelegram({
      event: "PRODUCT_APPROVED",
      summary: `${product.name} approved and published`,
      fields: { developer: product.developer.companyName ?? product.developer.user.name },
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    console.error("[product approve]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
