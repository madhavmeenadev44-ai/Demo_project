"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, Bug, RefreshCw, LogOut, User } from "lucide-react";
import { MockUser } from "@/lib/auth/users";
import { logoutAction } from "@/app/login/actions";

interface DashboardHeaderActionsProps {
  user?: MockUser | null;
}

export function DashboardHeaderActions({ user }: DashboardHeaderActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isSimulatingError = searchParams.get("fail") === "1";

  const handleToggleSimulateError = () => {
    const sp = new URLSearchParams(searchParams.toString());
    if (isSimulatingError) {
      sp.delete("fail");
    } else {
      sp.set("fail", "1");
    }
    startTransition(() => {
      const queryStr = sp.toString();
      router.push(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false });
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  // Construct secure export URL preserving active filter parameters
  const exportParams = new URLSearchParams();
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  if (q) exportParams.set("q", q);
  if (status && status !== "ALL") exportParams.set("status", status);
  const exportQueryStr = exportParams.toString();
  const exportUrl = exportQueryStr
    ? `/api/transactions/export?${exportQueryStr}`
    : "/api/transactions/export";

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* User & Role Badge */}
      {user && (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 shadow-xs"
          title={`Signed in as ${user.email}`}
        >
          <User className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-400" />
          <span className="hidden sm:inline font-medium text-gray-900 dark:text-white">
            {user.name}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
              isAdmin
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-600"
            }`}
          >
            {user.role}
          </span>
        </div>
      )}

      {/* CSV Export Button: Strictly rendered only for verified ADMIN role */}
      {isAdmin && (
        <a
          href={exportUrl}
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          title="Export matching transactions to CSV (Admin only)"
          aria-label="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </a>
      )}

      {/* Refresh Action */}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isPending}
        aria-label="Refresh transaction data"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
        title="Refresh transactions"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {/* Developer Simulate 500 Error Toggle */}
      <button
        type="button"
        onClick={handleToggleSimulateError}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
          isSimulatingError
            ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 ring-1 ring-rose-400"
            : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700 dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        title="Toggle fail=1 parameter to test API error and retry handling"
      >
        <Bug className="w-3.5 h-3.5 text-rose-500" />
        <span>{isSimulatingError ? "fail=1 (Active)" : "Simulate 500"}</span>
      </button>

      {/* Logout Action */}
      {user && (
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          aria-label="Logout"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors cursor-pointer disabled:opacity-50"
          title="Log out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      )}
    </div>
  );
}
