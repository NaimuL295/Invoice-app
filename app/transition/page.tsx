"use client";

import { EllipsisVertical, Share, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { Invoice, Item } from "@/types/next-auth";
import { deleteInvoice } from "../actions/invoiceActions";
import { getInvoices } from "../actions/getInvoices";

export default function TransitionPage({
  initialInvoices = [],
}: {
  initialInvoices?: Invoice[];
}) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use a ref to guarantee we only call getInvoices once per mount
  const hasFetched = useRef(false);

  useEffect(() => {
    async function loadInvoices() {
      if (hasFetched.current) return;
      hasFetched.current = true;
      
      setIsLoading(true);
      try {
        // Define the local payload shape matching your Prisma return structure
       // Define the local payload shape matching your Prisma return structure
type DBInvoicePayload = Omit<Invoice, "user_name" | "companyEmail" | "email"> & {
  user: {
    id: number;
    user_name: string | null;
    email: string;
    [key: string]: unknown; // Changed 'any' to 'unknown' to fully satisfy strict ESLint rules
  } | null;
  items: Item[];
};

        const rawData = (await getInvoices()) as unknown as DBInvoicePayload[];
        
        const formattedInvoices: Invoice[] = rawData.map((inv) => ({
          ...inv,
          user_name: inv.user?.user_name || "Unknown",
          email: inv.user?.email || "No Email",
          companyEmail: inv.user?.email || "No Email",
          
          items: inv.items?.map((item: Item) => ({ 
            id: item.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit: item.unit ?? "pcs",
            price: item.price,
            invoiceId: item.invoiceId
          })) || []
        }));

        setInvoices(formattedInvoices);
      } catch (error) {
        console.error("Error loading invoices:", error);
        toast.error("Failed to load invoices.");
      } finally {
        setIsLoading(false);
      }
    }

    // Only run if initialInvoices is completely empty
    if (initialInvoices.length === 0) {
      loadInvoices();
    }
  }, [initialInvoices]);

  const onDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm("Are you sure?")) return;

    const loadingToast = toast.loading("Deleting invoice...");
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success("Invoice deleted.", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to delete!", { id: loadingToast });
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading invoices...</div>;
  }

  if (invoices.length === 0) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-slate-500">You have not created any invoice yet.</p>
        <Link href="/create">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Create Invoice
          </button>
        </Link>
      </div>
    );
  }
return (
  <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
    {invoices.map((inv: Invoice) => {
      const total = inv.total || 0;
      const received = inv.received || 0;
      const due = total - received;

      return (
        <div 
          key={inv.id} 
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition relative"
        >
          {/* Main Layout Container: Stacked vertical on mobile, flat flex row on desktop */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Left Side: Navigation Link and Metadata */}
            <Link href={`/modify/${inv.id}`} className="w-full sm:w-auto block space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  #{inv.id}
                </span>
                <p className="text-[11px] text-gray-400">
                  {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "No Date"}
                </p>
              </div>

              {/* Data Grid: 3-column layout on mobile, inline-flex grid on large displays */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 sm:flex sm:items-center sm:gap-6 pt-1">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Total</p>
                  <p className="text-sm font-bold text-gray-800">৳ {total}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Received</p>
                  <p className="text-sm font-semibold text-blue-600">৳ {received}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Status</p>
                  <p className={`text-sm font-bold ${due > 0 ? "text-red-600" : "text-green-600"}`}>
                    {due > 0 ? `৳ ${due}` : "No Due"}
                  </p>
                </div>
              </div>
            </Link>

            {/* Right Side: Badges, Print Action, and Dropdown Actions */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t border-gray-50 sm:border-0 gap-3 relative">
              
              <div className="flex items-center gap-3">
                {/* Embedded Print Action Button */}
                <Print invoiceId={inv.id?.toString() || ""} />

                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider ${
                  due > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {due > 0 ? "UNPAID" : "PAID"}
                </span>
              </div>

              <button
                onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id ?? null)}
                className="text-gray-400 hover:text-black p-1.5 hover:bg-gray-50 rounded-full transition"
              >
                <EllipsisVertical size={18} />
              </button>

              {openMenuId === inv.id && (
                <div 
                  onMouseLeave={() => setOpenMenuId(null)} 
                  className="absolute right-0 bottom-12 sm:bottom-auto sm:top-10 w-32 bg-white border shadow-xl rounded-xl text-xs z-20 overflow-hidden"
                >
                  <button className="w-full px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition">
                    <Share size={13} /> Share
                  </button>
                  <button
                    onClick={() => { onDelete(inv.id); setOpenMenuId(null); }}
                    className="w-full px-3 py-2.5 text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 transition font-medium"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      );
    })}
  </div>
);
}