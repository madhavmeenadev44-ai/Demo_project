import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getTransactions } from "@/lib/transactions-service";

export async function GET(request: NextRequest) {
  // 1. Verify session on the server
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required to access transaction summary." },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const fail = searchParams.get("fail");
  if (fail === "1") {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Simulated server failure requested via fail=1" },
      { status: 500 }
    );
  }

  try {
    const result = getTransactions({
      q: searchParams.get("q"),
      status: searchParams.get("status"),
      page: 1,
      pageSize: 1,
      fail,
    });

    return NextResponse.json({
      ...result.summary,
      total: result.total,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 }
    );
  }
}
