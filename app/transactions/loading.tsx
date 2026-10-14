import React from "react";
import { DashboardLoadingSkeleton } from "@/features/transactions/components/dashboard-loading-skeleton";

export default function TransactionsLoading() {
  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
      <DashboardLoadingSkeleton />
    </main>
  );
}

