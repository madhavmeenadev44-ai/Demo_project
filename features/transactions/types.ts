export type PaymentMethod = "UPI" | "CARD" | "WALLET";

export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface Transaction {
  id: string;
  date: string;
  customer: string;
  amount: number; // Integer in paise
  method: PaymentMethod;
  status: TransactionStatus;
}

export interface TransactionSummaryMetrics {
  totalVolume: number; // Sum of amounts in paise
  successRate: number; // Percentage 0 - 100 (e.g. 78.5)
  failedCount: number; // Number of failed transactions
}

export interface TransactionsResponse {
  items: Transaction[];
  total: number;
  summary?: TransactionSummaryMetrics;
}

export type StatusFilter = "ALL" | TransactionStatus;

export interface TransactionFilterParams {
  q?: string;
  status?: StatusFilter;
  page?: number;
  pageSize?: number;
  fail?: string;
}

