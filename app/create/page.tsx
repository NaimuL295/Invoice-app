"use client";

import { useState } from "react";
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

  const { setItems } = useInvoiceStore();
  const items = useInvoiceStore((state) => state.items);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customer, setCustomer] = useState("");
  const [invoiceId, setInvoiceId] = useState(() =>
    String(crypto.randomUUID().split("-")[0])
  );
  const [discount, setDiscount] = useState<number | "">("");
  const [received, setReceived] = useState<number | "">("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [description, setDescription] = useState("");

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const total = subtotal - (subtotal * Number(discount || 0)) / 100;
  const balance = total - Number(received || 0);




  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!customer || items.length === 0) {
      toast.error("Customer and items required!");
      return;
    }

    if (!session?.user) {
      toast.error("Please log in again.");
      return;
    }

    const invoiceData = {
      uid: String(invoiceId),
      date,
      customer,
      items,
      subtotal,
      discount,
      total,
      received,
      due: balance,
      description,
      paymentType,
    };

    const loadingToast = toast.loading("Creating invoice...");

    try {
      // 2. FIX: Use invoiceData, not data
      // 3. FIX: No res.ok check - just await the result
      await createInvoice(invoiceData);

      setItems([]);
      toast.success("Invoice created successfully! 🎉", { id: loadingToast });

      router.push("/");
      setCustomer("");
      setDiscount(0);
      setReceived(0);
    } catch (error) {
      console.error("Error creating invoice:", error);
      // 4. FIX: Get the actual error message
      const message = error instanceof Error ? error.message : "Something went wrong!";
      toast.error(message, { id: loadingToast });
    }
  };

  // ... rest of JSX stays the same
  return (
    <div className="max-w-5xl lg:mx-auto p-2 sm:p-8">
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
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount Amount</span>
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200">
                <span className="text-xs text-gray-400 font-bold">৳</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-20 text-right outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-black text-gray-900">Total Amount</span>
              <span className="text-2xl font-black text-yellow-600">
                ৳{total?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-500 uppercase">Received</span>
                <span className="text-xs text-green-500 font-bold">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-400">৳</span>
                <input
                  type="number"
                  value={received}
                  onChange={(e) =>
                    setReceived(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full text-2xl font-bold text-green-600 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between px-2">
              <span className="font-semibold text-gray-500">Balance Due</span>
              <span className={`font-bold text-lg ${balance > 0 ? "text-red-500" : "text-gray-400"}`}>
                ৳{balance?.toLocaleString()}
              </span>
            </div>
          </div>

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

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="grow py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
            >
              Save Invoice
            </button>
            <button
              type="button"
              className="p-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all"
            >
              <Printer size={24} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}