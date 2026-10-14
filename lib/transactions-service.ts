import { MOCK_TRANSACTIONS } from "@/lib/mock-transactions";
import {
  Transaction,
  TransactionStatus,
  TransactionSummaryMetrics,
  StatusFilter,
} from "@/features/transactions/types";

export interface GetTransactionsOptions {
  q?: string | null;
  status?: string | null;
  page?: number | string | null;
  pageSize?: number | string | null;
  fail?: string | null;
}

export interface TransactionServiceResult {
  items: Transaction[];
  total: number;
  summary: TransactionSummaryMetrics;
  page: number;
  pageSize: number;
  totalPages: number;
  q: string;
  status: StatusFilter;
}

/**
 * Shared server-side transaction query engine.
 * Used by both Server Component pages and Next.js Route Handlers.
 */
export function getTransactions(options: GetTransactionsOptions = {}): TransactionServiceResult {
  // Check for simulated failure
  if (options.fail === "1") {
    throw new Error("Simulated server failure requested via fail=1");
  }

  // Sanitize and validate inputs
  const rawQ = (options.q || "").trim();
  const searchLower = rawQ.toLowerCase();

  const rawStatus = (options.status || "ALL").trim().toUpperCase();
  const validStatuses: TransactionStatus[] = ["SUCCESS", "FAILED", "PENDING"];
  const statusFilter: StatusFilter = validStatuses.includes(rawStatus as TransactionStatus)
    ? (rawStatus as TransactionStatus)
    : "ALL";

  const parsedPage = typeof options.page === "number" ? options.page : parseInt(options.page || "1", 10);
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const parsedPageSize = typeof options.pageSize === "number" ? options.pageSize : parseInt(options.pageSize || "20", 10);
  const pageSize = isNaN(parsedPageSize) || parsedPageSize < 1 ? 20 : Math.min(parsedPageSize, 100);

  // 1. Filter dataset
  let filtered = MOCK_TRANSACTIONS;

  if (searchLower) {
    filtered = filtered.filter(
      (tx) =>
        tx.id.toLowerCase().includes(searchLower) ||
        tx.customer.toLowerCase().includes(searchLower)
    );
  }

  if (statusFilter !== "ALL") {
    filtered = filtered.filter((tx) => tx.status === statusFilter);
  }

  // 2. Sort newest first
  filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 3. Calculate total count before pagination
  const total = filtered.length;

  // 4. Calculate summary metrics across ALL matching records
  const totalVolume = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const successCount = filtered.filter((tx) => tx.status === "SUCCESS").length;
  const failedCount = filtered.filter((tx) => tx.status === "FAILED").length;
  const rawSuccessRate = total > 0 ? (successCount / total) * 100 : 0;
  const successRate = parseFloat(rawSuccessRate.toFixed(2));

  const summary: TransactionSummaryMetrics = {
    totalVolume,
    successRate,
    failedCount,
  };

  // 5. Slice page
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = filtered.slice(startIndex, endIndex);

  return {
    items,
    total,
    summary,
    page,
    pageSize,
    totalPages,
    q: rawQ,
    status: statusFilter,
  };
}

