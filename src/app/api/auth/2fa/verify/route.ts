import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPendingTwoFactorToken } from "@/server/auth/two-factor-token";
import { verifyTotpToken, hashBackupCode } from "@/server/auth/totp";
import { createSession, isRateLimited } from "@/server/auth/session";
import { recordAuditLog } from "@/server/services/audit";

const schema = z.object({
  pendingToken: z.string(),
  code: z.string().min(6).max(12),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? undefined;

  if (isRateLimited(`2fa:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const userId = await verifyPendingTwoFactorToken(parsed.data.pendingToken);
  if (!userId) {
    return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "Two-factor authentication is not set up on this account." }, { status: 400 });
  }

  const code = parsed.data.code.trim();
  const isTotpValid = verifyTotpToken(user.twoFactorSecret, code);

  let usedBackupCode = false;
  if (!isTotpValid) {
    const hashed = hashBackupCode(code);
    usedBackupCode = user.twoFactorBackupCodes.includes(hashed);
    if (usedBackupCode) {
      // Backup codes are single use; remove it once consumed.
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorBackupCodes: user.twoFactorBackupCodes.filter((c) => c !== hashed) },
      });
    }
  }

  if (!isTotpValid && !usedBackupCode) {
    await recordAuditLog({ actorId: user.id, action: "LOGIN_2FA_FAILED", resource: "User", resourceId: user.id, ipAddress: ip });
    return NextResponse.json({ error: "Incorrect code." }, { status: 401 });
  }

  const { rawToken, expiresAt } = await createSession(user.id, ip, userAgent);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await recordAuditLog({
    actorId: user.id,
    action: usedBackupCode ? "LOGIN_2FA_BACKUP_CODE_USED" : "LOGIN_2FA_OK",
    resource: "User",
    resourceId: user.id,
    ipAddress: ip,
    userAgent,
  });

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    backupCodeUsed: usedBackupCode,
  });

  response.cookies.set("eapaser_session", rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
