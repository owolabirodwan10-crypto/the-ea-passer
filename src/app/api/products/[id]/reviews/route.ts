import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(120),
  content: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  // Only customers with an active license (a real purchase) may review.
  const license = await prisma.license.findFirst({
    where: { productId: params.id, customerId: user.id, status: "ACTIVE" },
  });
  if (!license) {
    return NextResponse.json({ error: "Only verified purchasers can review this product." }, { status: 403 });
  }

  const existing = await prisma.review.findUnique({
    where: { customerId_productId: { customerId: user.id, productId: params.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      ...parsed.data,
      customerId: user.id,
      productId: params.id,
      verifiedPurchase: true,
      status: "PENDING",
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({
    where: { productId: params.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });
  return NextResponse.json({ reviews });
}
