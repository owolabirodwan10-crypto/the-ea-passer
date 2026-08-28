"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`/admin/users${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-sm">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedSoft" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full rounded-lg border border-border bg-surface py-2 pl-8 pr-3 text-[13px] outline-none placeholder:text-mutedSoft focus:border-primary/50"
      />
    </form>
  );
}