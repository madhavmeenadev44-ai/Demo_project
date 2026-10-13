import { NextRequest, NextResponse } from "next/server";
import { MOCK_TRANSACTIONS } from "@/lib/mock-transactions";
import {
  Transaction,
  TransactionStatus,
  TransactionSummaryMetrics,
  TransactionsResponse,
} from "@/features/transactions/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // 1. Check for simulated failure
  const fail = searchParams.get("fail");
  if (fail === "1") {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Simulated server failure requested via fail=1" },
      { status: 500 }
    );
  }

  // 2. Artificial delay of ~600ms to simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // 3. Extract and sanitize query parameters
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const statusParam = (searchParams.get("status") || "").trim().toUpperCase();

  const validStatuses: TransactionStatus[] = ["SUCCESS", "FAILED", "PENDING"];
  const statusFilter = validStatuses.includes(statusParam as TransactionStatus)
    ? (statusParam as TransactionStatus)
    : null;

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawPageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const pageSize = isNaN(rawPageSize) || rawPageSize < 1 ? 20 : Math.min(rawPageSize, 100);

  // 4. Filter dataset
  let filtered = MOCK_TRANSACTIONS;

  // Search by transaction ID or customer name case-insensitively
  if (q) {
    filtered = filtered.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.customer.toLowerCase().includes(q)
    );
  }

  // Filter by status if provided
  if (statusFilter) {
    filtered = filtered.filter((tx) => tx.status === statusFilter);
  }

  // 5. Ensure sorted newest first
  filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 6. Calculate total matching count before pagination
  const total = filtered.length;

  // 7. Calculate aggregate summary metrics across ALL matching records
  const totalVolume = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const successCount = filtered.filter((tx) => tx.status === "SUCCESS").length;
  const failedCount = filtered.filter((tx) => tx.status === "FAILED").length;
  const successRate = total > 0 ? (successCount / total) * 100 : 0;

  const summary: TransactionSummaryMetrics = {
    totalVolume,
    successRate: parseFloat(successRate.toFixed(2)),
    failedCount,
  };

  // 8. Calculate requested page slice
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items: Transaction[] = filtered.slice(startIndex, endIndex);

  // 9. Return JSON response
  const responsePayload: TransactionsResponse = {
    items,
    total,
    summary,
  };

  return NextResponse.json(responsePayload);
}
