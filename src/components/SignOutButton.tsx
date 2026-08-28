"use client";

import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export function SignOutButton() {
  const supabase = createBrowserSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted hover:text-error hover:bg-bg transition w-full"
    >
      <LogOut className="w-5 h-5" />
      Sign Out
    </button>
  );
}