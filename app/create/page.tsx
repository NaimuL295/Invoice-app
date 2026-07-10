"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useInvoiceStore } from "@/app/store/useInvoiceStore";
import Invoice_Items from "@/app/components/Invoice_Items"; //

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user;

  const { items, setItems } = useInvoiceStore();

  // Form States
  const [date, setDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState<number | "">("");
  const [received, setReceived] = useState<number | "">("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [description, setDescription] = useState("");
  const [uid, setUid] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing invoice data (plain fetch)
  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const res = await fetch(`/api/invoice/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch invoice");

        const json = await res.json();
        const data = json.data;

        startTransition(() => {
          setCustomer(data.customer || "");
          const formattedDate =
            data.date && !isNaN(new Date(data.date).getTime())
              ? new Date(data.date).toISOString().split("T")[0]
              : "";
          setDate(formattedDate);
          setDiscount(data.discount || 0);
          setReceived(data.received || 0);
          setPaymentType(data.paymentType || "Cash");
          setDescription(data.description || "");
          setUid(data.uid || "");
          setItems(data.items || []);
        });
      } catch (error) {
        console.error("Fetch invoice error:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  // Calculations
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );
  const total = subtotal - Number(discount || 0);
  const balance = total - Number(received || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer || items.length === 0) {
      toast.error("Customer and items are required");
      return;
    }

    const invoiceData = {
      uid: String(uid),
      userId: user?.id ? Number(user.id) : undefined,
      customer,
      items,
      subtotal,
      discount: Number(discount || 0),
      total,
      received: Number(received || 0),
      due: balance,
      description,
      paymentType,
    };

    setSubmitting(true);
    const loadingToast = toast.loading("Updating...");

    try {
      const res = await fetch(`/api/modify/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(invoiceData),
      });

      if (!res.ok) throw new Error("Update failed");

      setItems([]);
      toast.success("Updated!", { id: loadingToast });

      setCustomer("");
      setDiscount(0);
      setReceived(0);

      router.push("/");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Something went wrong", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-2 text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading Invoice...
      </div>
    );

  if (isError)
    return (
      <div className="text-red-500 p-10 text-center font-bold">
        Error: Could not retrieve invoice data.
      </div>
    );

  return (
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
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </section>

          <div className="relative">
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
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

            <Invoice_Items />

            <Link
              href="add_item"
              className="block w-full py-2 border-2 border-dashed border-gray-300 text-center rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              + Add More Items
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl h-fit sticky top-4">
          <h3 className="font-semibold text-lg">Summary & Payment</h3>

          <div className="space-y-3 border-b pb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">৳</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-20 border-b border-gray-300 bg-transparent text-right outline-none focus:border-black"
                />
              </div>
            </div>
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
                  setReceived(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-24 border-b border-gray-200 text-right outline-none font-bold text-green-600 focus:border-black"
              />
            </label>

            <div className="flex justify-between px-3">
              <span className="font-medium text-gray-600">Balance Due</span>
              <span
                className={`font-bold ${balance > 0 ? "text-red-500" : "text-gray-500"}`}
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
                    onChange={() => setPaymentType(method)}
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
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-black text-sm"
              placeholder="Add details about the modification..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update & Save Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}