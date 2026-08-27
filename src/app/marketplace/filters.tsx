"use client";

import type React from "react";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

interface Category {
  slug: string;
  name: string;
}

// Add this interface to match searchParams
interface MarketplaceSearchParams {
  q?: string;
  category?: string;
  platform?: string;
  risk?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

const PLATFORMS = ["MT4", "MT5", "BOTH", "OTHER"];
const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "UNRATED"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function MarketplaceFilters({
  categories,
  searchParams,
}: {
  categories: Category[];
  searchParams: MarketplaceSearchParams; // Changed from Record type
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.q ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams();
    
    // Build params from searchParams
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && k !== key) {
        params.set(k, v);
      }
    });
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <aside className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", query || null);
        }}
        className="relative"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedSoft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search EAs, developers..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-mutedSoft focus:border-primary/50"
        />
      </form>

      <FilterGroup title="Category">
        <FilterOption
          label="All categories"
          active={!searchParams.category}
          onClick={() => updateParam("category", null)}
        />
        {categories.map((c) => (
          <FilterOption
            key={c.slug}
            label={c.name}
            active={searchParams.category === c.slug}
            onClick={() => updateParam("category", c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Platform">
        <FilterOption label="Any platform" active={!searchParams.platform} onClick={() => updateParam("platform", null)} />
        {PLATFORMS.map((p) => (
          <FilterOption key={p} label={p} active={searchParams.platform === p} onClick={() => updateParam("platform", p)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Risk level">
        <FilterOption label="Any risk" active={!searchParams.risk} onClick={() => updateParam("risk", null)} />
        {RISK_LEVELS.map((r) => (
          <FilterOption key={r} label={r} active={searchParams.risk === r} onClick={() => updateParam("risk", r)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Sort by">
        {SORT_OPTIONS.map((s) => (
          <FilterOption
            key={s.value}
            label={s.label}
            active={(searchParams.sort ?? "newest") === s.value}
            onClick={() => updateParam("sort", s.value)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-mutedSoft">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
        active ? "bg-primary/10 text-primaryBright" : "text-muted hover:bg-surface2 hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}