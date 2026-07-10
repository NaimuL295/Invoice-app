"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Settings, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Types for better DX
type LayoutId = "1" | "2" | "3" | "4";

interface LayoutOption {
  id: LayoutId;
  label: string;
  desc: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: "1", label: "Classic Minimal", desc: "Standard professional look" },
  { id: "2", label: "Modern Grid", desc: "Best for high-item counts" },
  { id: "3", label: "Compact", desc: "Saves paper, tight spacing" },
  { id: "4", label: "Detailed", desc: "Includes full descriptions" },
];

export default function PrintSettings() {
  const { data: session } = useSession();
  const user = session?.user;

  const [layout, setLayout] = useState<string>("1");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`/api/print-settings?userId=${user.id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load settings");

        const data: { layout: string } = await res.json();
        if (data.layout) setLayout(data.layout);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setStatus("loading");

    try {
      const res = await fetch(`/api/print-settings?userId=${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ layout }),
      });

      if (!res.ok) throw new Error("Save failed");

      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin " />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Settings className="w-6 h-6 " />
        <h2 className="text-xl font-bold text-slate-800">Print Configuration</h2>
      </div>

      <div className="space-y-6">
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Default Document Layout
          </label>
          <p className="text-sm text-slate-500 mb-4">
            Select how your invoices and reports will be structured by default.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLayout(opt.id)}
                className={`text-left p-4 border-2 rounded-lg transition-all ${
                  layout === opt.id
                    ? "border-green-600 bg-indigo-50 ring-1"
                    : "border-slate-100 hover:border-slate-900 bg-white"
                }`}
              >
                <div className="font-medium text-slate-900">{opt.label}</div>
                <div className="text-xs text-slate-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="h-6">
            {status === "success" && (
              <span className="flex items-center text-green-600 text-sm animate-in fade-in duration-300">
                <CheckCircle className="w-4 h-4 mr-1" /> Settings saved!
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" /> Save failed.
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={status === "loading"}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-950 text-white font-semibold rounded-lg transition-all shadow-md active:scale-95"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {status === "loading" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}