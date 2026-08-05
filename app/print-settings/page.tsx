"use client";

import { useState, useEffect } from "react";
import { getPrintSettings, updatePrintSettings } from "@/app/actions/printSettings";
import toast from "react-hot-toast";
import { CheckCircle2, LayoutTemplate, Loader2, Save } from "lucide-react";

export interface InvoiceLayout {
  id: string;
  title: string;
  description: string;
}

export const layouts: InvoiceLayout[] = [
  {
    id: "1",
    title: "Classic",
    description: "Traditional invoice with clean table layout.",
  },
  {
    id: "2",
    title: "Modern",
    description: "Modern design with bold headers and clear spacing.",
  },
  {
    id: "3",
    title: "Minimal",
    description: "Simple, elegant layout focused on readability.",
  },
  {
    id: "4",
    title: "POS Print",
    description: "Thermal receipt format tailored for POS systems.",
  },
];

export default function PrintSettings() {
  const [layout, setLayout] = useState("1");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getPrintSettings();
        setLayout(data.layout);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading("Saving settings...");

    try {
      const result = await updatePrintSettings(layout);
      toast.success(result.message || "Settings updated successfully!", {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        { id: loadingToast }
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen  max-w-5xl mx-auto p-4 sm:p-4">
      <div className="rounded-2xl   p-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 pb-4  ">
          <div className="h-12 w-12 rounded-xl b flex items-center justify-center shrink-0">
            <LayoutTemplate size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold ">
              Print Settings
            </h1>
            <p className="text-sm  mt-1">
              Select your preferred invoice layout. This will be applied whenever you generate or print invoices.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider ">
            Choose Layout
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {layouts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLayout(item.id)}
                className={`relative rounded-xl border-2 p-4 transition-all duration-200 text-left flex flex-col justify-between hover:scale-[1.01] ${
                  layout === item.id
                    ? "border-green-500  shadow-sm"
                    : "border-gray-200  hover:border-green-300 dark:hover:border-green-800 "
                }`}
              >
                {layout === item.id && (
                  <CheckCircle2
                    className="absolute top-3 right-3 text-green-500"
                    size={20}
                  />
                )}

                <div>
                  <div className="h-24 rounded-lg border 
                   flex items-center justify-center mb-3">
                    <LayoutTemplate size={32} className="" />
                  </div>

                  <h3 className="font-semibold text-base ">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs t line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between border-t  pt-3">
            <div>
              <p className="text-xs  uppercase tracking-wider font-medium">
                Selected Layout
              </p>
              <p className="text-sm font-semibold ">
                {layouts.find((x) => x.id === layout)?.title}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700  px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 shadow-sm active:scale-[0.98]"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}