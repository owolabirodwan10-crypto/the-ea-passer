import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { verifyPassword } from "@/server/auth/password";
import { recordAuditLog } from "@/server/services/audit";

const schema = z.object({ currentPassword: z.string().min(1) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your current password." }, { status: 400 });

  const ok = await verifyPassword(user.passwordHash, parsed.data.currentPassword);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, pendingTwoFactorSecret: null, twoFactorBackupCodes: [] },
  });

  await recordAuditLog({ actorId: user.id, action: "TWO_FACTOR_DISABLED", resource: "User", resourceId: user.id });

  return NextResponse.json({ success: true });
}
