import React from "react";
import { TransactionSummaryMetrics } from "@/features/transactions/types";
import { formatINR } from "@/lib/format-currency";
import { IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";

interface TransactionSummaryProps {
  summary?: TransactionSummaryMetrics;
  totalMatching: number;
  isLoading: boolean;
}

export function TransactionSummary({
  summary,
  totalMatching,
  isLoading,
}: TransactionSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((key) => (
          <div
            key={key}
            className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
            <div className="h-7 w-32 bg-gray-200 dark:bg-zinc-800 rounded mb-2"></div>
            <div className="h-3 w-40 bg-gray-100 dark:bg-zinc-800/60 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalVolume = summary?.totalVolume ?? 0;
  const successRate = summary?.successRate ?? 0;
  const failedCount = summary?.failedCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* 1. Total Volume */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
            Total Volume
          </span>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {formatINR(totalVolume)}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
          Across {totalMatching} matching transaction{totalMatching === 1 ? "" : "s"}
        </p>
      </div>

      {/* 2. Success Rate */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
            Success Rate
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {successRate.toFixed(1)}%
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
          {totalMatching === 0
            ? "No transactions in current filter"
            : `${((successRate / 100) * totalMatching).toFixed(0)} of ${totalMatching} settled successfully`}
        </p>
      </div>

      {/* 3. Failed Transactions */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
            Failed Transactions
          </span>
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {failedCount}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
          {failedCount === 0
            ? "No failed transactions found"
            : "Requires settlement retry or review"}
        </p>
      </div>
    </div>
  );
}

