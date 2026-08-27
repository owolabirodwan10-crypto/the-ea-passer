import argon2 from "argon2";

// Argon2id with sane production parameters. Never store or log plaintext
// passwords anywhere, including in audit logs or Telegram notifications.
const HASH_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plaintext: string): Promise<string> {
  return argon2.hash(plaintext, HASH_OPTIONS);
}

export async function verifyPassword(hash: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    // Malformed hash or verification error. Fail closed.
    return false;
  }
}

const PASSWORD_MIN_LENGTH = 10;

export function isPasswordStrongEnough(plaintext: string): boolean {
  if (plaintext.length < PASSWORD_MIN_LENGTH) return false;
  const hasLetter = /[a-zA-Z]/.test(plaintext);
  const hasNumberOrSymbol = /[0-9\W]/.test(plaintext);
  return hasLetter && hasNumberOrSymbol;
}
