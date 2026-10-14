# Merchant Transactions Dashboard

**Role:** Frontend Engineer (React / Next.js)  
**Assessment:** FE-01 — Merchant Transactions Dashboard  
**Architecture:** Server-First Next.js App Router with Mock Authentication & Role-Based Access Control  
**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Playwright

---

## 1. Project Overview

A responsive, production-ready merchant transactions dashboard designed according to **Server-First Next.js App Router principles**.

The dashboard page and all display-only components are **Server Components by default**, streaming HTML directly from the server. Interactive elements such as search filters, clipboard copy, and developer toolbar controls are isolated in leaf **Client Components**.

This implementation includes the assessment's optional **Mock Login, Protected Routes, and Role-Based CSV Export** feature, enabling role-based access control where both `ADMIN` and `VIEWER` users can browse transactions, but only authenticated `ADMIN` users can export transaction data.

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
   Open [http://localhost:3000](http://localhost:3000) (unauthenticated users will be redirected to [http://localhost:3000/login](http://localhost:3000/login)).

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

## 3. Mock Authentication and Role-Based Access

### Demo Credentials

| Role | Email | Password | Permissions |
| --- | --- | --- | --- |
| **`ADMIN`** | `admin@example.com` | `Admin123!` | View, search, filter, paginate, and **Export CSV** |
| **`VIEWER`** | `viewer@example.com` | `Viewer123!` | View, search, filter, paginate (Read-Only; **no Export CSV**) |

*Note: The login page includes quick-fill buttons for both demo roles to facilitate immediate reviewer testing.*

### Authentication & Session Design
- **Session Architecture:** Implemented via cryptographically signed HTTP-only cookies (`merchant_session`) using HMAC SHA-256 (`node:crypto`).
- **Server-Only Secret:** Signing key read from `process.env.AUTH_SECRET` (see `.env.example`).
- **Cookie Security:** Configured with `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, and `secure: true` in production. Tokens are never stored in client-accessible `localStorage` or `sessionStorage`.
- **Protected Routes:**
  - `/transactions`: Server-side guard (`requireUser()`) verifies the session cookie before data loading; unauthenticated visitors are redirected to `/login`.
  - `/`: Static redirect to `/transactions` (which enforces the authentication guard).
  - `/login`: Public login page. Authenticated users visiting `/login` are automatically redirected to `/transactions`.
  - `Logout`: Clears the session cookie via Server Action and redirects to `/login`.
- **Protected API Endpoints:**
  - `GET /api/transactions` and `GET /api/transactions/summary`: Verify session cookie on the server runtime and return HTTP 401 Unauthorized for unauthenticated requests.
  - `GET /api/transactions/export`: Verifies session and enforces `ADMIN` role check on the server:
    - Returns HTTP 401 if unauthenticated.
    - Returns HTTP 403 Forbidden if authenticated as `VIEWER`.
    - Returns HTTP 200 with generated CSV if authenticated as `ADMIN`.
- **Role-Based CSV Export:**
  - Only `ADMIN` users see the **Export CSV** button in the dashboard header.
  - When triggered, all matching records across active search and status filters are exported (not only the current 20-row page slice).
  - Amounts are converted from paise to INR (`₹`).
  - Columns: `Transaction ID,Date,Customer,Amount (INR),Payment Method,Status`.
  - Formula Injection Mitigation: Any cell value beginning with spreadsheet formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) is prefixed with a single quote (`'`) to neutralize CSV injection when opened in Excel or Google Sheets.

> [!NOTE]
> This is mock demonstration authentication using preconfigured demo credentials and signed cookies. It is designed for assessment evaluation and is not intended as production identity infrastructure.

---

## 4. Server-First Architecture & Component Boundaries

### Component Hierarchy & Rendering Strategy

| Component / Module | Target Boundary | Purpose |
| --- | --- | --- |
| `app/layout.tsx` | **Server Component** | Static root shell with global font configuration and base styling. |
| `app/page.tsx` | **Server Component** | Static route redirect to `/transactions`. |
| `app/login/page.tsx` | **Server Component** | Public sign-in page with redirect guard for authenticated sessions. |
| `app/login/login-form.tsx` | **Client Component** | Form handling credentials submission, error alerts, and quick-fill helper actions. |
| `app/login/actions.ts` | **Server Action** | Server actions handling credential validation, session creation, and logout. |
| `app/transactions/page.tsx` | **Server Component** | Verifies session, awaits `searchParams`, invokes shared transaction query service, and renders Server Components. |
| `app/transactions/loading.tsx` | **Server Component** | Route-level streaming skeleton fallback during page transitions. |
| `app/transactions/error.tsx` | **Client Component** | Segment error boundary required by Next.js conventions with recovery `reset()` action. |
| `DashboardHeader` | **Server Component** | Renders static title, description, and embeds isolated client actions. |
| `DashboardHeaderActions` | **Client Component** | Manages user/role badge, admin-only CSV export link, and developer `fail=1` toggle. |
| `TransactionSummary` / `SummaryCard` | **Server Component** | Pure display components calculating and presenting filtered metrics. |
| `TransactionFilters` | **Client Component** | Controlled input with debounced typing (~300 ms), status dropdown, and URL navigation. |
| `TransactionTable` / `TransactionRow` | **Server Component** | Desktop table and mobile card markup streamed from the server. |
| `StatusBadge` | **Server Component** | Pure SVG and CSS status badge for `SUCCESS`, `FAILED`, and `PENDING`. |
| `CopyTransactionId` | **Client Component** | Leaf component isolating `navigator.clipboard` write. |
| `EmptyState` | **Server Component** | Renders "No transactions found" with server `<Link href="/transactions" role="button">` clear action. |
| `ErrorState` | **Server Component** | Displays error details and embeds the `RetryButton` client leaf. |
| `RetryButton` | **Client Component** | Isolated button triggering `router.refresh()` or error boundary retry. |
| `TransactionPagination` | **Server Component** | Generates Next.js `<Link>` elements preserving active query parameters without client state. |
| `app/api/transactions/route.ts` | **Server Route Handler** | Authenticated mock API endpoint with search, filter, sorting, pagination, and ~600 ms simulated delay. |
| `app/api/transactions/export/route.ts` | **Server Route Handler** | Admin-authorized CSV export endpoint with formula-injection sanitization. |
| `lib/transactions-service.ts` | **Server Service** | Shared query and aggregation engine used by page and API routes. |
| `lib/auth/session.ts` & `users.ts` | **Server-Only Module** | User credential verification, HMAC session signing, and route guards. |

---

## 5. Assessment Questions

### Question 1: Which parts are Server Components and which are Client Components, and why?

**Actual Implementation:**
- **The transactions page (`app/transactions/page.tsx`) is a Server Component.** It directly checks server session authentication (`requireUser()`), awaits the asynchronous `searchParams` Promise (in Next.js 16), and queries the shared server-side service (`getTransactions()`). It avoids client-side data fetching waterfalls and network serialization overhead.
- **Display-only components are Server Components:** `DashboardHeader`, `TransactionSummary`, `SummaryCard`, `TransactionTable`, `TransactionRow`, `StatusBadge`, and `EmptyState` are pure Server Components. They do not ship any JavaScript bundle to the browser for rendering.
- **Pagination is a Server Component:** `TransactionPagination` computes query URLs and renders standard Next.js `<Link>` elements, eliminating the need for client state or event handlers.
- **Client Components are kept to the smallest possible leaf boundaries:**
  - `LoginForm` uses `"use client"` to handle controlled state, quick-fill buttons, and pending state during submission.
  - `TransactionFilters` uses `"use client"` because it handles controlled DOM typing events, debouncing timers, and URL query updates via `router.push()`.
  - `CopyTransactionId` uses `"use client"` exclusively for browser clipboard access (`navigator.clipboard`).
  - `DashboardHeaderActions` uses `"use client"` for role state switching, CSV export trigger, and developer error toggling.
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

## 6. Skipped Work

The following optional features were skipped to focus on core requirements, Server-First refactoring, and mock authentication:

1. **Date-Range Filter:**
   - *How to implement:* Provide date picker inputs in `TransactionFilters` that set `startDate` and `endDate` query parameters, filtering via `BETWEEN` in `lib/transactions-service.ts`.
2. **Daily Transaction Volume Chart:**
   - *How to implement:* Aggregate amounts grouped by date in `lib/transactions-service.ts` and render using an SVG line or bar chart component.
3. **Database-Backed Identity & OAuth Providers:**
   - *How to implement:* Integrate Auth.js (NextAuth) or Supabase Auth connected to a PostgreSQL database with MFA and password hashing (bcrypt/argon2).

---

## 7. Verification Checklist

- [x] Mock authentication with signed HTTP-only cookies implemented.
- [x] Public `/login` page with accessible form, error handling, and demo quick-fill buttons.
- [x] Unauthenticated access to `/transactions` redirects to `/login`.
- [x] Authenticated users visiting `/login` redirected to `/transactions`.
- [x] `ADMIN` role sees Export CSV; `VIEWER` role does not.
- [x] Direct unauthorized requests to `/api/transactions/export` return HTTP 401 (unauthenticated) or HTTP 403 (non-admin).
- [x] Admin CSV export downloads all matching filtered transactions with formula injection defense.
- [x] Logout clears session cookie and redirects to `/login`.
- [x] Dashboard page (`app/transactions/page.tsx`) is a Server Component with zero client dashboard wrapper.
- [x] Shared server query service (`lib/transactions-service.ts`) used by page and API route.
- [x] Display components (`TransactionSummary`, `SummaryCard`, `TransactionTable`, `TransactionRow`, `StatusBadge`, `EmptyState`) are Server Components.
- [x] Pagination is a Server Component using Next.js `Link`.
- [x] Client boundaries minimized to `TransactionFilters`, `CopyTransactionId`, `DashboardHeaderActions`, and `RetryButton`.
- [x] API endpoint `GET /api/transactions` retains `{ items, total, summary }` and ~600 ms delay.
- [x] `fail=1` produces HTTP 500 on API and triggers error handling on the page.
- [x] URL state persistence across search, status, and pagination.
- [x] Responsive layout verified at 360 px viewport width with zero horizontal overflow.
- [x] 32/32 automated Playwright tests passing across desktop and mobile 360 px viewports.
- [x] Production build passes cleanly (`npm run build`).
