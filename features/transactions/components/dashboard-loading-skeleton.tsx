import React from "react";

export function DashboardLoadingSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-800 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-100 dark:bg-zinc-800/60 rounded"></div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-800 rounded mb-3"></div>
            <div className="h-7 w-28 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="h-14 bg-gray-100 dark:bg-zinc-800 rounded-xl mb-6"></div>

      {/* Table skeleton */}
      <div className="h-96 bg-gray-100 dark:bg-zinc-800 rounded-xl"></div>
    </div>
  );
}

