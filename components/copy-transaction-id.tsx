"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyTransactionIdProps {
  id: string;
}

export function CopyTransactionId({ id }: CopyTransactionIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 group">
      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-zinc-100">
        {id}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy transaction ID"
        aria-label={`Copy transaction ID ${id}`}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-opacity cursor-pointer"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
