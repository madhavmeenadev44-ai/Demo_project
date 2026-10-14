import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getTransactions } from "@/lib/transactions-service";

/**
 * Sanitizes a field according to RFC 4180 and protects against Spreadsheet Formula Injection.
 * Prefixes formula characters (=, +, -, @) with a single quote (') and escapes quotes.
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value);

  // Mitigate Formula Injection in Excel / Google Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape quotes and wrap in quotes if containing comma, quote, or newline
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export async function GET(request: NextRequest) {
  // 1. Verify session on the server
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required to export transactions." },
      { status: 401 }
    );
  }

  // 2. Authorize role: only ADMIN is allowed to export CSV
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden", message: "Admin role required to export transactions." },
      { status: 403 }
    );
  }

  // 3. Extract active filter parameters
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");
  const status = searchParams.get("status");

  // 4. Retrieve ALL matching transactions (pageSize: 100000)
  const result = getTransactions({
    q,
    status,
    page: 1,
    pageSize: 100000,
  });

  // 5. Generate CSV content
  const headers = [
    "Transaction ID",
    "Date",
    "Customer",
    "Amount (INR)",
    "Payment Method",
    "Status",
  ];

  const rows = result.items.map((tx) => [
    escapeCsvCell(tx.id),
    escapeCsvCell(tx.date),
    escapeCsvCell(tx.customer),
    escapeCsvCell((tx.amount / 100).toFixed(2)),
    escapeCsvCell(tx.method),
    escapeCsvCell(tx.status),
  ]);

  const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];
  const csvContent = csvLines.join("\r\n");

  const todayStr = new Date().toISOString().slice(0, 10);
  const filename = `transactions-${todayStr}.csv`;

  // 6. Return response with download headers
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

