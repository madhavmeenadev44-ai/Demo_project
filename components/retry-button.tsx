"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface RetryButtonProps {
  onRetry?: () => void;
  className?: string;
}

export function RetryButton({ onRetry, className }: RetryButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs hover:shadow transition-colors cursor-pointer"
      }
    >
      <RotateCcw className="w-4 h-4" />
      <span>Retry Request</span>
    </button>
  );
}

