import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { generateTotpSecret, buildOtpAuthUrl } from "@/server/auth/totp";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: "Two-factor authentication is already enabled." }, { status: 409 });
  }

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: user.id }, data: { pendingTwoFactorSecret: secret } });

  return NextResponse.json({
    secret,
    otpAuthUrl: buildOtpAuthUrl(secret, user.email),
  });
}
