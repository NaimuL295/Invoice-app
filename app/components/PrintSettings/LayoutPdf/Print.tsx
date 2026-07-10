"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Printer, Loader2 } from "lucide-react";

import LayoutOne from "@/app/components/PrintSettings/LayoutPdf/LayoutOne";
import LayoutTwo from "@/app/components/PrintSettings/LayoutPdf/LayoutTwo";
import LayoutThree from "@/app/components/PrintSettings/LayoutPdf/LayoutThree";
import LayoutFour from "@/app/components/PrintSettings/LayoutPdf/LayoutFour";
import { Invoice } from "@/types/next-auth";


// If you have a backend server action to get a single invoice, import it here:
// import { getInvoiceById } from "../actions/invoiceActions";

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

const Print: React.FC<PrintPreviewProps> = ({ invoiceId }) => {
  const [data, setData] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;

    async function fetchSingleInvoice() {
      setIsLoading(true);
      setIsError(false);
      try {
        // Option A: Using native fetch if it is an API route
        const res = await fetch(`/api/invoice/${invoiceId}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const json = await res.json();
        setData(json.data);

        // Option B: If using Server Actions instead, swap with this:
        // const invoiceData = await getInvoiceById(Number(invoiceId));
        // setData(invoiceData);
      } catch (err) {
        console.error(err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSingleInvoice();
  }, [invoiceId]);

  const handlePrint = async () => {
    if (!data) return;

    // Get the layout based on user preference, fallback to LayoutOne
    const layoutKey = data.user?.printLayout || "1";
    console.log(layoutKey, data);

    const LayoutComponent = layoutMap[layoutKey] || LayoutOne;

    // Pass data to satisfy the component's requirements
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

  if (isLoading) {
    return <Loader2 className="animate-spin text-gray-400" size={20} />;
  }
  
  if (isError) {
    return <span className="text-red-500 text-xs">Error loading invoice</span>;
  }

  return (
    <button
      onClick={handlePrint}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      title="Print Invoice"
      disabled={!data}
    >
      <Printer size={20} className="text-gray-600" />
    </button>
  );
};

export default Print;