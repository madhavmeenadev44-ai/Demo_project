# Merchant Transactions Dashboard

**Role:** Frontend Engineer (React / Next.js)  
**Assessment:** FE-01 — Merchant Transactions Dashboard  
**Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, Playwright

---

## 1. Project Overview

A responsive, production-ready merchant transactions dashboard that enables merchants to inspect real-time transaction volume, track settlement rates, search by transaction ID or customer name, filter by status, and navigate paginated records.

All data filtering, sorting, status matching, and pagination are executed server-side via Next.js App Router API route handlers (`/api/transactions`).

---

## 2. Quick Start & Setup

### Prerequisites
- Node.js >= 20 (Tested on Node.js v24.15.0)
- npm >= 10 (Tested on npm 11.12.1)

### Installation & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/transactions](http://localhost:3000/transactions).

3. **Production build and start:**
   ```bash
   npm run build
   npm run start
   ```

4. **Run automated end-to-end tests (Playwright):**
   ```bash
   npm run test
   ```

---

## 3. Architecture & Features

### Mandatory Requirements Completed
- **Deterministic Mock Dataset:** 200 stable, realistic transactions generated with a seeded PRNG (`lib/mock-transactions.ts`) containing IDs, ISO dates, customer names, integer amounts in paise, payment methods (`UPI`, `CARD`, `WALLET`), and statuses (`SUCCESS`, `FAILED`, `PENDING`).
- **Server-Side API Handler (`GET /api/transactions`):**
  - Search by transaction ID or customer name (case-insensitive).
  - Status filtering (`SUCCESS`, `FAILED`, `PENDING`).
  - Sorted newest first.
  - Page slicing defaulting to 20 records per page.
  - Returns `{ items, total, summary }` where `total` and `summary` reflect the entire filtered result set prior to pagination.
  - Simulated latency of ~600 ms.
  - HTTP 500 JSON error simulation when `fail=1` is provided.
  - Companion aggregate endpoint at `/api/transactions/summary` for independent summary queries.
- **Summary Metrics:**
  - **Total Volume:** Sum of paise across all matching records, formatted as INR (`₹...`).
  - **Success Rate:** Percentage of successful transactions across all matching records (`(successCount / total) * 100`).
  - **Failed Transactions:** Count of failed transactions in the filtered dataset.
  - Handles 0 matching transactions without division by zero.
- **URL-Persisted State:**
  - Search query `q`, status filter `status`, and page number `page` are stored directly in URL search parameters.
  - Refreshing or sharing the URL reconstructs the exact state.
  - Browser Back and Forward navigation updates UI and fetches data automatically.
  - Filter modifications automatically reset the page to 1.
  - Search input is debounced by ~300 ms.
- **Loading, Empty, and Error States:**
  - Loading skeleton indicators for cards and table/list rows.
  - Race condition prevention using `AbortController` to discard stale in-flight requests.
  - "No transactions found" empty state with a "Clear Filters" action.
  - Error state with visible messaging and a functioning "Retry Request" button.
  - Development toolbar with a "Simulate 500" toggle to test error handling and retry mechanisms directly.
- **Mobile Responsiveness at 360 px:**
  - Zero page-level horizontal overflow at 360 px width.
  - Responsive layout: clean, readable transaction cards on mobile viewports (< 768 px) and full wide tabular view with overflow protection on desktop/tablet.
  - Vertically stacked summary cards on mobile screens.

### Optional Features Implemented
1. **Mock Role Toggle & Admin CSV Export:**
   - Header allows toggling between `MERCHANT` and `ADMIN` roles.
   - When role is `ADMIN`, an "Export CSV" action is enabled that generates and downloads a formatted CSV of active transaction records.
2. **Automated Playwright Test Suite:**
   - 14 automated tests running across desktop Chrome and mobile (360 px viewport) testing search, status filter, page reset, URL persistence, empty states, HTTP 500 retry, and 360 px viewport overflow prevention.

---

## 4. Assessment Questions

### Question 1: Which parts are Server Components and which are Client Components, and why?

In our Next.js App Router architecture:

- **Server Components:**
  - **`app/layout.tsx` (Root Layout):** Static container providing global fonts, metadata, and body shell. Kept as a Server Component to avoid shipping unnecessary React hydration JavaScript to the client.
  - **`app/transactions/page.tsx` & `app/page.tsx` (Page Shells):** Serve as server-rendered entry points. They render the page metadata and wrap interactive client components within a `<Suspense fallback={<DashboardLoadingSkeleton />}>` boundary.
  - **`app/api/transactions/route.ts` & `app/api/transactions/summary/route.ts` (API Routes):** Execute entirely on the server runtime, handling parameter sanitization, latency simulation, sorting, filtering, and page slicing before returning JSON.

