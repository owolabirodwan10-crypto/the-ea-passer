import { SignJWT, jwtVerify } from "jose";

const PENDING_2FA_TTL_SECONDS = 5 * 60;

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

/** Issued right after password verification when 2FA is required. Proves the
 * password step already passed, without creating a real session yet. */
export async function createPendingTwoFactorToken(userId: string): Promise<string> {
  return new SignJWT({ purpose: "2fa_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyPendingTwoFactorToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose !== "2fa_pending" || !payload.sub) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
