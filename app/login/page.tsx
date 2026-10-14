import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "@/app/login/login-form";
import { Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Merchant Sign In | Transactions Dashboard",
  description: "Sign in with demo credentials to access the merchant transactions dashboard.",
};

export default async function LoginPage() {
  // If already authenticated, redirect immediately to dashboard
  const user = await getSessionUser();
  if (user) {
    redirect("/transactions");
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gray-50/60 dark:bg-zinc-950">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600 text-white shadow-md mb-3">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Merchant Portal
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
          Sign in to view real-time settlement metrics, filter customer payments, and export transaction data.
        </p>
      </div>

      <LoginForm />
    </main>
  );
}

