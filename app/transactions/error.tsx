"use client";

import React, { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ErrorState } from "@/features/transactions/components/error-state";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TransactionsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors
    console.error("Transactions segment error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <DashboardHeader />
        <ErrorState
          errorMessage={error.message || "An unexpected error occurred."}
          onRetry={reset}
        />
      </div>
    </main>
  );
}

