import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";

const createOrderSchema = z.object({
  productId: z.string(),
  couponCode: z.string().optional(),
});

function generateOrderNumber() {
  return `EAP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || product.status !== "APPROVED") {
    return NextResponse.json({ error: "This product is not available for purchase." }, { status: 404 });
  }

  const existingLicense = await prisma.license.findFirst({
    where: { productId: product.id, customerId: user.id, status: "ACTIVE" },
  });
  if (existingLicense) {
    return NextResponse.json({ error: "You already own this product." }, { status: 409 });
  }

  let discount = 0;
  let couponId: string | undefined;

  if (parsed.data.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.couponCode } });
    const validForProduct = !coupon?.productId || coupon.productId === product.id;
    const notExpired = !coupon?.expiresAt || coupon.expiresAt > new Date();
    const underLimit = !coupon?.usageLimit || coupon.usageCount < coupon.usageLimit;

    if (coupon && coupon.active && validForProduct && notExpired && underLimit) {
      couponId = coupon.id;
      discount =
        coupon.type === "PERCENTAGE"
          ? (Number(product.price) * Number(coupon.amount)) / 100
          : Number(coupon.amount);
    }
  }

  const subtotal = Number(product.price);
  const total = Math.max(0, subtotal - discount);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerId: user.id,
      subtotal,
      discount,
      total,
      currency: product.currency,
      status: "PENDING",
      couponId,
      items: { create: [{ productId: product.id, unitPrice: subtotal, quantity: 1 }] },
    },
    include: { items: true },
  });

  return NextResponse.json({ order }, { status: 201 });
}
