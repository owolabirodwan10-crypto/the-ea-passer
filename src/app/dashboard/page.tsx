import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, KeyRound, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [orderCount, licenseCount, downloadCount] = await Promise.all([
    prisma.order.count({ where: { customerId: user.id } }),
    prisma.license.count({ where: { customerId: user.id, status: "ACTIVE" } }),
    prisma.download.count({ where: { customerId: user.id } }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user.user_metadata?.name || "Trader"}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-brand-fluorescent-blue" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Orders</p>
              <p className="text-2xl font-bold">{orderCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-brand-fluorescent-blue" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Licenses</p>
              <p className="text-2xl font-bold">{licenseCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-brand-fluorescent-blue" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Downloads</p>
              <p className="text-2xl font-bold">{downloadCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/marketplace"
            className="px-4 py-2 bg-brand-fluorescent-blue text-brand-blue-charcoal rounded-lg hover:opacity-90 transition"
          >
            Browse Marketplace
          </Link>
          <Link
            href="/dashboard/licenses"
            className="px-4 py-2 border border-brand-fluorescent-blue text-brand-fluorescent-blue rounded-lg hover:bg-brand-fluorescent-blue/10 transition"
          >
            My Licenses
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 border border-brand-fluorescent-blue text-brand-fluorescent-blue rounded-lg hover:bg-brand-fluorescent-blue/10 transition"
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
}