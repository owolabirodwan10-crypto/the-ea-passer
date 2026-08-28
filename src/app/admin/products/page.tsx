"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Check,
  X,
  Star
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";

export default function AdminProductsPage() {
  const supabase = createBrowserSupabaseClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.shortDescription?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primaryBright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted mt-1">Manage all products in the marketplace.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedSoft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search products..."
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <Package className="w-12 h-12 mx-auto mb-3 text-mutedSoft" />
          <p className="text-muted">No products found.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-bg/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-mutedSoft" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted truncate max-w-xs">{product.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-gray text-xs">{product.category?.name || "Uncategorized"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {product.price ? `$${product.price}` : "Free"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${
                        product.status === "APPROVED" ? "badge-success" :
                        product.status === "PENDING_REVIEW" ? "badge-warning" :
                        "badge-gray"
                      }`}>
                        {product.status || "DRAFT"}
                      </span>
                      {product.featured && (
                        <span className="badge badge-featured text-xs">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleFeatured(product.id, product.featured)}
                        className={`p-1.5 rounded hover:bg-bg transition ${
                          product.featured ? "text-yellow-500" : "text-mutedSoft"
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <Link href={`/product/${product.slug}`} target="_blank" className="p-1.5 rounded hover:bg-bg transition text-mutedSoft hover:text-text">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded hover:bg-bg transition text-mutedSoft hover:text-text">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded hover:bg-bg transition text-mutedSoft hover:text-error">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}