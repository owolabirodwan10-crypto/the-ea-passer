"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    categoryId: initialData?.categoryId || "",
    platform: initialData?.platform || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/developer/products/${initialData.id}` : "/api/developer/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save product");

      router.push("/developer/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Product Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primaryBright"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Short Description *</label>
        <input
          type="text"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primaryBright"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Full Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primaryBright"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primaryBright"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Platform</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primaryBright"
          >
            <option value="">Select Platform</option>
            <option value="MT4">MT4</option>
            <option value="MT5">MT5</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primaryBright"
        >
          <option value="">Select Category</option>
          <option value="Forex EA">Forex EA</option>
          <option value="Gold EA">Gold EA</option>
          <option value="MT4 EA">MT4 EA</option>
          <option value="MT5 EA">MT5 EA</option>
          <option value="Prop Firm EA">Prop Firm EA</option>
          <option value="Scalping EA">Scalping EA</option>
          <option value="AI EA">AI EA</option>
        </select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/developer/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}