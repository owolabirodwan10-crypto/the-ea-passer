import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { userHasPermission } from "@/server/auth/rbac";
import { EmptyState } from "@/components/ui/Primitives";
import { UserRoleStatusControls } from "./UserRoleStatusControls";
import { SearchBox } from "./SearchBox";

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const actor = (await getCurrentUser())!;
  const canManage = await userHasPermission(actor, "manage_admins");

  const q = searchParams.q?.trim();
  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Users</h1>
      <p className="mb-6 text-sm text-muted">
        {canManage ? "Search and manage every account on the platform." : "You can view accounts. Role and status changes require Super Admin."}
      </p>

      <SearchBox initialQuery={q ?? ""} />

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try a different search term." />
      ) : (
        <div className="mt-6 divide-y divide-borderSoft rounded-card border border-border bg-surface">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="text-[13.5px] font-medium">{u.name}</div>
                <div className="text-xs text-mutedSoft">{u.email}</div>
              </div>
              <UserRoleStatusControls userId={u.id} role={u.role} status={u.status} canManage={canManage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
