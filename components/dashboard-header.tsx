import React from "react";
import { Store, ShieldCheck, Download, Bug, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  role: "MERCHANT" | "ADMIN";
  onRoleToggle: () => void;
  onExportCsv?: () => void;
  isSimulatingError: boolean;
  onToggleSimulateError: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DashboardHeader({
  role,
  onRoleToggle,
  onExportCsv,
  isSimulatingError,
  onToggleSimulateError,
  onRefresh,
  isLoading,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Merchant Transactions
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400">
            Monitor real-time payments, settlement statuses, and customer transactions across channels.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh transaction data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Role Toggle (Merchant / Admin) */}
          <button
            type="button"
            onClick={onRoleToggle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
            title="Toggle between Merchant and Admin roles"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Role: <strong className="text-indigo-600 dark:text-indigo-400">{role}</strong></span>
          </button>

          {/* CSV Export Button (Admin Only Feature) */}
          {role === "ADMIN" && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              title="Admin feature: Export transactions to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Developer Simulate 500 Error Toggle */}
          <button
            type="button"
            onClick={onToggleSimulateError}
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
        </div>
      </div>
    </header>
  );
}

