import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { notifyAdminTelegram } from "@/server/telegram/notify";
import { recordAuditLog } from "@/server/services/audit";

const applySchema = z.object({
  companyName: z.string().max(120).optional(),
  website: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const existingDeveloper = await prisma.developer.findUnique({ where: { userId: user.id } });
  if (existingDeveloper) {
    return NextResponse.json({ error: "You already have a developer account." }, { status: 409 });
  }

  const existingApplication = await prisma.developerApplication.findUnique({ where: { userId: user.id } });
  if (existingApplication && existingApplication.status !== "REJECTED") {
    return NextResponse.json({ error: "You already have an application in progress.", application: existingApplication }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const application = await prisma.developerApplication.upsert({
    where: { userId: user.id },
    update: { ...parsed.data, status: "SUBMITTED", reviewNotes: null, reviewedAt: null },
    create: { userId: user.id, ...parsed.data, status: "SUBMITTED" },
  });

  await recordAuditLog({ actorId: user.id, action: "DEVELOPER_APPLICATION_SUBMITTED", resource: "DeveloperApplication", resourceId: application.id });

  await notifyAdminTelegram({
    event: "NEW_DEVELOPER_APPLICATION",
    summary: `${user.name} applied to become a developer`,
    fields: { email: user.email, company: parsed.data.companyName ?? "not provided" },
  });

  return NextResponse.json({ application }, { status: 201 });
}
