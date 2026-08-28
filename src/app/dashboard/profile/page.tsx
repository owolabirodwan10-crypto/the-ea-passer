"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/dashboard/profile");
        return;
      }
      setUser(user);
      setName(user.user_metadata?.name || "");
      setEmail(user.email || "");
      setLoading(false);
    };
    getUser();
  }, [router, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update logic here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primaryBright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Profile</h1>
      <p className="mb-8 text-sm text-muted">Manage your account details and security.</p>

      <div className="max-w-md space-y-6">
        <div className="bg-surface rounded-card border border-border p-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Email</label>
              <div className="rounded-lg border border-borderSoft bg-bg/40 px-3.5 py-2.5 text-sm text-mutedSoft">
                {email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none focus:border-primaryBright"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primaryBright text-bg rounded-lg hover:opacity-90 transition"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}