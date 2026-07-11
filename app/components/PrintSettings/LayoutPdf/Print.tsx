"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Printer, Loader2 } from "lucide-react";

import LayoutOne from "@/app/components/PrintSettings/LayoutPdf/LayoutOne";
import LayoutTwo from "@/app/components/PrintSettings/LayoutPdf/LayoutTwo";
import LayoutThree from "@/app/components/PrintSettings/LayoutPdf/LayoutThree";
import LayoutFour from "@/app/components/PrintSettings/LayoutPdf/LayoutFour";
import { Invoice, } from "@/types/next-auth";
import { getInvoiceId } from "@/app/actions/invoiceActions";

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

export default function Print({ invoiceId }: PrintPreviewProps) {
  const [data, setData] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;
    let isCancelled = false;

    async function fetchInvoice() {
      setIsLoading(true);
      setIsError(false);
      try {
        const idNumber = Number(invoiceId);

        if (isNaN(idNumber)) {
          throw new Error("Invalid invoice ID");
        }

        const invoiceData: Invoice = await getInvoiceId(idNumber);

        if (invoiceData && !isCancelled) {
          const formattedInvoice: Invoice = {
            ...invoiceData,
            uid: invoiceData.uid ?? "",
            user_name:
              invoiceData.user_name ?? invoiceData.user?.user_name ?? "",
            email: invoiceData.email ?? invoiceData.user?.email ?? "",
            companyEmail:
              invoiceData.companyEmail ?? invoiceData.user?.email ?? "",
            date: invoiceData.date
              ? new Date(invoiceData.date).toISOString().split("T")[0]
              : "",
            createdAt: invoiceData.createdAt
              ? new Date(invoiceData.createdAt).toISOString()
              : new Date().toISOString(),
            discount: invoiceData.discount ?? 0,
            subtotal: invoiceData.subtotal ?? 0,
            total: invoiceData.total ?? 0,
            due: invoiceData.due ?? 0,
            received: invoiceData.received ?? 0,
            customer: invoiceData.customer ?? "",
            paymentType: invoiceData.paymentType ?? "",
            description: invoiceData.description ?? "",
            items: invoiceData.items ?? [],
          };

          setData(formattedInvoice);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchInvoice();

    return () => {
      isCancelled = true;
    };
  }, [invoiceId]);

  const handlePrint = async () => {
    if (!data) return;

    // 1. Instantly open a blank window within the user interaction scope
    const printWindow = window.open("about:blank", "_blank");
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups for this site.");
      return;
    }

    // 2. Placeholder loading message inside the new window
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

  if (isLoading) {
    return <Loader2 className="animate-spin text-gray-400" size={20} />;
  }

  if (isError) {
    return <span className="text-red-500 text-xs">Error loading invoice</span>;
  }

  return (
    <button
      onClick={handlePrint}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
      title="Print Invoice"
      disabled={!data || isGeneratingPdf}
    >
      {isGeneratingPdf ? (
        <Loader2 className="animate-spin text-gray-600" size={20} />
      ) : (
        <Printer size={20} className="text-gray-600" />
      )}
    </button>
  );
}