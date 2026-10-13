import { Suspense } from "react";
import type { Metadata } from "next";
import { TransactionsDashboard } from "@/features/transactions/components/transactions-dashboard";
import { DashboardLoadingSkeleton } from "@/features/transactions/components/dashboard-loading-skeleton";

export const metadata: Metadata = {
  title: "Merchant Transactions | Dashboard",
  description: "Monitor real-time merchant transactions, status settlement, and metrics.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <TransactionsDashboard />
      </Suspense>
    </main>
  );
}
