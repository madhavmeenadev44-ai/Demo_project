import React from "react";
import Link from "next/link";
import { SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  hasActiveFilters: boolean;
}

export function EmptyState({ hasActiveFilters }: EmptyStateProps) {
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
        <Link
          href="/transactions"
          role="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear Filters</span>
        </Link>
      )}
    </div>
  );
}
