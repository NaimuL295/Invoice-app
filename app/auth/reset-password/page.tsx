// app/reset-password/page.tsx
"use client";

import { resetPasswordAction } from "@/app/actions/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const password = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setMsg({ text: "Passwords do not match.", isError: true });
      return;
    }

    startTransition(async () => {
      formData.set("token", params.get("token") || "");

      const res = await resetPasswordAction(formData);

      if (res?.error) {
        setMsg({ text: res.error, isError: true });
      } else {
        setMsg({
          text: "Password updated successfully. Redirecting...",
          isError: false,
        });
        setTimeout(() => {
          router.push("/auth/login?reset=success");
        }, 1500);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Enter your new password below to update your account access.
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                Show passwords
              </label>
            </div>
          </div>

          {msg && (
            <div
              className={`rounded-lg p-3 text-sm text-center ${
                msg.isError
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-gray-800 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Updating..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}