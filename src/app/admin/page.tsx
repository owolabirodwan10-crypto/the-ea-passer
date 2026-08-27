import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  // Check if user is admin (either from Supabase metadata or Prisma)
  const role = user.user_metadata?.role || "CUSTOMER";
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // Fetch real stats from database
  const [
    totalUsers,
    totalProducts,
    pendingProducts,
    totalOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
  ]);

  const revenue = totalRevenue._sum.total || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user.user_metadata?.name || "Admin"}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-500">{pendingProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
          <p className="text-2xl font-bold text-green-500">${revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-brand-fluorescent-blue text-brand-blue-charcoal rounded-lg hover:opacity-90 transition"
          >
            Add Product
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-brand-fluorescent-blue text-brand-fluorescent-blue rounded-lg hover:bg-brand-fluorescent-blue/10 transition"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 border border-brand-fluorescent-blue text-brand-fluorescent-blue rounded-lg hover:bg-brand-fluorescent-blue/10 transition"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}