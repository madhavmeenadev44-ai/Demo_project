"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { TransactionSummary } from "@/features/transactions/components/transaction-summary";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import { TransactionTable } from "@/features/transactions/components/transaction-table";
import { TransactionPagination } from "@/features/transactions/components/transaction-pagination";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";

export function TransactionsDashboard() {
  const [role, setRole] = useState<"MERCHANT" | "ADMIN">("MERCHANT");

  const {
    transactions,
    total,
    summary,
    currentPage,
    pageSize,
    searchQuery,
    statusFilter,
    isLoading,
    isError,
    errorMessage,
    isSimulatingError,
    setFilters,
    setPage,
    clearFilters,
    toggleSimulateError,
    retry,
    refetch,
  } = useTransactions();

  const handleRoleToggle = () => {
    setRole((prev) => (prev === "MERCHANT" ? "ADMIN" : "MERCHANT"));
  };

  // Optional feature: Admin CSV export of current page/filter transactions
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert("No transactions available to export.");
      return;
    }

    const headers = ["Transaction ID", "Date", "Customer", "Amount (Paise)", "Amount (INR)", "Method", "Status"];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.customer.replace(/"/g, '""')}"`,
      t.amount,
      (t.amount / 100).toFixed(2),
      t.method,
      t.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_page_${currentPage}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = Boolean(searchQuery || (statusFilter && statusFilter !== "ALL"));

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Dashboard Top Header */}
      <DashboardHeader
        role={role}
        onRoleToggle={handleRoleToggle}
        onExportCsv={handleExportCsv}
        isSimulatingError={isSimulatingError}
        onToggleSimulateError={toggleSimulateError}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* Summary Metrics Cards */}
      <TransactionSummary
        summary={summary}
        totalMatching={total}
        isLoading={isLoading}
      />

      {/* Search and Status Filters */}
      <TransactionFilters
        currentQuery={searchQuery}
        currentStatus={statusFilter}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
        isLoading={isLoading}
      />

      {/* Transactions Table & State Handlers */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={retry}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Pagination Controls */}
      {!isError && (
        <TransactionPagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

