"use client";

import { useState } from "react";
import { Shield, User, Check, X, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

interface UserRoleStatusControlsProps {
  userId: string;
  role: string;
  status: string;
  canManage: boolean;
}

const ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "SUPPORT", "MODERATOR"];
const STATUSES = ["ACTIVE", "PENDING", "SUSPENDED", "BANNED"];

export function UserRoleStatusControls({ 
  userId, 
  role, 
  status, 
  canManage 
}: UserRoleStatusControlsProps) {
  const supabase = createBrowserSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState(role);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (field: "role" | "status", value: string) => {
    if (!canManage) {
      setError("You don't have permission to manage users.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user metadata in Supabase
      const updates: any = {};
      if (field === "role") {
        updates.role = value;
        setCurrentRole(value);
      } else {
        updates.status = value;
        setCurrentStatus(value);
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { ...(await getCurrentUserMetadata()), ...updates } }
      );

      if (updateError) throw updateError;

      // Also update in your database via API
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update user");
    } catch (err: any) {
      setError(err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserMetadata = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata || {};
  };

  if (!canManage) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">Role: {currentRole}</span>
        <span className="text-xs text-muted">Status: {currentStatus}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {error && <span className="text-xs text-error">{error}</span>}
      
      <select
        value={currentRole}
        onChange={(e) => handleUpdate("role", e.target.value)}
        disabled={loading}
        className="text-xs rounded border border-border bg-bg px-2 py-1 outline-none focus:border-primaryBright"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={currentStatus}
        onChange={(e) => handleUpdate("status", e.target.value)}
        disabled={loading}
        className="text-xs rounded border border-border bg-bg px-2 py-1 outline-none focus:border-primaryBright"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {loading && <Loader2 className="w-3 h-3 animate-spin text-primaryBright" />}
      
      {error && (
        <span className="text-xs text-error">{error}</span>
      )}
    </div>
  );
}