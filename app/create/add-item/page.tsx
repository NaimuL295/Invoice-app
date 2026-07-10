"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { useInvoiceStore } from "@/app/store/useInvoiceStore";
import { toast } from "react-hot-toast"; // Fixed: Added correct import

const AddItemPage=()=> {
  const addItem = useInvoiceStore((state) => state.addItem);
  const router = useRouter();

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemName || !quantity || !unit || !price) {
      toast.error("Please fill all fields"); // Tip: react-hot-toast uses .error() instead of .warn()
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

    setItemName("");
    setQuantity("");
    setUnit("");
    setPrice("");

    router.push("/create");
  };

  const onAddUnit = () => {
    if (newUnit.trim() && !units.includes(newUnit)) {
      setUnits([...units, newUnit]);
      setUnit(newUnit);
      setNewUnit("");
      toast.success(`Unit "${newUnit}" added`); // Tip: react-hot-toast doesn't have .info(), using .success()
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex  justify-center p-4 md:p-6">
      <div className="bg-white rounded-[1.618rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-6 ">
          <header className="mb-6 md:mb-8">
            <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200">
              <Package size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add Item</h2>
            <p className="text-slate-500 text-sm mt-1">Add products or services to your bill.</p>
          </header>

          <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
            {/* Item Name */}
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2  focus:bg-white focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Quantity & Unit (Golden Split) */}
            <div className="flex gap-3">
              <div className="flex-[1.618] space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Qty
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2  focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="flex-1 space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2  focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {units.map((u, idx) => (
                    <option key={idx} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* New Unit Inline */}
            <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl items-center">
              <input
                type="text"
                placeholder="New unit..."
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={onAddUnit}
                className="bg-white border border-slate-200 text-slate-700 text-[10px] uppercase tracking-widest font-black px-3 py-2 rounded-lg shadow-sm hover:bg-green-50 hover:text-green-600 transition-all active:scale-95"
              >
                + Add
              </button>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Unit Price (৳)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2  focus:bg-white outline-none transition-all font-medium"
              />
            </div>

            {/* Total Display */}
            {total > 0 && (
              <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center text-white ring-4 ring-slate-50 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">
                    Line Subtotal
                  </span>
                  <span className="text-sm font-medium text-slate-200 italic">calculated</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-green-400">
                  ৳ {total.toLocaleString()}
                </span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-4  bg-black text-white rounded-xl font-bold text-lg  shadow-xl  active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2 mt-4"
            >
              <Plus size={20} strokeWidth={3} /> Save Item
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddItemPage