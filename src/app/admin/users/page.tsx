"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Search, Shield, User as UserIcon } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { UserRoleStatusControls } from "./UserRoleStatusControls";
import { SearchBox } from "./SearchBox";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserSupabaseClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const q = searchParams.get("q") || "";

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?next=/admin/users");
        return;
      }

      const role = user.user_metadata?.role || "CUSTOMER";
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      // Check if user has manage_admins permission
      setCanManage(role === "SUPER_ADMIN");
      fetchUsers(q);
    };

    checkAuthAndFetch();
  }, [router, supabase, q]);

  const fetchUsers = async (searchQuery: string) => {
    try {
      const url = searchQuery 
        ? `/api/admin/users?q=${encodeURIComponent(searchQuery)}`
        : "/api/admin/users";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primaryBright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
          <p className="text-muted">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Users</h1>
      <p className="mb-6 text-sm text-muted">
        {canManage 
          ? "Search and manage every account on the platform." 
          : "You can view accounts. Role and status changes require Super Admin."}
      </p>

      <SearchBox initialQuery={q} />

      {users.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <Users className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
          <p className="text-muted">No users found</p>
          <p className="text-xs text-mutedSoft mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-borderSoft rounded-card border border-border bg-surface">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="text-[13.5px] font-medium">{u.name || "Unnamed"}</div>
                <div className="text-xs text-mutedSoft">{u.email}</div>
              </div>
              <UserRoleStatusControls 
                userId={u.id} 
                role={u.role} 
                status={u.status} 
                canManage={canManage} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}