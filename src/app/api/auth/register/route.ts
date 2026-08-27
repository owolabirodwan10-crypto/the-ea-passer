import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordStrongEnough } from "@/server/auth/password";
import { isRateLimited } from "@/server/auth/session";
import { recordAuditLog } from "@/server/services/audit";
import { notifyAdminTelegram } from "@/server/telegram/notify";
import { sendEmail } from "@/server/email/provider";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`register:${ip}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json(
      { error: "Password must be at least 10 characters and include a letter and a number or symbol." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Do not reveal whether the account exists; respond identically either way.
    return NextResponse.json(
      { message: "If this email can be registered, a verification email has been sent." },
      { status: 200 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "CUSTOMER", status: "PENDING_VERIFICATION" },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      purpose: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${rawToken}`;

  await sendEmail({
    to: email,
    subject: "Verify your EAPASER account",
    html: `<p>Confirm your email to finish creating your account.</p><p><a href="${verifyUrl}">Verify email</a></p>`,
  });

  await recordAuditLog({
    actorId: user.id,
    action: "USER_REGISTERED",
    resource: "User",
    resourceId: user.id,
    ipAddress: ip,
  });

  await notifyAdminTelegram({
    event: "NEW_USER",
    summary: `New account registered: ${name}`,
    fields: { email },
  });

  return NextResponse.json(
    { message: "If this email can be registered, a verification email has been sent." },
    { status: 200 }
  );
}
