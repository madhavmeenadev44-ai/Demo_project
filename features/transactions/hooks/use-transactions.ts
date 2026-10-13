import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  StatusFilter,
  Transaction,
  TransactionSummaryMetrics,
  TransactionsResponse,
} from "@/features/transactions/types";

interface UseTransactionsResult {
  transactions: Transaction[];
  total: number;
  summary?: TransactionSummaryMetrics;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: StatusFilter;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isSimulatingError: boolean;
  setFilters: (updates: { q?: string; status?: StatusFilter }) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
  toggleSimulateError: () => void;
  retry: () => void;
  refetch: () => void;
}

const PAGE_SIZE = 20;

export function useTransactions(): UseTransactionsResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse state from active URL query parameters
  const searchQuery = searchParams.get("q") || "";
  const rawStatus = (searchParams.get("status") || "ALL").toUpperCase();
  const statusFilter: StatusFilter =
    rawStatus === "SUCCESS" || rawStatus === "FAILED" || rawStatus === "PENDING"
      ? (rawStatus as StatusFilter)
      : "ALL";

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const isSimulatingError = searchParams.get("fail") === "1";

  // Data and UI states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<TransactionSummaryMetrics | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  // Track active fetch to cancel stale requests and avoid race conditions
  const activeAbortController = useRef<AbortController | null>(null);

  // Helper to push URL updates cleanly
  const updateUrl = useCallback(
    (params: { q?: string; status?: StatusFilter; page?: number; fail?: boolean }) => {
      const sp = new URLSearchParams();

      const newQ = params.q !== undefined ? params.q.trim() : searchQuery.trim();
      const newStatus = params.status !== undefined ? params.status : statusFilter;
      const newPage = params.page !== undefined ? params.page : currentPage;
      const newFail = params.fail !== undefined ? params.fail : isSimulatingError;

      if (newQ) sp.set("q", newQ);
      if (newStatus && newStatus !== "ALL") sp.set("status", newStatus);
      if (newPage > 1) sp.set("page", newPage.toString());
      if (newFail) sp.set("fail", "1");

      const queryString = sp.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [router, pathname, searchQuery, statusFilter, currentPage, isSimulatingError]
  );

  // Update filters (resets page to 1 as per requirements)
  const setFilters = useCallback(
    (updates: { q?: string; status?: StatusFilter }) => {
      updateUrl({
        ...updates,
        page: 1, // Filter changes reset page to 1
      });
    },
    [updateUrl]
  );

  // Update page
  const setPage = useCallback(
    (page: number) => {
      updateUrl({ page });
    },
    [updateUrl]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    updateUrl({ q: "", status: "ALL", page: 1 });
  }, [updateUrl]);

  // Toggle fail=1 parameter
  const toggleSimulateError = useCallback(() => {
    updateUrl({ fail: !isSimulatingError });
  }, [updateUrl, isSimulatingError]);

  // Manual retry / refetch
  const retry = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  const refetch = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  // Effect to fetch transactions whenever URL parameters or retry trigger change
  useEffect(() => {
    // Abort previous in-flight request if any
    if (activeAbortController.current) {
      activeAbortController.current.abort();
    }

    const abortController = new AbortController();
    activeAbortController.current = abortController;

    const executeFetch = async () => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(undefined);

      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set("q", searchQuery);
        if (statusFilter !== "ALL") queryParams.set("status", statusFilter);
        queryParams.set("page", currentPage.toString());
        queryParams.set("pageSize", PAGE_SIZE.toString());
        if (isSimulatingError) queryParams.set("fail", "1");

        const response = await fetch(`/api/transactions?${queryParams.toString()}`, {
          signal: abortController.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          let errText = `HTTP Error ${response.status}: ${response.statusText}`;
          try {
            const errJson = await response.json();
            if (errJson.message) errText = errJson.message;
            else if (errJson.error) errText = errJson.error;
          } catch {
            // response was not JSON
          }
          throw new Error(errText);
        }

        const data: TransactionsResponse = await response.json();

        // Successful response - update state
        setTransactions(data.items || []);
        setTotal(data.total || 0);
        setSummary(data.summary);
        setIsLoading(false);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Request was aborted due to newer input; do nothing
          return;
        }

        const message = err instanceof Error ? err.message : "Failed to load transactions";
        setIsError(true);
        setErrorMessage(message);
        setIsLoading(false);
      }
    };

    executeFetch();

    return () => {
      abortController.abort();
    };
  }, [searchQuery, statusFilter, currentPage, isSimulatingError, fetchTrigger]);

  return {
    transactions,
    total,
    summary,
    currentPage,
    pageSize: PAGE_SIZE,
    searchQuery,
    statusFilter,
    isLoading,
    isError,
    errorMessage,
    isSimulatingError,
    setFilters,
    setPage,
    clearFilters,
    toggleSimulateError,
    retry,
    refetch,
  };
}

