import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { recordAuditLog } from "@/server/services/audit";

const updateSchema = z.object({
  name: z.string().min(3).max(120).optional(),
  categoryId: z.string().optional(),
  shortDescription: z.string().min(10).max(200).optional(),
  description: z.string().min(20).max(8000).optional(),
  platform: z.enum(["MT4", "MT5", "BOTH", "OTHER"]).optional(),
  price: z.number().min(0).max(100000).optional(),
  strategy: z.string().max(2000).optional(),
  requirements: z.string().max(1000).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "UNRATED"]).optional(),
  supportedMarkets: z.array(z.string()).optional(),
});

async function loadOwnedProduct(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { developer: true },
  });
  if (!product || product.developer.userId !== userId) return null;
  return product;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const product = await loadOwnedProduct(params.id, user.id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const product = await loadOwnedProduct(params.id, user.id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  if (!["DRAFT", "CHANGES_REQUESTED", "APPROVED"].includes(product.status)) {
    return NextResponse.json({ error: "This product cannot be edited while pending review." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const updated = await prisma.product.update({ where: { id: product.id }, data: parsed.data });

  await recordAuditLog({ actorId: user.id, action: "PRODUCT_UPDATED", resource: "Product", resourceId: product.id });

  return NextResponse.json({ product: updated });
}
