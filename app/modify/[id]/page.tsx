"use client";

import { useState, useEffect, use, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Package, Plus, X, Search, Loader2 } from "lucide-react";

import { useInvoiceStore } from "@/app/store/useInvoiceStore";
import { getInvoiceId, modifyInvoice } from "@/app/actions/invoiceActions";
import { searchProducts } from "@/app/actions/products";
import { Product } from "@/types/next-auth";
import InvoiceItems from "@/app/components/Invoice_Items";

type InvoiceResponse = NonNullable<Awaited<ReturnType<typeof getInvoiceId>>>;

interface FormState {
  date: string;
  customer: string;
  discount: number | "";
  received: number | "";
  paymentType: string;
  description: string;
  uid: string;
}

const initialFormState: FormState = {
  date: "",
  customer: "",
  discount: 0,
  received: 0,
  paymentType: "Cash",
  description: "",
  uid: "",
};

export default function ModifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { items, setItems, clearItems, addItem } = useInvoiceStore();

  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formState, setFormState] = useState<FormState>(initialFormState);

  // Add Item Modal State
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  // Stock search state
  const [isPending, startTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [units, setUnits] = useState([
    "Box",
    "Pieces (pcs)",
    "Kilogram (kg)",
    "Gram (g)",
    "Liter (l)",
    "Meter (m)",
  ]);
  const [newUnit, setNewUnit] = useState("");

  const updateForm = useCallback((updates: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchInvoice() {
      try {
        const data = await getInvoiceId(Number(id));

        if (cancelled) return;

        setInvoice(data);

        const itemsWithTotal = (data.items || []).map((item) => ({
          id: item.id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit ?? "",
          price: item.price,
          total: item.quantity * item.price,
        }));
        setItems(itemsWithTotal);

        const calculatedSubtotal = itemsWithTotal.reduce((acc, item) => acc + item.total, 0);
        // Calculate initial percentage value from stored flat discount amount
        const initialDiscountPercent =
          calculatedSubtotal > 0 && data.discount
            ? Math.round(((Number(data.discount) / calculatedSubtotal) * 100) * 100) / 100
            : 0;

        setFormState({
          date:
            data.date && !isNaN(new Date(data.date).getTime())
              ? new Date(data.date).toISOString().split("T")[0]
              : "",
          customer: data.customer || "",
          discount: initialDiscountPercent,
          received: data.received || 0,
          paymentType: data.paymentType || "Cash",
          description: data.description || "",
          uid: data.uid || "",
        });
      } catch (error) {
        if (cancelled) return;
        toast.error("Failed to load invoice");
        console.error(error);
        router.push("/");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInvoice();

    return () => {
      cancelled = true;
      clearItems();
    };
  }, [id, router, setItems, clearItems]);

  // Debounced product search
  useEffect(() => {
    if (!showAddModal) return;

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
  }, [search, showAddModal]);

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

  const { date, customer, discount, received, paymentType, description, uid } = formState;

  // Percentage-only calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const discountAmount = (subtotal * Number(discount || 0)) / 100;
  const cappedDiscount = Math.min(discountAmount, subtotal);
  const total = subtotal - cappedDiscount;
  const balance = total - Number(received || 0);
  const itemTotal = (Number(quantity) || 0) * (Number(price) || 0);

  const onAddItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      total: itemTotal,
    });

    toast.success("Item added successfully!");
    clearSelection();
    setQuantity("");
    setShowAddModal(false);
  };

  const onAddUnit = () => {
    if (newUnit.trim() && !units.includes(newUnit)) {
      setUnits((prev) => [...prev, newUnit]);
      setUnit(newUnit);
      toast.success(`Unit "${newUnit}" added`);
      setNewUnit("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (!customer || items.length === 0) {
      toast.error("Customer and items are required");
      return;
    }

    const invoiceData = {
      uid: String(uid),
      date,
      customer,
      items,
      subtotal,
      discount: cappedDiscount, // Flat calculated amount sent to server
      total,
      received: Number(received || 0),
      due: balance,
      description,
      paymentType,
    };

    const loadingToast = toast.loading("Updating...");

    try {
      await modifyInvoice(invoice.id, invoiceData);
      toast.success("Updated!", { id: loadingToast });
      clearItems();
      router.push("/");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        { id: loadingToast }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <p className="text-gray-500 text-lg">Invoice not found</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl lg:mx-auto p-3 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        >
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <section className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Invoice No
                </label>
                <input
                  type="text"
                  value={uid}
                  readOnly
                  className="w-full bg-transparent font-bold outline-none text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => updateForm({ date: e.target.value })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </section>

            <div className="relative">
              <input
                type="text"
                value={customer}
                onChange={(e) => updateForm({ customer: e.target.value })}
                required
                className="peer w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none transition-colors"
                placeholder=" "
              />
              <label className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                Customer Name
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold">Items</h3>
                <span className="text-xs text-gray-500">
                  {items.length} items added
                </span>
              </div>

              <InvoiceItems />

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="block w-full py-2 border-2 border-dashed border-gray-300 text-center rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
              >
                + Add More Items
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-2xl h-fit sticky top-4">
            <h3 className="font-semibold text-lg">Summary & Payment</h3>

            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount (%)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      updateForm({
                        discount: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                    className="w-20 border-b border-gray-300 bg-transparent text-right outline-none focus:border-black font-medium"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Discount Amount Preview */}
              {cappedDiscount > 0 && (
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>Discount Applied</span>
                  <span>- ৳{cappedDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Amount</span>
                <span className="text-xl font-bold text-yellow-500 drop-shadow-md">
                  ৳{total.toLocaleString()}
                </span>
              </div>

              <label className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${
                    Number(received) > 0
                      ? "bg-yellow-400 border-yellow-500"
                      : "border-gray-300"
                  }`}
                ></div>
                <span className="font-medium">Received Amount</span>
                <input
                  type="number"
                  value={received}
                  onChange={(e) =>
                    updateForm({
                      received: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-24 border-b border-gray-200 text-right outline-none font-bold text-green-600 focus:border-black"
                />
              </label>

              <div className="flex justify-between px-3">
                <span className="font-medium text-gray-600">Balance Due</span>
                <span
                  className={`font-bold ${
                    balance > 0 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  ৳{balance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block font-medium text-sm text-gray-600">
                Payment Method
              </label>
              <div className="flex gap-3 flex-wrap">
                {["Cash", "Bkash", "Nagad", "Card", "Bank"].map((method) => (
                  <label
                    key={method}
                    className={`cursor-pointer px-4 py-2 rounded-full border transition-all ${
                      paymentType === method
                        ? "bg-yellow-400 text-white border-yellow-500"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentType === method}
                      onChange={() => updateForm({ paymentType: method })}
                      className="hidden"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-sm text-gray-600">
                Internal Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => updateForm({ description: e.target.value })}
                className="w-full p-3 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-black text-sm"
                placeholder="Add details about the modification..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Update & Save Invoice
            </button>
          </div>
        </form>
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-white rounded-[1.618rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Add Item</h2>
                  <p className="text-slate-500 text-xs">
                    Add products or services to your bill
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={onAddItemSubmit} className="p-5 space-y-4">
              {/* Search Stock */}
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
                          <span className="text-sm font-semibold">৳{s.price}</span>
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:bg-white focus:border-transparent outline-none transition-all"
                />
              </div>

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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:bg-white outline-none transition-all font-medium"
                />
              </div>

              {itemTotal > 0 && (
                <div className="bg-slate-900 rounded-2xl p-4 flex justify-between items-center text-white ring-4 ring-slate-50 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">
                      Line Subtotal
                    </span>
                    <span className="text-sm font-medium text-slate-200 italic">
                      calculated
                    </span>
                  </div>
                  <span className="text-2xl font-black tracking-tight text-green-400">
                    ৳ {itemTotal.toLocaleString()}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg shadow-xl active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2 mt-2 hover:bg-gray-800"
              >
                <Plus size={20} strokeWidth={3} /> Save Item
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}