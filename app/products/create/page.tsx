"use client";

import React, { useState, useTransition, useRef } from "react";
import { Tag, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { createProduct, updateProduct, deleteProduct, searchProducts } from "../../actions/products";

const CATEGORIES = ["Clothing", "Accessories", "Electronics", "Stationery", "Other"];

type Product = {
  id: number;
  item_name: string;
  category: string;
  unit: string;
  price: number;
};

export default function ProductPage({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState(CATEGORIES);
  const [unit, setUnit] = useState("Pieces (pcs)");
  const [price, setPrice] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearch = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const results = await searchProducts(value);
          setProducts(Array.isArray(results) ? results : []);
        } catch {
          toast.error("Search failed");
          setProducts([]);
        }
      });
    }, 300);
  };

  const onAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setCategory(newCategory);
      setNewCategory("");
      toast.success(`Category "${newCategory}" added`);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setItemName("");
    setCategory("");
    setUnit("Pieces (pcs)");
    setPrice("");
  };

  const onEdit = (p: Product) => {
    setEditingId(p.id);
    setItemName(p.item_name);
    setCategory(p.category);
    setUnit(p.unit);
    setPrice(String(p.price));
  };

  const onDelete = (id: number) => {
    if (!confirm("Delete this item?")) return;
    startTransition(async () => {
      try {
        await deleteProduct(id);
        setProducts((prev) => (prev ?? []).filter((p) => p.id !== id));
        if (editingId === id) resetForm();
        toast.success("Item deleted");
      } catch {
        toast.error("Delete failed");
      }
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemName || !category) {
      toast.error("Item name and category required");
      return;
    }

    startTransition(async () => {
      try {
        if (editingId !== null) {
          const updated = await updateProduct(editingId, {
            item_name: itemName,
            category,
            unit,
            price,
          });
          setProducts((prev) => (prev ?? []).map((p) => (p.id === updated.id ? updated : p)));
          toast.success("Item updated");
        } else {
          const created = await createProduct({ item_name: itemName, category, unit, price });
          setProducts((prev) => [...(prev ?? []), created]);
          toast.success("Item created");
        }
        resetForm();
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Form Card */}
        <div className="bg-white rounded-[1.618rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-6">
            <header className="mb-6 md:mb-8 flex items-center justify-between">
              <div>
                <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200">
                  <Tag size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {editingId ? "Edit Item" : "Create Item"}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {editingId ? "Update this product's details." : "Add a new product to your stock."}
                </p>
              </div>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              )}
            </header>

            <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cotton T-Shirt"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={onAddCategory}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Price (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-200 transition-all disabled:opacity-50"
              >
                {isPending ? "Saving..." : editingId ? "Update Item" : "Save Item"}
              </button>
            </form>
          </div>
        </div>

        {/* List Card */}
        <div className="bg-white rounded-[1.618rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Products</h3>

            {/* Search box */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all text-sm"
              />
            </div>

            {(products ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No products found.</p>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.item_name}</p>
                      <p className="text-xs text-slate-400">
                        {p.category} · {p.unit} · ৳{p.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}