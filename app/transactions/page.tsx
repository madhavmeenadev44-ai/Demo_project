import type { Metadata } from "next";
import { getTransactions } from "@/lib/transactions-service";
import { DashboardHeader } from "@/components/dashboard-header";
import { TransactionSummary } from "@/features/transactions/components/transaction-summary";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import { TransactionTable } from "@/features/transactions/components/transaction-table";
import { TransactionPagination } from "@/features/transactions/components/transaction-pagination";
import { ErrorState } from "@/features/transactions/components/error-state";

export const metadata: Metadata = {
  title: "Merchant Transactions | Dashboard",
  description: "Monitor real-time merchant transactions, status settlement, and metrics.",
};

interface TransactionsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    pageSize?: string;
    fail?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  let isError = false;
  let errorMessage: string | undefined;
  let data;

  try {
    data = getTransactions({
      q: params.q,
      status: params.status,
      page: params.page,
      pageSize: params.pageSize,
      fail: params.fail,
    });
  } catch (err: unknown) {
    isError = true;
    errorMessage = err instanceof Error ? err.message : "Failed to load transactions";
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <DashboardHeader currentTransactions={[]} />
          <ErrorState errorMessage={errorMessage} />
        </div>
      </main>
    );
  }

  const hasActiveFilters = Boolean(data.q || (data.status && data.status !== "ALL"));

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dashboard Top Header (Server Component with isolated Client Actions) */}
        <DashboardHeader currentTransactions={data.items} />

        {/* Summary Metrics Cards (Server Component) */}
        <TransactionSummary
          summary={data.summary}
          totalMatching={data.total}
        />

        {/* Search and Status Filters (Client Leaf) */}
        <TransactionFilters
          initialQuery={data.q}
          initialStatus={data.status}
        />

        {/* Transactions Data Presentation (Server Component) */}
        <TransactionTable
          transactions={data.items}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Pagination Controls (Server Component using Link) */}
        <TransactionPagination
          currentPage={data.page}
          totalItems={data.total}
          pageSize={data.pageSize}
          q={data.q}
          status={data.status}
          fail={params.fail}
        />
      </div>
    </main>
  );
}
