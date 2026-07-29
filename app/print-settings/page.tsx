"use client";

import { useState, useEffect } from "react";
import { getPrintSettings, updatePrintSettings } from "@/app/actions/printSettings";
import toast from "react-hot-toast";
import { CheckCircle2, LayoutTemplate, Save } from "lucide-react";

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
    title: "POS Print", // 🟩 Extra trailing space removed & clean label
    description: "Thermal receipt format tailored for POS systems.",
  },
  {
    id: "5",
    title: "Compact",
    description: "Dense structure optimized for saving paper and space.",
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
      <div className="h-[450px] flex items-center justify-center">
        <div className="animate-pulse text-lg font-medium ">
          Loading Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="rounded-3xl overflow-hidden border  shadow-2xl">

        {/* Header */}

        <div className="  px-10 py-10 ">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl  flex items-center justify-center">
              <LayoutTemplate size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Print Settings
              </h1>

              <p className="mt-2 ">
                Select your preferred invoice print layout. This layout
                will be used whenever you print invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}

        <div className="p-10">

          <h2 className="text-xl font-semibold mb-6">
            Choose Layout
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {layouts.map((item) => (
              <button
                key={item.id}
                onClick={() => setLayout(item.id)}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-300 text-left hover:scale-[1.02]

                ${layout === item.id
                    ? "border-green-500 bg-blue-50  shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                  }
                `}
              >
                {layout === item.id && (
                  <CheckCircle2
                    className="absolute top-4 right-4 "
                    size={24}
                  />
                )}

                <div className="h-40 rounded-xl border bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-5">
                  <LayoutTemplate size={50} className="text-gray-400" />
                </div>

                <h3 className="font-bold text-lg">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {item.description}
                </p>
              </button>
            ))}
          </div>

          {/* Footer */}

          <div className="mt-10 flex justify-between items-center border-t pt-8">

            <div>
              <p className="font-medium">
                Selected Layout
              </p>

              <p className="text-sm text-gray-500">
                {
                  layouts.find((x) => x.id === layout)?.title
                }
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-green-500 text-white  px-8 py-3  font-semibold hover:bg-green-600 disabled:opacity-60 transition"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}