import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationRange } from "@/features/transactions/utils";

interface TransactionPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
}

export function TransactionPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  isLoading,
}: TransactionPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  const canGoPrevious = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < totalPages && !isLoading;

  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1">
      {/* Result Count Info */}
      <div className="text-sm text-gray-600 dark:text-zinc-400 text-center sm:text-left">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {startRecord}
        </span>
        –
        <span className="font-semibold text-gray-900 dark:text-white">
          {endRecord}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalItems}
        </span>{" "}
        transactions
      </div>

      {/* Pagination Controls */}
      <nav
        aria-label="Pagination navigation"
        className="flex items-center gap-1 sm:gap-1.5"
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Go to previous page"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {paginationRange.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-xs text-gray-400 select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={isLoading || isCurrent}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Go to page ${page}`}
                className={`min-w-8 h-8 px-2 flex items-center justify-center text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  isCurrent
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-40"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Go to next page"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}

