import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/transactions-service";
import { TransactionsResponse } from "@/features/transactions/types";

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

  try {
    // 3. Delegate to shared service
    const result = getTransactions({
      q: searchParams.get("q"),
      status: searchParams.get("status"),
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      fail,
    });

    const responsePayload: TransactionsResponse = {
      items: result.items,
      total: result.total,
      summary: result.summary,
    };

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 }
    );
  }
}
