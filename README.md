# Merchant Transactions Dashboard

**Role:** Frontend Engineer (React / Next.js)  
**Assessment:** FE-01 — Merchant Transactions Dashboard  
**Architecture:** Server-First Next.js App Router  
**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Playwright

---

## 1. Project Overview

A responsive, production-ready merchant transactions dashboard designed according to **Server-First Next.js App Router principles**.

The dashboard page and all display-only components are **Server Components by default**, streaming HTML directly from the server. Filter inputs, clipboard copy interactions, and header developer controls are isolated in leaf **Client Components** only where client-side interactivity is strictly required.

All transaction searching, status filtering, newest-first sorting, metric aggregation, and pagination are handled by a shared server-side transaction engine (`lib/transactions-service.ts`) used by both the Server Component page and the mock API route (`GET /api/transactions`).

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

## 3. Server-First Architecture & Component Boundaries

### Component Hierarchy & Rendering Strategy

| Component / Module | Target Boundary | Purpose |
| --- | --- | --- |
| `app/layout.tsx` | **Server Component** | Static root shell with global font configuration and base styling. |
| `app/page.tsx` | **Server Component** | Route entry point performing static redirect to `/transactions`. |
| `app/transactions/page.tsx` | **Server Component** | Asynchronous page that awaits URL `searchParams`, invokes the shared server query service, and renders display components without client wrapper overhead. |
| `app/transactions/loading.tsx` | **Server Component** | Route-level streaming skeleton fallback during page transitions. |
| `app/transactions/error.tsx` | **Client Component** | Segment error boundary required by Next.js conventions with recovery `reset()` action. |
| `DashboardHeader` | **Server Component** | Renders static title, description, and shell layout. |
| `DashboardHeaderActions` | **Client Component** | Small leaf component managing role toggle (`MERCHANT` vs `ADMIN`), CSV export, and `fail=1` error simulation toggle. |
| `TransactionSummary` | **Server Component** | Pure display component calculating and presenting filtered metrics. |
| `SummaryCard` | **Server Component** | Individual statistic card presentation. |
| `TransactionFilters` | **Client Component** | Controlled input with debounced typing (~300 ms), status dropdown, and Next.js `useRouter` / `usePathname` / `useSearchParams` URL updates. |
| `TransactionTable` | **Server Component** | Renders desktop table and mobile card list markup on the server. |
| `TransactionRow` & `TransactionMobileCard` | **Server Component** | Pure server-rendered row and card components. |
| `StatusBadge` | **Server Component** | Pure SVG and CSS status badge for `SUCCESS`, `FAILED`, and `PENDING`. |
| `CopyTransactionId` | **Client Component** | Leaf component isolating `navigator.clipboard` write and brief copied state. |
| `EmptyState` | **Server Component** | Renders "No transactions found" with server `<Link href="/transactions" role="button">` clear action. |
| `ErrorState` | **Server Component** | Displays error details and embeds the `RetryButton` client leaf. |
| `RetryButton` | **Client Component** | Isolated button triggering `router.refresh()` or error boundary retry. |
| `TransactionPagination` | **Server Component** | Generates Next.js `<Link>` elements preserving active query parameters without client state. |
| `app/api/transactions/route.ts` | **Server Route Handler** | API endpoint implementing search, filter, sorting, pagination, and ~600 ms simulated delay. |
| `lib/transactions-service.ts` | **Server Service** | Shared query and aggregation engine used by both page and API routes. |

---

## 4. Assessment Questions

### Question 1: Which parts are Server Components and which are Client Components, and why?

**Actual Implementation:**
- **The transactions page (`app/transactions/page.tsx`) is a Server Component.** It directly awaits the asynchronous `searchParams` Promise (in Next.js 16) and queries the shared server-side service (`getTransactions()`). It does not make an extraneous HTTP request back to itself, avoiding network serialization and waterfall delays.
- **Display-only components are Server Components:** `DashboardHeader`, `TransactionSummary`, `SummaryCard`, `TransactionTable`, `TransactionRow`, `StatusBadge`, and `EmptyState` are pure Server Components. They do not ship any JavaScript bundle to the browser for rendering.
- **Pagination is a Server Component:** `TransactionPagination` computes query URLs and renders standard Next.js `<Link>` elements, eliminating the need for client state or event handlers.
- **Client Components are kept to the smallest possible leaf boundaries:**
  - `TransactionFilters` uses `"use client"` because it handles controlled DOM typing events, debouncing timers, and URL query updates via `router.push()`.
  - `CopyTransactionId` uses `"use client"` exclusively for browser clipboard access (`navigator.clipboard`).
  - `DashboardHeaderActions` uses `"use client"` for role state switching and browser CSV downloads.
  - `RetryButton` uses `"use client"` to trigger `router.refresh()` on click.
  - `app/transactions/error.tsx` uses `"use client"` as required by Next.js error boundary specifications.

