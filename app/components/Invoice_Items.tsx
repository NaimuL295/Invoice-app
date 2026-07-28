"use client"; // Required because you are using client-side hooks (Zustand)

import Link from "next/link"; // Changed from react-router
import { useInvoiceStore } from "../store/useInvoiceStore";


export default function InvoiceItems() { // Cleaned up the function name to follow standard PascalCase
  const items = useInvoiceStore((state) => state.items);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="bg-white shadow p-2 rounded-lg border-gray-100">
          {/* Changed 'to' to 'href' */}
          <Link href={`/edit/${item.id}`}>
            <div className="flex justify-between">
              <h3 className="font-semibold">
                #{index + 1} {item.item_name}
              </h3>
              <h3 className="text-sm text-gray-500">
                {item.quantity} x {item.price}
              </h3>
            </div>
            {/* Removed the accidental stray backtick from your class name (mt-1`) */}
            <div className="flex justify-between mt-1">
              <h3>Item Subtotal</h3>
              <div>
                <span className="font-bold">৳ {item.total}</span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}