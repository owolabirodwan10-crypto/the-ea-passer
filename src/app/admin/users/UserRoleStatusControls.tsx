"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  "SUPER_ADMIN", "ADMIN", "MARKETPLACE_MANAGER", "SCOUT_MANAGER", "CONTENT_MANAGER",
  "FINANCE", "SUPPORT", "MODERATOR", "SEO_MANAGER", "DEVELOPER", "CUSTOMER", "AFFILIATE",
];
const STATUSES = ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "BANNED"];

export function UserRoleStatusControls({
  userId,
  role,
  status,
  canManage,
}: {
  userId: string;
  role: string;
  status: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(field: "role" | "status", value: string) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, [field]: value }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not update.");
      return;
    }
    router.refresh();
  }

  if (!canManage) {
    return <span className="text-[12px] text-mutedSoft">{role.replace(/_/g, " ")} · {status.replace(/_/g, " ")}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={role}
        disabled={loading}
        onChange={(e) => update("role", e.target.value)}
        className="rounded-md border border-border bg-bg px-2 py-1.5 text-[12px] outline-none focus:border-primary/50"
      >
        {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
      </select>
      <select
        defaultValue={status}
        disabled={loading}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-md border border-border bg-bg px-2 py-1.5 text-[12px] outline-none focus:border-primary/50"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
      </select>
      {error && <span className="text-[11px] text-error">{error}</span>}
    </div>
  );
}
