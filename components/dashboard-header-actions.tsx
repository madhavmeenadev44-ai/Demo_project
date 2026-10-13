"use client";

import React, { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Download, Bug, RefreshCw } from "lucide-react";
import { Transaction } from "@/features/transactions/types";

interface DashboardHeaderActionsProps {
  currentTransactions?: Transaction[];
}

export function DashboardHeaderActions({ currentTransactions = [] }: DashboardHeaderActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"MERCHANT" | "ADMIN">("MERCHANT");
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

  const handleRoleToggle = () => {
    setRole((prev) => (prev === "MERCHANT" ? "ADMIN" : "MERCHANT"));
  };

  const handleExportCsv = () => {
    if (currentTransactions.length === 0) {
      alert("No transactions available to export.");
      return;
    }

    const headers = ["Transaction ID", "Date", "Customer", "Amount (Paise)", "Amount (INR)", "Method", "Status"];
    const rows = currentTransactions.map((t) => [
      t.id,
      t.date,
      `"${t.customer.replace(/"/g, '""')}"`,
      t.amount,
      (t.amount / 100).toFixed(2),
      t.method,
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
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

      {/* Role Toggle (Merchant / Admin) */}
      <button
        type="button"
        onClick={handleRoleToggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        title="Toggle between Merchant and Admin roles"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
        <span>
          Role: <strong className="text-indigo-600 dark:text-indigo-400">{role}</strong>
        </span>
      </button>

      {/* CSV Export Button (Admin Only Feature) */}
      {role === "ADMIN" && (
        <button
          type="button"
          onClick={handleExportCsv}
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
    </div>
  );
}
