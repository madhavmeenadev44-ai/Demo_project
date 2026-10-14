import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getTransactions } from "@/lib/transactions-service";
import { TransactionsResponse } from "@/features/transactions/types";

export async function GET(request: NextRequest) {
  // 1. Verify session on the server
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required to access transactions." },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  // 2. Check for simulated failure
  const fail = searchParams.get("fail");
  if (fail === "1") {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Simulated server failure requested via fail=1" },
      { status: 500 }
    );
  }

  // 3. Artificial delay of ~600ms to simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    // 4. Delegate to shared service
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
