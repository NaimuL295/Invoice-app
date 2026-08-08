// app/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen ">
      {/* Navbar */}
      <header >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-gray-900">InvoiceApp</span>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-green-500  px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Invoice Management Made Simple
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-600">
          Create invoices quickly, manage clients, and track payments —
          all in one place.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/auth/register"
            className="rounded-md bg-green-500 px-6 py-3 text-base font-semibold  hover:bg-green-400"
          >
            Create Free Account
          </Link>
          <Link
            href="/auth/login"
            className="rounded-md border border-gray-300 px-6 py-3 text-base font-semibold text-gray-70"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Fast Invoice Creation",
              desc: "Create professional invoices in just a few clicks.",
            },
            {
              title: "Client Management",
              desc: "Keep all your client information organized in one place.",
            },
            {
              title: "Payment Tracking",
              desc: "Easily see which invoices are paid and which are pending.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-lg border bg-white p-6 shadow-sm text-center"
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