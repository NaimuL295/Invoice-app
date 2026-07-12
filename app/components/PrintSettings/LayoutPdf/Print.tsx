"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Printer, Loader2 } from "lucide-react";

import LayoutOne from "@/app/components/PrintSettings/LayoutPdf/LayoutOne";
import LayoutTwo from "@/app/components/PrintSettings/LayoutPdf/LayoutTwo";
import LayoutThree from "@/app/components/PrintSettings/LayoutPdf/LayoutThree";
import LayoutFour from "@/app/components/PrintSettings/LayoutPdf/LayoutFour";
import { Invoice } from "@/types/next-auth";
import { getInvoiceId } from "@/app/actions/invoiceActions";
import { formatPrismaInvoice } from "@/lib/formatInvoice";

interface LayoutProps {
  data: Invoice;
  title?: string;
}

type PrintPreviewProps = {
  invoiceId: string;
  invoice?: Invoice;
};

const layoutMap: Record<string, React.FC<LayoutProps>> = {
  "1": LayoutOne,
  "2": LayoutTwo,
  "3": LayoutThree,
  "4": LayoutFour,
};

export default function Print({ invoiceId, invoice: invoiceProp }: PrintPreviewProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const loadInvoice = async (): Promise<Invoice | null> => {
    if (invoiceProp) return invoiceProp;

    const idNumber = Number(invoiceId);
    if (isNaN(idNumber)) {
      throw new Error("Invalid invoice ID");
    }

    const invoiceData = await getInvoiceId(idNumber);
    return formatPrismaInvoice(invoiceData);
  };

  const handlePrint = async () => {
    setIsFetching(true);
    setIsError(false);

    let data: Invoice | null = null;
    try {
      data = await loadInvoice();
    } catch (err) {
      console.error(err);
      setIsError(true);
      setIsFetching(false);
      return;
    }

    setIsFetching(false);
    if (!data) return;

    const printWindow = window.open("about:blank", "_blank");
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups for this site.");
      return;
    }

    printWindow.document.title = "Generating Invoice...";
    printWindow.document.body.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; color:#4b5563;">
        <p>Generating PDF invoice, please wait...</p>
      </div>
    `;

    const layoutKey = data.user?.printLayout || "1";
    const LayoutComponent = layoutMap[layoutKey] || LayoutOne;
    const doc = <LayoutComponent data={data} />;

    try {
      setIsGeneratingPdf(true);

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      printWindow.location.href = url;

      printWindow.addEventListener("load", () => {
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error("Could not generate PDF", err);
      printWindow.close();
      alert("Failed to generate invoice print view.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isError) {
    return <span className="text-red-500 text-xs">Error</span>;
  }

  const isBusy = isFetching || isGeneratingPdf;

  return (
    <button
      onClick={handlePrint}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
      title="Print Invoice"
      disabled={isBusy}
    >
      {isBusy ? (
        <Loader2 className="animate-spin text-gray-600" size={20} />
      ) : (
        <Printer size={20} className="text-gray-600" />
      )}
    </button>
  );
}
