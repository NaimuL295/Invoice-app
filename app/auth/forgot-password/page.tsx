// app/forgot-password/page.tsx
"use client";

import { forgotPasswordAction } from "@/app/actions/auth";
import { useState, useTransition } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setMsg(null);
    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      if (res?.error) {
        setMsg({ text: res.error, isError: true });
      } else {
        setMsg({
          text: "If an account exists, a password reset link has been sent to your email.",
          isError: false,
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center  sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl p-8 shadow-xl ">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight ">
            Find your account
          </h2>
          <p className="mt-2 text-center text-sm ">
            Enter your email address to receive a password reset link.
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium "
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="block w-full rounded-lg border  px-3 py-2   text-sm"
              />
            </div>
          </div>

          {msg && (
            <div
              className={`rounded-lg p-3 text-sm ${
                msg.isError
                  ? " text-red-700 "
                  : " "
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full justify-center rounded-lg bg-green-400 px-4 py-2.5 text-sm font-semibold  shadow-sm "
          >
            {isPending ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium "
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}