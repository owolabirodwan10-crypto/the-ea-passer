import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { requirePermission, AuthError } from "@/server/auth/rbac";
import { recordAuditLog } from "@/server/services/audit";
import { revokeAllSessions } from "@/server/auth/session";

export async function GET(req: NextRequest) {
  try {
    const actor = await getCurrentUser();
    await requirePermission(actor, "manage_users");

    const q = req.nextUrl.searchParams.get("q")?.trim();

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, name: true, email: true, role: true, status: true,
        createdAt: true, lastLoginAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    console.error("[admin users list]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

const updateSchema = z.object({
  userId: z.string(),
  role: z.enum([
    "SUPER_ADMIN", "ADMIN", "MARKETPLACE_MANAGER", "SCOUT_MANAGER", "CONTENT_MANAGER",
    "FINANCE", "SUPPORT", "MODERATOR", "SEO_MANAGER", "DEVELOPER", "CUSTOMER", "AFFILIATE",
  ]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "BANNED"]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const actor = await getCurrentUser();
    await requirePermission(actor, "manage_admins");

    const parsed = updateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    if (parsed.data.userId === actor!.id) {
      return NextResponse.json({ error: "You cannot change your own role or status here." }, { status: 400 });
    }

    const { userId, ...data } = parsed.data;
    const updated = await prisma.user.update({ where: { id: userId }, data });

    if (data.status === "SUSPENDED" || data.status === "BANNED") {
      await revokeAllSessions(userId);
    }

    await recordAuditLog({
      actorId: actor!.id,
      action: "USER_UPDATED_BY_ADMIN",
      resource: "User",
      resourceId: userId,
      metadata: data,
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    console.error("[admin users update]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
