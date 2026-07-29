"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, Search, X, Loader2 } from "lucide-react";
import { useInvoiceStore } from "@/app/store/useInvoiceStore";
import { toast } from "react-hot-toast";


import { searchProducts } from "@/app/actions/products";
import { Product } from "@/types/next-auth";

export default function AddItemPage() {
  const addItem = useInvoiceStore((state) => state.addItem);
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [units, setUnits] = useState([
    "Box",
    "Pieces (pcs)",
    "Kilogram (kg)",
    "Gram (g)",
    "Liter (l)",
    "Meter (m)",
  ]);
  const [newUnit, setNewUnit] = useState("");

  const total = (Number(quantity) || 0) * (Number(price) || 0);

  // Debounced real-time server action search
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const results = await searchProducts(search);
          setSearchResults(results);
        } catch (error) {
          console.error("Failed to search products:", error);
          toast.error("Failed to fetch products");
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSelectStock = (item: Product) => {
    setItemName(item.item_name);
    setUnit(item.unit || "");
    setPrice(String(item.price));
    setCategory(item.category || "");
    setSearch(item.item_name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setItemName("");
    setUnit("");
    setPrice("");
    setCategory("");
    setSearch("");
    setSearchResults([]);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemName || !quantity || !unit || !price) {
      toast.error("Please fill all fields");
      return;
    }

    addItem({
      id: Date.now(),
      item_name: itemName,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      total,
    });

    toast.success("Item added successfully!");
    clearSelection();
    setQuantity("");
    router.push("/create");
  };

  const onAddUnit = () => {
    if (newUnit.trim() && !units.includes(newUnit)) {
      setUnits([...units, newUnit]);
      setUnit(newUnit);
      setNewUnit("");
      toast.success(`Unit "${newUnit}" added`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-4 md:p-6">
      <div className="bg-white rounded-[1.618rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full max-w-xl">
        <div className="p-6">
          <header className="mb-6 md:mb-8">
            <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200">
              <Package size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add Item</h2>
            <p className="text-slate-500 text-sm mt-1">Add products or services to your bill.</p>
          </header>

          <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
            {/* Searchable Stock Select via Prisma Action */}
            <div className="space-y-1.5 relative" ref={wrapperRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Search Stock
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type product name or category..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Server Results Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {isPending ? (
                    <div className="px-4 py-4 text-sm text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-green-500" />
                      <span>Searching database...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => onSelectStock(s)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex justify-between items-center border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">{s.item_name}</p>
                          {s.category && (
                            <p className="text-[11px] text-slate-400">{s.category}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold ">
                          ৳{s.price}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-400">
                      No matching products — will be added as a custom item
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Item Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Item Description
              </label>
              <input
                type="text"
                placeholder="Item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white focus:border-transparent outline-none transition-all"
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
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Unit Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white outline-none transition-all cursor-pointer"
              >
                <option value="" disabled>Select unit</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Custom Unit */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom unit"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={onAddUnit}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {/* Total Display */}
            <div className="pt-2 flex justify-between items-center text-slate-700 font-semibold">
              <span>Total:</span>
              <span className="text-lg ">৳{total.toFixed(2)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-200 transition-all"
            >
              Add to Invoice
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}