import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { recordAuditLog } from "@/server/services/audit";
import { notifyAdminTelegram } from "@/server/telegram/notify";

const REQUIRED_FIELDS = ["name", "shortDescription", "description", "price", "categoryId"] as const;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { developer: true },
  });
  if (!product || product.developer.userId !== user.id) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  if (product.status !== "DRAFT" && product.status !== "CHANGES_REQUESTED") {
    return NextResponse.json({ error: "Only draft products can be submitted for review." }, { status: 409 });
  }

  const missing = REQUIRED_FIELDS.filter((field) => {
    const value = (product as unknown as Record<string, unknown>)[field];
    return value === null || value === undefined || value === "";
  });
  if (missing.length > 0) {
    return NextResponse.json({ error: `Complete these fields before submitting: ${missing.join(", ")}` }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { status: "PENDING_REVIEW", submittedAt: new Date() },
  });

  await recordAuditLog({ actorId: user.id, action: "PRODUCT_SUBMITTED_FOR_REVIEW", resource: "Product", resourceId: product.id });

  await notifyAdminTelegram({
    event: "NEW_PRODUCT_SUBMISSION",
    summary: `${product.name} submitted for review`,
    fields: { developer: user.name },
  });

  return NextResponse.json({ product: updated });
}
