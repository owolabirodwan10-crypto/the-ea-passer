import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/server/auth/password";
import { createSession, isRateLimited } from "@/server/auth/session";
import { createPendingTwoFactorToken } from "@/server/auth/two-factor-token";
import { recordAuditLog } from "@/server/services/audit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const GENERIC_ERROR = "Incorrect email or password.";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? undefined;

  if (isRateLimited(`login:${ip}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always run a hash comparison, even for a nonexistent user, so response
  // timing does not reveal whether the email is registered.
  const passwordHash = user?.passwordHash ?? "$argon2id$v=19$m=19456,t=2,p=1$00000000000000000000$0000000000000000000000000000000000000000000000";
  const passwordOk = await verifyPassword(passwordHash, password);

  if (!user || !passwordOk) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (user.status === "SUSPENDED" || user.status === "BANNED") {
    return NextResponse.json({ error: "This account is not active. Contact support." }, { status: 403 });
  }
  if (user.status === "PENDING_VERIFICATION") {
    return NextResponse.json({ error: "Verify your email before signing in." }, { status: 403 });
  }

  if (user.twoFactorEnabled) {
    // Password verified, but a real session is not created until the
    // second factor is checked. This token proves the password step
    // already passed without granting access on its own.
    const pendingToken = await createPendingTwoFactorToken(user.id);
    await recordAuditLog({ actorId: user.id, action: "LOGIN_PASSWORD_STEP_OK", resource: "User", resourceId: user.id, ipAddress: ip, userAgent });
    return NextResponse.json({ requiresTwoFactor: true, pendingToken });
  }

  const { rawToken, expiresAt } = await createSession(user.id, ip, userAgent);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await recordAuditLog({ actorId: user.id, action: "USER_LOGIN", resource: "User", resourceId: user.id, ipAddress: ip, userAgent });

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
