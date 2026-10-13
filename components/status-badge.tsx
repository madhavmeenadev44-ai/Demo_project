import React from "react";
import { TransactionStatus } from "@/features/transactions/types";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: TransactionStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const isSmall = size === "sm";

  switch (status) {
    case "SUCCESS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 ${
            isSmall ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
          }`}
        >
          <CheckCircle2 className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Success</span>
        </span>
      );

    case "FAILED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 ${
            isSmall ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
          }`}
        >
          <XCircle className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Failed</span>
        </span>
      );

    case "PENDING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 ${
            isSmall ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
          }`}
        >
          <Clock className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Pending</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-200">
          {status}
        </span>
      );
  }
}

