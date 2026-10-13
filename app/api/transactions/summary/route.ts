import { NextRequest, NextResponse } from "next/server";
import { MOCK_TRANSACTIONS } from "@/lib/mock-transactions";
import {
  TransactionStatus,
  TransactionSummaryMetrics,
} from "@/features/transactions/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const fail = searchParams.get("fail");
  if (fail === "1") {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Simulated server failure requested via fail=1" },
      { status: 500 }
    );
  }

  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const statusParam = (searchParams.get("status") || "").trim().toUpperCase();

  const validStatuses: TransactionStatus[] = ["SUCCESS", "FAILED", "PENDING"];
  const statusFilter = validStatuses.includes(statusParam as TransactionStatus)
    ? (statusParam as TransactionStatus)
    : null;

  let filtered = MOCK_TRANSACTIONS;

  if (q) {
    filtered = filtered.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.customer.toLowerCase().includes(q)
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((tx) => tx.status === statusFilter);
  }

  const total = filtered.length;
  const totalVolume = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const successCount = filtered.filter((tx) => tx.status === "SUCCESS").length;
  const failedCount = filtered.filter((tx) => tx.status === "FAILED").length;
  const successRate = total > 0 ? (successCount / total) * 100 : 0;

  const summary: TransactionSummaryMetrics & { total: number } = {
    totalVolume,
    successRate: parseFloat(successRate.toFixed(2)),
    failedCount,
    total,
  };

  return NextResponse.json(summary);
}
