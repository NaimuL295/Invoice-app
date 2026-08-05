"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Printer } from "lucide-react";
import { useInvoiceStore } from "../store/useInvoiceStore";
import InvoiceItems from "../Share/InvoiceItems";
import { createInvoice } from "../actions/invoiceActions";

export default function CreatePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const items = useInvoiceStore((state) => state.items);
  const setItems = useInvoiceStore((state) => state.setItems);

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [customer, setCustomer] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [invoiceId, setInvoiceId] = useState(() =>
    String(crypto.getRandomValues(new Uint32Array(1))[0])
  );
  const [discount, setDiscount] = useState<number | "">("");

  const [received, setReceived] = useState<number | "">("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const { subtotal, discountAmount, total, balance } = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    const discountValue = Number(discount || 0);
    const calculatedDiscount = (subtotal * discountValue) / 100;

    const cappedDiscount = Math.min(calculatedDiscount, subtotal);
    const total = subtotal - cappedDiscount;
    const balance = total - Number(received || 0);

    return { subtotal, discountAmount: cappedDiscount, total, balance };
  }, [items, discount, received]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      if (isSubmitting) return;

      if (!customer.trim()) {
        toast.error("Customer name is required!");
        return;
      }
      if (!customerNumber.trim()) {
        toast.error("Customer phone number is required!");
        return;
      }
      if (!customerAddress.trim()) {
        toast.error("Customer address is required!");
        return;
      }
      if (items.length === 0) {
        toast.error("Please add at least one item to the invoice!");
        return;
      }
      if (!session?.user) {
        toast.error("Please log in to create an invoice.");
        return;
      }

      const invoiceData = {
        uid: String(invoiceId),
        date,
        customer,
        customer_number: customerNumber,
        customer_address: customerAddress,
        items,
        subtotal,
        discount: discountAmount,
        total,
        received: Number(received || 0),
        due: balance,
        description,
        paymentType,
      };

      setIsSubmitting(true);
      const loadingToast = toast.loading("Creating invoice...");

      try {
        await createInvoice(invoiceData);

        // Reset global & local state
        setItems([]);
        toast.success("Invoice created successfully! 🎉", { id: loadingToast });
        router.push("/");
      } catch (error) {
        console.error("Error creating invoice:", error);
        const message =
          error instanceof Error ? error.message : "Something went wrong!";
        toast.error(message, { id: loadingToast });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      customer,
      customerNumber,
      customerAddress,
      items,
      session?.user,
      invoiceId,
      date,
      subtotal,
      discountAmount,
      total,
      received,
      balance,
      description,
      paymentType,
      setItems,
      router,
    ]
  );

  return (
    <div className="min-h-screen max-w-5xl lg:mx-auto p-2 sm:p-6 pb-16 md:pb-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <section className="grid grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Invoice No
              </label>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full bg-transparent font-bold outline-none text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent outline-none font-medium"
              />
            </div>
          </section>

          {/* Customer Name */}
          <div className="relative group">
            <input
              id="name"
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              required
              className="peer w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none transition-colors bg-transparent"
              placeholder=" "
            />
            <label
              htmlFor="name"
              className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all 
              peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black 
              peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Customer Name
            </label>
          </div>

          {/* Customer Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">
              Customer Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 01712345678"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* Customer Address */}
          <div className="space-y-2">
            <label className="block font-bold text-sm text-gray-600">
              Customer Address
            </label>
            <textarea
              rows={2}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full p-3 border-2 border-gray-100 rounded-xl bg-white outline-none focus:border-black text-sm transition-all"
              placeholder="Click to add address..."
            />
          </div>

          {/* Products List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-800 text-lg">Product Items</h3>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-500">
                List View
              </span>
            </div>

            <InvoiceItems />

            <Link
              href="/create/add-item"
              className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl hover:border-black hover:text-black hover:bg-gray-50 transition-all text-sm font-semibold"
            >
              + Add Product to Invoice
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl h-fit lg:sticky lg:top-8 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-xl text-gray-900 mb-4">Summary</h3>

          <div className="space-y-3 border-b border-gray-200 pb-4">
            {/* Subtotal Display */}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            {/* Discount Section */}
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount (%)</span>

              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(
                      e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                    )
                  }
                  min="0"
                  max="100"
                  className="w-20 text-right outline-none font-medium text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Discount Amount Preview */}
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>Discount Applied</span>
                <span>- ৳{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-ls font-black text-gray-900">Total Amount</span>
              <span className="text-ls font-black text-red-500">
                ৳{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Received */}
          <div className="space-y-3 pt-2">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-500 ">Received</span>
                <span className="text-xs text-green-500 font-bold">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ls font-bold text-gray-400">৳</span>
                <input
                  type="number"
                  value={received}
                  onChange={(e) =>
                    setReceived(
                      e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                    )
                  }
                  className="w-full text-ls font-bold outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-between px-2">
              <span className="font-semibold text-gray-500">Balance Due</span>
              <span
                className={`font-bold text-ls ${
                  balance > 0 ? "text-red-500" : "text-gray-400"
                }`}
              >
                ৳{balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block font-bold text-sm text-gray-600">Payment Method</label>
            <div className="flex gap-2 flex-wrap">
              {["Cash", "Bkash", "Card", "Bank"].map((method) => (
                <label
                  key={method}
                  className={`cursor-pointer px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                    paymentType === method
                      ? "bg-black text-white border-black"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentType === method}
                    onChange={() => setPaymentType(method)}
                    className="hidden"
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block font-bold text-sm text-gray-600">Note / Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border-2 border-gray-100 rounded-xl bg-white outline-none focus:border-black text-sm transition-all"
              placeholder="Click to add note..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="grow py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Invoice"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all"
              title="Print Invoice"
            >
              <Printer size={24} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}