import React from "react";
import { Transaction } from "@/features/transactions/types";
import { formatINR, formatDateTime } from "@/features/transactions/utils";
import { StatusBadge } from "@/components/status-badge";
import { CopyTransactionId } from "@/components/copy-transaction-id";
import { CreditCard, Smartphone, Wallet } from "lucide-react";

export function PaymentMethodBadge({ method }: { method: Transaction["method"] }) {
  const getIcon = () => {
    switch (method) {
      case "UPI":
        return <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case "CARD":
        return <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case "WALLET":
        return <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300">
      {getIcon()}
      <span>{method}</span>
    </span>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction: tx }: TransactionRowProps) {
  return (
    <tr className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <CopyTransactionId id={tx.id} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-zinc-300">
        <time dateTime={tx.date}>{formatDateTime(tx.date)}</time>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {tx.customer}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <PaymentMethodBadge method={tx.method} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={tx.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white text-right">
        {formatINR(tx.amount)}
      </td>
    </tr>
  );
}

export function TransactionMobileCard({ transaction: tx }: TransactionRowProps) {
  return (
    <div className="p-4 hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <CopyTransactionId id={tx.id} />
        <StatusBadge status={tx.status} size="sm" />
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {tx.customer}
        </span>
        <span className="text-base font-bold text-gray-900 dark:text-white shrink-0">
          {formatINR(tx.amount)}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 pt-1">
        <time dateTime={tx.date}>{formatDateTime(tx.date)}</time>
        <PaymentMethodBadge method={tx.method} />
      </div>
    </div>
  );
}