**Why this separation?**  
This adheres to the core philosophy of React Server Components: maximize initial HTML streaming, reduce client bundle size, eliminate client-side data fetching waterfalls, and introduce interactive client boundaries only where event listeners or browser APIs are genuinely needed.

---

### Question 2: What would you change for one million transactions instead of 200?

Scaling from 200 mock in-memory records to one million (1,000,000+) real-world transactions requires fundamental architectural shifts:

1. **Database-Level Filtering and Indexing:**
   - In-memory JavaScript arrays (`Array.filter` / `Array.slice`) cannot handle 1,000,000 records without catastrophic memory usage and CPU saturation.
   - Transition to a relational database (e.g., PostgreSQL) with tailored indexes:
     - Composite index: `CREATE INDEX idx_merchant_status_date ON transactions(merchant_id, status, date DESC);`
     - Full-text search or trigram index: `CREATE INDEX idx_transactions_search ON transactions USING gin(customer gin_trgm_ops, id gin_trgm_ops);` to ensure case-insensitive substring search runs via index seeks rather than full table scans.

2. **Keyset / Cursor-Based Pagination:**
   - Offset pagination (`OFFSET 500000 LIMIT 20`) forces the database to scan and discard 500,000 rows.
   - Switch to **keyset pagination** using `(date, id)` tuples:  
     `WHERE (date, id) < ($last_date, $last_id) ORDER BY date DESC, id DESC LIMIT 20`. This ensures $O(1)$ constant-time page access regardless of how deep the merchant browses.

3. **Server-Side Aggregate Calculations:**
   - Instead of calculating `totalVolume` and `successRate` across 1,000,000 rows on every request, execute targeted SQL aggregations:  
     `SELECT COUNT(*), SUM(amount), COUNT(*) FILTER (WHERE status = 'SUCCESS') FROM transactions WHERE ...`
   - For global/unfiltered merchant dashboard summaries, maintain precomputed materialized views or cache counters in Redis, incrementally updated via CDC (Change Data Capture) or background workers.

4. **Multi-Tier Caching & Read Replicas:**
   - Route dashboard read queries to database read replicas.
   - Cache popular filtered pages using Redis or Next.js Data Cache with tag-based invalidation.

5. **API Performance Monitoring:**
   - Track database slow query logs (`pg_stat_statements`) and APM traces (OpenTelemetry) to identify p95 and p99 latency regressions.

---

## 5. Skipped Work

The following optional features were skipped to focus on core requirements and Server-First refactoring:

1. **Date-Range Filter:**
   - *How to implement:* Provide date picker inputs in `TransactionFilters` that set `startDate` and `endDate` query parameters, filtering via `BETWEEN` in the server service.
2. **Daily Transaction Volume Chart:**
   - *How to implement:* Aggregate amounts grouped by date in `lib/transactions-service.ts` and render using an SVG line or bar chart component.
3. **Database-Backed Authentication & Session Cookies:**
   - *How to implement:* Implement NextAuth or iron-session cookies with middleware route guards. (A mock role toggle was included in `DashboardHeaderActions` to demonstrate the admin-only CSV export feature).

---

## 6. Verification Checklist

- [x] Dashboard page (`app/transactions/page.tsx`) refactored to a Server Component.
- [x] Shared server query service (`lib/transactions-service.ts`) used by page and API route.
- [x] All display components (`TransactionSummary`, `SummaryCard`, `TransactionTable`, `TransactionRow`, `StatusBadge`, `EmptyState`) are Server Components.
- [x] Pagination refactored to Server Component using Next.js `Link`.
- [x] Client boundaries minimized to `TransactionFilters`, `CopyTransactionId`, `DashboardHeaderActions`, and `RetryButton`.
- [x] API endpoint `GET /api/transactions` retains `{ items, total, summary }` and ~600 ms delay.
- [x] `fail=1` produces HTTP 500 on API and triggers error handling on the page.
- [x] URL state persistence across search, status, and pagination.
- [x] Responsive layout verified at 360 px viewport width with zero horizontal overflow.
- [x] 14/14 automated Playwright tests passing.
- [x] Production build passes cleanly (`npm run build`).
