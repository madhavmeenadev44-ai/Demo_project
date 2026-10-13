import React from "react";
import { Transaction } from "@/features/transactions/types";
import { TransactionRow, TransactionMobileCard } from "@/features/transactions/components/transaction-row";
import { EmptyState } from "@/features/transactions/components/empty-state";

interface TransactionTableProps {
  transactions: Transaction[];
  hasActiveFilters: boolean;
}

export function TransactionTable({
  transactions,
  hasActiveFilters,
}: TransactionTableProps) {
  // EMPTY STATE
  if (transactions.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} />;
  }

  // SUCCESS STATE WITH DATA (Server Component)
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
      {/* Mobile Card View (< 768px): Optimised for 360px viewport without overflow */}
      <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800/90">
        {transactions.map((tx) => (
          <TransactionMobileCard key={tx.id} transaction={tx} />
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
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
