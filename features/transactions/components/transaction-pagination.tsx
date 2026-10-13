import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationRange } from "@/features/transactions/utils";
import { StatusFilter } from "@/features/transactions/types";

interface TransactionPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  q?: string;
  status?: StatusFilter;
  fail?: string;
}

export function TransactionPagination({
  currentPage,
  totalItems,
  pageSize,
  q,
  status,
  fail,
}: TransactionPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const paginationRange = getPaginationRange(currentPage, totalPages);

  function getPageUrl(targetPage: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "ALL") params.set("status", status);
    if (targetPage > 1) params.set("page", targetPage.toString());
    if (fail === "1") params.set("fail", "1");

    const queryStr = params.toString();
    return queryStr ? `/transactions?${queryStr}` : "/transactions";
  }

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
        {/* Previous Button / Link */}
        {canGoPrevious ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            aria-label="Go to previous page"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 opacity-40 cursor-not-allowed select-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </span>
        )}

        {/* Page Number Links */}
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

            if (isCurrent) {
              return (
                <span
                  key={`page-${page}`}
                  aria-current="page"
                  className="min-w-8 h-8 px-2 flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow-xs select-none"
                >
                  {page}
                </span>
              );
            }

            return (
              <Link
                key={`page-${page}`}
                href={getPageUrl(page)}
                aria-label={`Go to page ${page}`}
                className="min-w-8 h-8 px-2 flex items-center justify-center text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                {page}
              </Link>
            );
          })}
        </div>

        {/* Next Button / Link */}
        {canGoNext ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            aria-label="Go to next page"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 opacity-40 cursor-not-allowed select-none"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
