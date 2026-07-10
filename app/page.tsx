// app/page.tsx
import Link from "next/link";
import { auth } from "@/auth"; // Auth.js v5 config export
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // যদি ইউজার আগে থেকেই লগইন করা থাকে, সরাসরি ড্যাশবোর্ডে পাঠিয়ে দাও
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-gray-900">InvoiceApp</span>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              লগইন
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              শুরু করুন
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          ইনভয়েস ম্যানেজমেন্ট এখন আরও সহজ
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-600">
          দ্রুত ইনভয়েস তৈরি করুন, ক্লায়েন্ট ম্যানেজ করুন এবং পেমেন্ট ট্র্যাক
          করুন — সব একটাই জায়গায়।
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
          >
            ফ্রি অ্যাকাউন্ট খুলুন
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-100"
          >
            লগইন করুন
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "দ্রুত ইনভয়েস তৈরি",
              desc: "কয়েক ক্লিকেই প্রফেশনাল ইনভয়েস তৈরি করুন।",
            },
            {
              title: "ক্লায়েন্ট ম্যানেজমেন্ট",
              desc: "সব ক্লায়েন্টের তথ্য এক জায়গায় সংরক্ষিত রাখুন।",
            },
            {
              title: "পেমেন্ট ট্র্যাকিং",
              desc: "কোন ইনভয়েস পেইড, কোনটা পেন্ডিং, সব সহজেই দেখুন।",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}