import type { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Coarse role -> permission defaults. Individual users can also be granted
// extra UserPermission rows for exceptions without changing their role.
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "manage_users", "manage_products", "approve_products", "manage_developers",
    "manage_orders", "manage_content", "manage_seo", "manage_scout",
    "manage_reviews", "view_analytics", "manage_payouts", "manage_support",
  ],
  MARKETPLACE_MANAGER: ["manage_products", "approve_products", "manage_developers", "view_analytics"],
  SCOUT_MANAGER: ["manage_scout", "view_analytics"],
  CONTENT_MANAGER: ["manage_content", "manage_seo"],
  FINANCE: ["manage_payments", "manage_payouts", "view_analytics"],
  SUPPORT: ["manage_support"],
  MODERATOR: ["manage_reviews", "manage_products"],
  SEO_MANAGER: ["manage_seo"],
  DEVELOPER: [],
  CUSTOMER: [],
  AFFILIATE: [],
};

export async function userHasPermission(user: User, permissionKey: string): Promise<boolean> {
  const roleGrants = ROLE_PERMISSIONS[user.role] ?? [];
  if (roleGrants.includes("*") || roleGrants.includes(permissionKey)) return true;

  const grant = await prisma.userPermission.findFirst({
    where: { userId: user.id, permission: { key: permissionKey } },
  });
  return Boolean(grant);
}

/**
 * Throws if the user lacks the permission. Call this at the top of every
 * server action / API route that performs a privileged operation. Frontend
 * route guards are a UX convenience only, never the actual boundary.
 */
export async function requirePermission(user: User | null, permissionKey: string): Promise<User> {
  if (!user) throw new AuthError("UNAUTHENTICATED", "Sign in required.");
  const allowed = await userHasPermission(user, permissionKey);
  if (!allowed) throw new AuthError("FORBIDDEN", "You do not have permission to do this.");
  return user;
}

export class AuthError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.code = code;
  }
}
