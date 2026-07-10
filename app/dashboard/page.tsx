// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { EllipsisVertical, Share, Trash2 } from "lucide-react";
// import Link from "next/link";
// import toast from "react-hot-toast";
// // import type { Invoice } from "../../../types/type";
// import PrintPreview from "../print-settings/page";

// export default function Page() {
//   const { data: session } = useSession();
//   const user = session?.user;

//   const [invoices, setInvoices] = useState<Invoice[] | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   const [openMenuId, setOpenMenuId] = useState<number | null>(null);

//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchInvoices = async () => {
//       setIsLoading(true);
//       setIsError(false);

//       try {
//         const res = await fetch(`/api/invoice?userId=${user.id}`, {
//           credentials: "include",
//         });

//         if (!res.ok) throw new Error("Failed to fetch invoices");

//         const json = await res.json();
//         setInvoices(json.data);
//       } catch (err) {
//         console.error(err);
//         setIsError(true);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchInvoices();
//   }, [user?.id]);

//   const onDelete = async (id: number | undefined) => {
//     if (!id) return;

//     const confirmed = window.confirm(
//       "Are you sure? You won't be able to revert this!"
//     );
//     if (!confirmed) return;

//     const loadingToast = toast.loading("Deleting...");

//     try {
//       const res = await fetch(`/api/delete/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (!res.ok) throw new Error("Delete failed");

//       setInvoices((old) => (old ? old.filter((inv) => inv.id !== id) : []));

//       toast.success("Invoice has been deleted.", { id: loadingToast });
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to delete invoice!", { id: loadingToast });
//     }
//   };

//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="p-6 text-center text-slate-500">
//         Loading invoices...
//       </div>
//     );
//   }

//   // Error State
//   if (isError) {
//     return (
//       <div className="p-6 text-center text-red-500">
//         Failed to load invoices
//       </div>
//     );
//   }

//   // Empty State
//   if (!invoices || invoices.length === 0) {
//     return (
//       <div className="p-6 text-center space-y-3">
//         <p className="text-slate-500">
//           You have not created any invoice yet.
//         </p>

//         <Link href="/create">
//           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
//             Create Invoice
//           </button>
//         </Link>
//       </div>
//     );
//   }

//   // Main UI
//   return (
//     <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
//       {invoices.map((inv: Invoice) => {
//         const total = inv.total || 0;
//         const received = inv.received || 0;
//         const due = total - received;

//         return (
//           <div
//             key={inv.id}
//             className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition relative"
//           >
//             <div className="flex justify-between items-start">
//               {/* LEFT INFO */}
//               <Link href={`/modify/${inv.id}`} className="space-y-1">
//                 <p className="text-xs text-gray-400">Invoice #{inv.id}</p>

//                 <p className="text-sm font-bold text-gray-800">
//                   Total ৳ {total}
//                 </p>

//                 <p className="text-sm font-semibold text-blue-600">
//                   Received ৳ {received}
//                 </p>

//                 <p
//                   className={`text-sm font-semibold ${
//                     due > 0 ? "text-red-600" : "text-green-600"
//                   }`}
//                 >
//                   {due > 0 ? `Due ৳${due}` : "No Due"}
//                 </p>

//                 <p className="text-[11px] text-gray-500">
//                   {inv.createdAt
//                     ? new Date(inv.createdAt).toLocaleString()
//                     : "No Date"}
//                 </p>
//               </Link>

//               {/* RIGHT ACTION */}
//               <div className="flex flex-col items-end gap-2">
               
//                {/*   print button    */}
// <PrintPreview />
//                 <span
//                   className={`text-[10px] px-2 py-1 rounded-full font-bold ${
//                     due > 0
//                       ? "bg-red-100 text-red-600"
//                       : "bg-green-100 text-green-600"
//                   }`}
//                 >
//                   {due > 0 ? "UNPAID" : "PAID"}
//                 </span>

//                 <button
//                   onClick={() =>
//                     setOpenMenuId(openMenuId === inv.id ? null : inv.id ?? null)
//                   }
//                   className="text-gray-400 hover:text-black"
//                 >
//                   <EllipsisVertical size={18} />
//                 </button>

//                 {openMenuId === inv.id && (
//                   <div
//                     onMouseLeave={() => setOpenMenuId(null)}
//                     className="absolute right-6 mt-2 w-28 bg-white border shadow rounded-lg text-xs"
//                   >
//                     <button className="w-full px-2 py-2 hover:bg-gray-50 flex gap-1">
//                       <Share size={12} /> Share
//                     </button>

//                     <button
//                       onClick={() => onDelete(inv.id)}
//                       className="w-full px-2 py-2 text-red-500 hover:bg-red-50 flex gap-1"
//                     >
//                       <Trash2 size={12} /> Delete
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
 "use client";

import { useSession } from "next-auth/react";

// app/dashboard/page.tsx
export default function Page() {
    const { data: session } = useSession();
console.log(session)
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </main>
  );
}
