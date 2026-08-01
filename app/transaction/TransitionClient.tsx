"use client";

import { EllipsisVertical, Loader2, Share, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: number | null) => {
    if (!id) return;

    const loadingToast = toast.loading("Deleting invoice...");
    
    startTransition(async () => {
      try {
        await deleteInvoice(id);
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        toast.success("Invoice deleted.", { id: loadingToast });
      } catch {
        toast.error("Failed to delete!", { id: loadingToast });
      } finally {
        setDeletingId(null);
      }
    });
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
            {/* Top row */}
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

              <div className="relative shrink-0" ref={openMenuId === inv.id ? menuRef : null}>
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
                  <div className="absolute right-0 top-9 w-32 bg-white border shadow-xl rounded-xl text-xs z-20 overflow-hidden">
                    <button className="w-full px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition">
                      <Share size={13} /> Share
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(inv.id ?? null);
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

            {/* Body */}
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
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider ${
                    due > 0
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {due > 0 ? "UNPAID" : "PAID"}
                </span>
                {inv.id && <Print invoiceId={inv.id.toString()} />}
              </div>
            </div>
          </div>
        );
      })}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.618rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Invoice?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This action cannot be undone from your database.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isPending}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50 transition"
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