"use client";

// app/dashboard/page.tsx
import Link from "next/link";
import {
  FileText,
  Printer,
  Sparkles,
  BarChart3,
  Users,
  Bell,
} from "lucide-react";

const currentFeatures = [
  {
    title: "Invoices",
    description: "View, manage, and print all your invoices.",
    href: "/transition",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Print Settings",
    description: "Choose your preferred invoice print layout.",
    href: "/print-settings",
    icon: Printer,
    color: "bg-purple-50 text-purple-600",
  },
];

const upcomingFeatures = [
  {
    title: "Analytics & Reports",
    description: "Track revenue trends and payment history over time.",
    icon: BarChart3,
  },
  {
    title: "Client Management",
    description: "Save client details for faster invoice creation.",
    icon: Users,
  },
  {
    title: "Payment Reminders",
    description: "Automatic notifications for overdue invoices.",
    icon: Bell,
  },
];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Quick access to your tools and what s coming next.
        </p>
      </div>

      {/* Current features */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Available Now
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {currentFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group flex items-start gap-4 bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition"
              >
                <div className={`p-3 rounded-xl ${feature.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Future updates */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          Coming Soon
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {upcomingFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative bg-gray-50 border border-dashed rounded-2xl p-6 opacity-75"
              >
                <span className="absolute top-4 right-4 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  SOON
                </span>
                <div className="p-3 rounded-xl bg-gray-100 text-gray-400 w-fit">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-gray-700">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}