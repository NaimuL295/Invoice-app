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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {invoices.map((inv) => {
        const total = inv.total || 0;
        const received = inv.received || 0;
        const due = total - received;

        return (
          <div
            key={inv.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition relative"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link
                href={`/modify/${inv.id}`}
                className="w-full sm:w-auto block space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                    #{inv.id}
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {inv.createdAt
                      ? new Date(inv.createdAt).toLocaleDateString()
                      : "No Date"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-x-4 gap-y-1 sm:flex sm:items-center sm:gap-6 pt-1">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                      Total
                    </p>
                    <p className="text-sm font-bold text-gray-800">৳ {total}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                      Received
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      ৳ {received}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                      Status
                    </p>
                    <p
                      className={`text-sm font-bold ${due > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {due > 0 ? `৳ ${due}` : "No Due"}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t border-gray-50 sm:border-0 gap-3 relative">
                <div className="flex items-center gap-3">
                  <Print invoiceId={inv.id.toString()} />
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider ${
                      due > 0
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {due > 0 ? "UNPAID" : "PAID"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === inv.id ? null : inv.id)
                  }
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
          </div>
        );
      })}
    </div>
  );
}
