import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { hashPassword, verifyPassword, isPasswordStrongEnough } from "@/server/auth/password";
import { revokeAllSessions } from "@/server/auth/session";
import { recordAuditLog } from "@/server/services/audit";

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(10).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const { name, currentPassword, newPassword } = parsed.data;
  const data: { name?: string; passwordHash?: string } = {};

  if (name) data.name = name;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Enter your current password to set a new one." }, { status: 400 });
    }
    const ok = await verifyPassword(user.passwordHash, currentPassword);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    if (!isPasswordStrongEnough(newPassword)) {
      return NextResponse.json({ error: "New password is too weak." }, { status: 400 });
    }
    data.passwordHash = await hashPassword(newPassword);
  }

  await prisma.user.update({ where: { id: user.id }, data });

  if (data.passwordHash) {
    await revokeAllSessions(user.id);
  }

  await recordAuditLog({ actorId: user.id, action: "PROFILE_UPDATED", resource: "User", resourceId: user.id });

  return NextResponse.json({ success: true, passwordChanged: Boolean(data.passwordHash) });
}
