import React from "react";
import { TransactionSummaryMetrics } from "@/features/transactions/types";
import { formatINR } from "@/lib/format-currency";
import { IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  iconBgClass: string;
}

export function SummaryCard({
  title,
  value,
  subtext,
  icon,
  iconBgClass,
}: SummaryCardProps) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${iconBgClass}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {value}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
        {subtext}
      </p>
    </div>
  );
}

interface TransactionSummaryProps {
  summary?: TransactionSummaryMetrics;
  totalMatching: number;
}

export function TransactionSummary({
  summary,
  totalMatching,
}: TransactionSummaryProps) {
  const totalVolume = summary?.totalVolume ?? 0;
  const successRate = summary?.successRate ?? 0;
  const failedCount = summary?.failedCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* 1. Total Volume Card */}
      <SummaryCard
        title="Total Volume"
        value={formatINR(totalVolume)}
        subtext={`Across ${totalMatching} matching transaction${totalMatching === 1 ? "" : "s"}`}
        icon={<IndianRupee className="w-4 h-4" />}
        iconBgClass="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
      />

      {/* 2. Success Rate Card */}
      <SummaryCard
        title="Success Rate"
        value={`${successRate.toFixed(1)}%`}
        subtext={
          totalMatching === 0
            ? "No transactions in current filter"
            : `${((successRate / 100) * totalMatching).toFixed(0)} of ${totalMatching} settled successfully`
        }
        icon={<TrendingUp className="w-4 h-4" />}
        iconBgClass="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
      />

      {/* 3. Failed Transactions Card */}
      <SummaryCard
        title="Failed Transactions"
        value={String(failedCount)}
        subtext={
          failedCount === 0
            ? "No failed transactions found"
            : "Requires settlement retry or review"
        }
        icon={<AlertTriangle className="w-4 h-4" />}
        iconBgClass="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
      />
    </div>
  );
}
