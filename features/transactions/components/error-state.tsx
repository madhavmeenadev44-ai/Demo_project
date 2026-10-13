import React from "react";
import { AlertCircle } from "lucide-react";
import { RetryButton } from "@/components/retry-button";

interface ErrorStateProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export function ErrorState({ errorMessage, onRetry }: ErrorStateProps) {
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
      <RetryButton onRetry={onRetry} />
    </div>
  );
}
