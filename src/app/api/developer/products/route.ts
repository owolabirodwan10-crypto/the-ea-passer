import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { recordAuditLog } from "@/server/services/audit";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

const createSchema = z.object({
  name: z.string().min(3).max(120),
  categoryId: z.string(),
  shortDescription: z.string().min(10).max(200),
  description: z.string().min(20).max(8000),
  platform: z.enum(["MT4", "MT5", "BOTH", "OTHER"]),
  price: z.number().min(0).max(100000),
  currency: z.string().default("USD"),
  strategy: z.string().max(2000).optional(),
  requirements: z.string().max(1000).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "UNRATED"]).default("UNRATED"),
  supportedMarkets: z.array(z.string()).default([]),
});

async function requireDeveloper(userId: string) {
  return prisma.developer.findUnique({ where: { userId } });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const developer = await requireDeveloper(user.id);
  if (!developer) return NextResponse.json({ error: "You do not have a developer account yet." }, { status: 403 });

  const products = await prisma.product.findMany({
    where: { developerId: developer.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const developer = await requireDeveloper(user.id);
  if (!developer) return NextResponse.json({ error: "You do not have a developer account yet." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input.", details: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug: slugify(parsed.data.name),
      type: "EA",
      developerId: developer.id,
      status: "DRAFT",
    },
  });

  await recordAuditLog({ actorId: user.id, action: "PRODUCT_CREATED", resource: "Product", resourceId: product.id });

  return NextResponse.json({ product }, { status: 201 });
}
