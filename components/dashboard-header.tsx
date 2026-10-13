import React from "react";
import { Store } from "lucide-react";
import { DashboardHeaderActions } from "@/components/dashboard-header-actions";
import { Transaction } from "@/features/transactions/types";

interface DashboardHeaderProps {
  currentTransactions?: Transaction[];
}

export function DashboardHeader({ currentTransactions = [] }: DashboardHeaderProps) {
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

        {/* Action Toolbar (Client Leaf) */}
        <DashboardHeaderActions currentTransactions={currentTransactions} />
      </div>
    </header>
  );
}
