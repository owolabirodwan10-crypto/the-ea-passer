import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";

const prisma = new PrismaClient();

// This seed intentionally creates only structural data (categories,
// permission keys) and one real Super Admin account from environment
// variables. It never inserts demo customers, demo sales, demo reviews,
// or fabricated performance numbers.

const CATEGORIES = [
  { name: "Forex Robots", slug: "forex-robots" },
  { name: "Forex EAs", slug: "forex-eas" },
  { name: "MT4 EAs", slug: "mt4-eas" },
  { name: "MT5 EAs", slug: "mt5-eas" },
  { name: "Gold EAs", slug: "gold-eas" },
  { name: "Scalping EAs", slug: "scalping-eas" },
  { name: "Prop Firm EAs", slug: "prop-firm-eas" },
  { name: "AI EAs", slug: "ai-eas" },
  { name: "Indicators", slug: "indicators" },
  { name: "Signals", slug: "signals" },
  { name: "VPS", slug: "vps" },
];

const PERMISSIONS = [
  "manage_users", "manage_products", "approve_products", "manage_developers",
  "manage_orders", "manage_payments", "manage_payouts", "manage_content",
  "manage_seo", "manage_scout", "manage_reviews", "manage_settings",
  "view_analytics", "manage_admins", "manage_support",
];

async function main() {
  for (const category of CATEGORIES) {
    await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key.replace(/_/g, " ") },
    });
  }

  const adminEmail = process.env.SEED_SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: "Super Admin",
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`Super admin ensured for ${adminEmail}`);
  } else {
    console.log(
      "Skipped creating a super admin. Set SEED_SUPER_ADMIN_EMAIL and " +
        "SEED_SUPER_ADMIN_PASSWORD in your environment and re-run db:seed."
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