- **Client Components (`"use client"`):**
  - **`TransactionsDashboard` (`features/transactions/components/transactions-dashboard.tsx`):** Coordinates client-side interaction, role toggling, and CSV export.
  - **`TransactionFilters` (`features/transactions/components/transaction-filters.tsx`):** Manages user keystrokes, debounced input timers, and DOM input events.
  - **`TransactionTable` (`features/transactions/components/transaction-table.tsx`):** Handles clipboard copy state for transaction IDs and error retry callbacks.
  - **`TransactionPagination` (`features/transactions/components/transaction-pagination.tsx`):** Handles pagination click events and page range calculation.
  - **`DashboardHeader` (`components/dashboard-header.tsx`):** Handles developer error simulation toggle and manual refresh triggers.
  - **`useTransactions` hook (`features/transactions/hooks/use-transactions.ts`):** Uses Next.js navigation hooks (`useSearchParams`, `usePathname`, `useRouter`) to synchronize URL query parameters with active fetches and manages `AbortController` lifecycles.

**Why this separation?**  
Next.js App Router enforces that components reading search parameters and listening to browser events execute on the client. Keeping the page shell and layout on the server optimizes initial page weight and enables streaming hydration via React Suspense, while confining interactive state to dedicated client leaf components.

---

### Question 2: What would you change for one million transactions instead of 200?

If scaling from 200 mock in-memory records to one million (1,000,000+) real-world transactions:

1. **Database & Indexing:**
   - Move from in-memory arrays to a relational database (e.g., PostgreSQL).
   - Create composite B-Tree indexes matching filter query patterns:
     - `CREATE INDEX idx_transactions_merchant_date ON transactions(merchant_id, date DESC);`
     - `CREATE INDEX idx_transactions_merchant_status_date ON transactions(merchant_id, status, date DESC);`
   - Use Trigram (`pg_trgm`) or GIN full-text search indexes on `customer_name` and `transaction_id` for case-insensitive substring searching (`ILIKE` / `to_tsvector`), avoiding full table scans.

2. **Server-Side Aggregations & Precomputed Metrics:**
   - Summing 1,000,000 rows (`SUM(amount)`, `COUNT(*)`) on every filter request introduces high latency.
   - For unfiltered or time-bucketed metrics, use materialized views or Redis/worker aggregations updated via event streams (e.g., Kafka / Debezium CDC).
   - For filtered queries, execute aggregate queries within SQL (`SELECT COUNT(*), SUM(amount), COUNT(*) FILTER (WHERE status = 'SUCCESS') FROM transactions WHERE ...`) rather than loading raw entities into application memory.

3. **Pagination Strategy (Offset vs. Keyset / Cursor):**
   - High `OFFSET` values (e.g., `OFFSET 500000 LIMIT 20`) require the database engine to scan and discard 500,000 records.
   - Switch to **cursor-based (keyset) pagination** using `(date, id)` tuples:  
     `WHERE (date, id) < ($last_date, $last_id) ORDER BY date DESC, id DESC LIMIT 20`. This performs an instant index seek regardless of depth.

4. **Caching & Read Replicas:**
   - Direct read traffic to read-replica database pools.
   - Cache frequent query results (e.g., page 1 of default view) with a short TTL (10–30s) or invalidation tags via Redis / Next.js Data Cache.

5. **Observability & Query Profiling:**
   - Monitor `pg_stat_statements` for slow queries.
   - Use OpenTelemetry / APM to measure API p95/p99 latencies under load.

---

## 5. Skipped Work

The following optional features were skipped to prioritize correctness and the 3-hour assessment budget:

1. **Date-Range Filter:**
   - *How to implement:* Add `startDate` and `endDate` date-picker inputs, pass ISO string bounds into URL parameters `from` and `to`, and filter via `WHERE date BETWEEN $start AND $end`.
2. **Daily Transaction Volume Chart:**
   - *How to implement:* Group filtered transactions by `YYYY-MM-DD`, calculate daily total volume in paise, and render using a lightweight SVG charting component or Recharts.
3. **Persistent Mock Authentication & Session JWTs:**
   - *How to implement:* Add NextAuth / iron-session cookie-based authentication with role-based route middleware to protect admin routes. (A mock role toggle was included to demonstrate the admin-only CSV export feature).

---

## 6. Verification Checklist

- [x] Approximately 200 deterministic transactions generated with all 6 required fields.
- [x] Amounts stored as integer paise and formatted with `formatINR`.
- [x] Case-insensitive search on ID and customer name in route handler.
- [x] Status filter executed in route handler.
- [x] Sort by date (newest first).
- [x] Pagination with default 20 records per page.
- [x] Total calculated prior to page slice.
- [x] 600 ms artificial delay and `fail=1` HTTP 500 simulation.
- [x] Summary metrics calculate volume, success rate, and failed count across all matching records.
- [x] URL state persistence (`q`, `status`, `page`).
- [x] Loading, empty, and error/retry states.
- [x] Responsive layout verified at 360 px viewport.
- [x] Production build passes (`npm run build`).
- [x] 14/14 automated Playwright tests pass (`npm run test`).
