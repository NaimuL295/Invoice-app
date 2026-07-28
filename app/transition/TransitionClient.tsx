"use client";

import { EllipsisVertical, Share, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { Invoice } from "@/types/next-auth";
import { deleteInvoice } from "../actions/invoiceActions";
import Print from "../components/PrintSettings/LayoutPdf/Print";

export default function TransitionClient({
  initialInvoices,
}: {
  initialInvoices: Invoice[];
}) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const onDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm("Are you sure?")) return;

    const loadingToast = toast.loading("Deleting invoice...");
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success("Invoice deleted.", { id: loadingToast });
    } catch {
      toast.error("Failed to delete!", { id: loadingToast });
    }
  };

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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-3 sm:space-y-4">
      {invoices.map((inv) => {
        const total = inv.total || 0;
        const received = inv.received || 0;
        const due = total - received;

        return (
          <div
            key={inv.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md transition relative"
          >
            {/* Top row: id/date on the left, menu button on the right — always aligned, on every breakpoint */}
            <div className="flex items-start justify-between gap-2">
              <Link href={`/modify/${inv.id}`} className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md shrink-0">
                  #{inv.id}
                </span>
                <p className="text-[11px] text-gray-400 truncate">
                  {inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString()
                    : "No Date"}
                </p>
              </Link>

              <div className="relative shrink-0">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === inv.id ? null : inv.id)
                  }
                  className="text-gray-400 hover:text-black p-1.5 hover:bg-gray-50 rounded-full transition"
                  aria-label="Open invoice menu"
                >
                  <EllipsisVertical size={18} />
                </button>

                {openMenuId === inv.id && (
                  <div
                    onMouseLeave={() => setOpenMenuId(null)}
                    className="absolute right-0 top-9 w-32 bg-white border shadow-xl rounded-xl text-xs z-20 overflow-hidden"
                  >
                    <button className="w-full px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition">
                      <Share size={13} /> Share
                    </button>
                    <button
                      onClick={() => {
                        onDelete(inv.id);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-3 py-2.5 text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 transition font-medium"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Body: figures + actions. Stacks on mobile, sits in a row from sm up. */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
              <Link
                href={`/modify/${inv.id}`}
                className="grid grid-cols-3 gap-x-3 gap-y-1 sm:flex sm:items-center sm:gap-6"
              >
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                    Total
                  </p>
                  <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                    ৳ {total}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                    Received
                  </p>
                  <p className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                    ৳ {received}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                    Status
                  </p>
                  <p
                    className={`text-sm font-bold whitespace-nowrap ${due > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {due > 0 ? `৳ ${due}` : "No Due"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-gray-50 sm:border-0">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider ${due > 0
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                    }`}
                >
                  {due > 0 ? "UNPAID" : "PAID"}
                </span>
                <Print invoiceId={inv.id.toString()} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}