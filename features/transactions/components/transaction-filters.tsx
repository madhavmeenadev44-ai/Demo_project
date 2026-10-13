import React, { useEffect, useState } from "react";
import { StatusFilter } from "@/features/transactions/types";
import { Search, X, Filter, RotateCcw } from "lucide-react";

interface TransactionFiltersProps {
  currentQuery: string;
  currentStatus: StatusFilter;
  onFilterChange: (updates: { q?: string; status?: StatusFilter }) => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
  { label: "Pending", value: "PENDING" },
];

export function TransactionFilters({
  currentQuery,
  currentStatus,
  onFilterChange,
  onClearFilters,
  isLoading,
}: TransactionFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [prevQuery, setPrevQuery] = useState(currentQuery);

  // Synchronize internal search input when URL/prop changes (e.g. browser back/forward, clear)
  if (currentQuery !== prevQuery) {
    setPrevQuery(currentQuery);
    setSearchTerm(currentQuery);
  }

  // Debounce user keystrokes by ~300ms
  useEffect(() => {
    // Only fire update if searchTerm changed from currentQuery
    if (searchTerm === currentQuery) return;

    const timer = setTimeout(() => {
      onFilterChange({ q: searchTerm });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, currentQuery, onFilterChange]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as StatusFilter;
    onFilterChange({ status: newStatus });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onFilterChange({ q: "" });
  };

  const hasActiveFilters = Boolean(currentQuery || (currentStatus && currentStatus !== "ALL"));

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID (e.g. TXN100001) or customer..."
            aria-label="Search transactions"
            className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={currentStatus}
              onChange={handleStatusChange}
              aria-label="Filter transactions by status"
              className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
          <span className="font-medium">Active filters:</span>
          {currentQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
              Query: &quot;{currentQuery}&quot;
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:text-indigo-900 dark:hover:text-indigo-100"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentStatus && currentStatus !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
              Status: {currentStatus}
              <button
                type="button"
                onClick={() => onFilterChange({ status: "ALL" })}
                className="hover:text-indigo-900 dark:hover:text-indigo-100"
                aria-label="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

