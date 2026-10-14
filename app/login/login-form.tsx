"use client";

import React, { useActionState, useState } from "react";
import { loginAction, LoginFormState } from "@/app/login/actions";
import { Lock, Mail, ShieldAlert, ArrowRight, KeyRound } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginFormState | null, FormData>(
    loginAction,
    null
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillAdmin = () => {
    setEmail("admin@example.com");
    setPassword("Admin123!");
  };

  const fillViewer = () => {
    setEmail("viewer@example.com");
    setPassword("Viewer123!");
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
      {/* Demo Credentials Helper Card */}
      <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-gray-700 dark:text-zinc-300">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-950 dark:text-indigo-200 mb-2">
          <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Demo Credentials (Click to quick-fill):</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            type="button"
            onClick={fillAdmin}
            className="flex-1 text-left px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-colors cursor-pointer group"
          >
            <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
              <span>Admin Role</span>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                Export Enabled
              </span>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
              admin@example.com / Admin123!
            </div>
          </button>

          <button
            type="button"
            onClick={fillViewer}
            className="flex-1 text-left px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-colors cursor-pointer group"
          >
            <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
              <span>Viewer Role</span>
              <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded font-bold">
                Read Only
              </span>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
              viewer@example.com / Viewer123!
            </div>
          </button>
        </div>
      </div>

      {/* Accessible Error Alert */}
      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm"
        >
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Login Form */}
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 text-center text-xs text-gray-400 dark:text-zinc-500">
        Assessment Demo Authentication • Signed HTTP-only session cookies
      </div>
    </div>
  );
}
