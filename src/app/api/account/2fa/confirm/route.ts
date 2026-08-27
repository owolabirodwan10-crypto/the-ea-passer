import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { verifyTotpToken, generateBackupCodes, hashBackupCode } from "@/server/auth/totp";
import { recordAuditLog } from "@/server/services/audit";

const schema = z.object({ code: z.string().min(6).max(6) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (!user.pendingTwoFactorSecret) {
    return NextResponse.json({ error: "Start enrollment first." }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });

  const valid = verifyTotpToken(user.pendingTwoFactorSecret, parsed.data.code);
  if (!valid) return NextResponse.json({ error: "Incorrect code. Check the time on your device and try again." }, { status: 401 });

  const backupCodes = generateBackupCodes();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: user.pendingTwoFactorSecret,
      pendingTwoFactorSecret: null,
      twoFactorBackupCodes: backupCodes.map(hashBackupCode),
    },
  });

  await recordAuditLog({ actorId: user.id, action: "TWO_FACTOR_ENABLED", resource: "User", resourceId: user.id });

  // Backup codes are shown once, in plaintext, right here. They are never
  // retrievable again after this response, only hashed values are stored.
  return NextResponse.json({ backupCodes });
}
