"use client";

import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { Printer, Loader2 } from "lucide-react";


import type { Invoice } from "../../../../types/type";

interface LayoutProps {
  data: Invoice;
  title?: string;
}

type PrintPreviewProps = {
  invoiceId: string;
};

const layoutMap: Record<string, React.FC<LayoutProps>> = {
  "1": LayoutOne,
  "2": LayoutTwo,
  "3": LayoutThree,
  "4": LayoutFour,
};

const PrintPreview: React.FC<PrintPreviewProps> = ({ invoiceId }) => {
  const [data, setData] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoice = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const res = await fetch(`/api/invoice/${invoiceId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch invoice");

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error("Failed to fetch invoice", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = async () => {
    if (!data) return;

    // Get the layout based on user preference, fallback to LayoutOne
    const layoutKey = data.user.printLayout;
    console.log(layoutKey, data);

    const LayoutComponent = layoutMap[layoutKey] || LayoutOne;

    const doc = <LayoutComponent data={data} />;

    try {
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url);
      // Safety: Revoke URL after a minute to prevent memory leaks
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Could not generate PDF", err);
      alert("Failed to generate invoice print view.");
    }
  };

  if (isLoading)
    return <Loader2 className="animate-spin text-gray-400" size={20} />;
  if (isError)
    return <span className="text-red-500 text-xs">Error loading invoice</span>;

  return (
    <button
      onClick={handlePrint}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      title="Print Invoice"
    >
      <Printer size={20} className="text-gray-600" />
    </button>
  );
};

export default PrintPreview;