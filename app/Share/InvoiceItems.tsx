"use client"; // Next.js-এ ক্লায়েন্ট হুক বা স্টেট ব্যবহারের জন্য এটি জরুরি

import Link from "next/link"; // react-router এর বদলে next/link
import { useInvoiceStore } from "../store/useInvoiceStore";


export default function InvoiceItems() {
  const items = useInvoiceStore((state) => state.items);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="bg-white shadow p-2 rounded-lg border-gray-100">
          {/* 'to' এর জায়গায় 'href' ব্যবহার করা হয়েছে */}
          <Link href={`/profile/edit/${item.id}`}> 
            <div className="flex justify-between">
              <h3 className="font-semibold">
                #{index + 1} {item.item_name}
              </h3>
              <h3 className="text-sm text-gray-500">
                {item.quantity} x {item.price}
              </h3>
            </div>
            {/* কোডের টাইপো mt-1` ঠিক করে mt-1 করা হয়েছে */}
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