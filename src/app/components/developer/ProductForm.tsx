"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
}

export interface ProductFormValues {
  name: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  platform: "MT4" | "MT5" | "BOTH" | "OTHER";
  price: number;
  strategy: string;
  requirements: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "UNRATED";
}

export function ProductForm({
  categories,
  mode,
  productId,
  initialValues,
}: {
  categories: Category[];
  mode: "create" | "edit";
  productId?: string;
  initialValues?: ProductFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initialValues ?? {
      name: "",
      categoryId: categories[0]?.id ?? "",
      shortDescription: "",
      description: "",
      platform: "MT4",
      price: 0,
      strategy: "",
      requirements: "",
      riskLevel: "UNRATED",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = mode === "create" ? "/api/developer/products" : `/api/developer/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, supportedMarkets: [] }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }

    if (mode === "create") {
      router.push(`/developer/products/${data.product.id}/edit`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-5">
      <Field label="EA name">
        <input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Platform">
          <select
            value={values.platform}
            onChange={(e) => set("platform", e.target.value as ProductFormValues["platform"])}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          >
            <option value="MT4">MT4</option>
            <option value="MT5">MT5</option>
            <option value="BOTH">MT4 and MT5</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Short description (shown on cards)">
        <input
          required
          maxLength={200}
          value={values.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </Field>

      <Field label="Full description">
        <textarea
          required
          rows={5}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </Field>

      <Field label="Strategy explanation (optional but recommended)">
        <textarea
          rows={3}
          value={values.strategy}
          onChange={(e) => set("strategy", e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Price (USD)">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          />
        </Field>
        <Field label="Risk level">
          <select
            value={values.riskLevel}
            onChange={(e) => set("riskLevel", e.target.value as ProductFormValues["riskLevel"])}
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          >
            <option value="UNRATED">Unrated</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </Field>
        <Field label="Requirements">
          <input
            value={values.requirements}
            onChange={(e) => set("requirements", e.target.value)}
            placeholder="e.g. min $500 balance"
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
          />
        </Field>
      </div>

      {error && <p className="text-[13px] text-error">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : mode === "create" ? "Create draft" : "Save changes"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
