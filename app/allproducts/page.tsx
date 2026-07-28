"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Package, 
  Search, 
  Edit3, 
  Trash2, 
  Plus, 
  X, 
  Loader2, 
  Tag, 

} from "lucide-react";
import { toast } from "react-hot-toast";
import { Product } from "@/types/next-auth";
import { deleteProduct, getProducts, searchProducts, updateProduct } from "../actions/products";


export default function AllProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(true);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ item_name: "", category: "", unit: "", price: "" });
  const [units, setUnits] = useState(["Box", "Pieces (pcs)", "Kilogram (kg)", "Gram (g)", "Liter (l)", "Meter (m)"]);
  const [newUnit, setNewUnit] = useState("");

  // Delete Confirmation Modal State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch initial products
  useEffect(() => {
    async function loadInitial() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setIsFetching(false);
      }
    }
    loadInitial();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const results = await searchProducts(search);
          setProducts(results);
        } catch (error) {
          toast.error("Search failed");
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle Edit Submit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    startTransition(async () => {
      try {
        const updated = await updateProduct(editingProduct.id, {
          item_name: editForm.item_name,
          category: editForm.category,
          unit: editForm.unit,
          price: Number(editForm.price) || 0,
        });

        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Product updated successfully!");
        setEditingProduct(null);
      } catch (error) {
        toast.error("Failed to update product");
      }
    });
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Product deleted successfully!");
        setDeletingId(null);
      } catch (error) {
        toast.error("Failed to delete product");
      }
    });
  };

  // Open Edit Modal
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      item_name: product.item_name,
      category: product.category || "",
      unit: product.unit || "",
      price: String(product.price),
    });
  };

  // Add custom unit inside Edit modal
  const handleAddUnit = () => {
    if (newUnit.trim() && !units.includes(newUnit.trim())) {
      setUnits([...units, newUnit.trim()]);
      setEditForm({ ...editForm, unit: newUnit.trim() });
      setNewUnit("");
      toast.success(`Unit "${newUnit.trim()}" added`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white rounded-[1.618rem] p-4 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock & Products</h1>
              <p className="text-slate-500 text-sm">Manage, update, and search your available items.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:bg-white focus:border-green-500 outline-none transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid / Table Container */}
        <div className="bg-white rounded-[1.618rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {isFetching ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-green-500" />
              <p className="text-sm">Loading stock inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Package size={36} className="mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No products found</p>
              <p className="text-xs">Try adjusting your search query or add a new item.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Product Details</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Unit</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {p.item_name}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {p.category ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">
                            <Tag size={12} /> {p.category}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {p.unit || "—"}
                      </td>
                      <td className="py-4 px-6 font-bold text-green-600">
                        ৳{Number(p.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingId(p.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
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
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.618rem] max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</label>
                <input
                  type="text"
                  required
                  value={editForm.item_name}
                  onChange={(e) => setEditForm({ ...editForm, item_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Unit Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit</label>
                <select
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">Select Unit</option>
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Custom Unit Option */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom unit"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUnit}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-green-200 flex items-center gap-2"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.618rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">This action cannot be undone from your database.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}