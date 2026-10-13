import { formatINR } from "@/lib/format-currency";

export { formatINR };

/**
 * Formats an ISO date string into a consistent, readable format.
 * e.g., "12 Oct 2026, 10:30 am"
 */
export function formatDateTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return isoDate;
  }
}

/**
 * Calculates page numbers to display for pagination controls
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): (number | "...")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range: (number | "...")[] = [];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  range.push(1);

  if (start > 2) {
    range.push("...");
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (end < totalPages - 1) {
    range.push("...");
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

