import React, { useState } from "react";
import { Transaction } from "@/features/transactions/types";
import { formatINR, formatDateTime } from "@/features/transactions/utils";
import { StatusBadge } from "@/components/status-badge";
import {
  AlertCircle,
  RotateCcw,
  SearchX,
  CreditCard,
  Smartphone,
  Wallet,
  Copy,
  Check,
} from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

function PaymentMethodBadge({ method }: { method: Transaction["method"] }) {
  const getIcon = () => {
    switch (method) {
      case "UPI":
        return <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case "CARD":
        return <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case "WALLET":
        return <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300">
      {getIcon()}
      <span>{method}</span>
    </span>
  );
}

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="inline-flex items-center gap-1.5 group">
      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-zinc-100">
        {id}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy transaction ID"
        aria-label={`Copy transaction ID ${id}`}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-opacity"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}

export function TransactionTable({
  transactions,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onClearFilters,
  hasActiveFilters,
}: TransactionTableProps) {
  // ERROR STATE
  if (isError) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-xl p-8 my-4 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Failed to load transactions
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-md mx-auto mb-5">
          {errorMessage || "An unexpected error occurred while fetching data from the server."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs hover:shadow transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Request</span>
        </button>
      </div>
    );
  }

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        {/* Mobile skeleton */}
        <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800/80 p-3 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 animate-pulse space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
              <div className="h-5 w-36 bg-gray-200 dark:bg-zinc-700 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 w-28 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-14 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50/80 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Txn ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-zinc-800 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-zinc-800 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 my-4 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          No transactions found
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
          {hasActiveFilters
            ? "No records matched your search or status filter. Try clearing filters or using different keywords."
            : "No transactions are available at this moment."}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    );
  }

  // SUCCESS STATE WITH DATA
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
      {/* Mobile Card View (< 768px): Optimised for 360px viewport without overflow */}
      <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800/90">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <CopyableId id={tx.id} />
              <StatusBadge status={tx.status} size="sm" />
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {tx.customer}
              </span>
              <span className="text-base font-bold text-gray-900 dark:text-white shrink-0">
                {formatINR(tx.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 pt-1">
              <time dateTime={tx.date}>{formatDateTime(tx.date)}</time>
              <PaymentMethodBadge method={tx.method} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table View (>= 768px): Full tabular view with horizontal scroll protection */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800 text-left">
          <thead className="bg-gray-50/80 dark:bg-zinc-800/50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <CopyableId id={tx.id} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-zinc-300">
                  <time dateTime={tx.date}>{formatDateTime(tx.date)}</time>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {tx.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PaymentMethodBadge method={tx.method} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white text-right">
                  {formatINR(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

