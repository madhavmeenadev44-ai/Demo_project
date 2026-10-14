import { test, expect, Page } from "@playwright/test";

async function loginAs(
  page: Page,
  email = "admin@example.com",
  password = "Admin123!"
) {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Sign In/i }).click();
  await page.waitForURL(/\/transactions/);
}

test.describe("Mock Authentication & Route Protection", () => {
  test("unauthenticated access to /transactions redirects to /login", async ({
    page,
  }) => {
    await page.goto("/transactions");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Merchant Portal" })).toBeVisible();
  });

  test("unauthenticated access to / redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("submitting invalid credentials displays an accessible error", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("wrong@example.com");
    await page.getByLabel("Password").fill("BadPassword123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    const alert = page.getByRole("alert").filter({ hasText: /Invalid email or password/i });
    await expect(alert).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("viewer credentials log in and display viewer role badge", async ({
    page,
  }) => {
    await loginAs(page, "viewer@example.com", "Viewer123!");
    await expect(page).toHaveURL(/\/transactions/);
    await expect(page.getByText("VIEWER", { exact: true })).toBeVisible();
  });

  test("authenticated user visiting /login is redirected to /transactions", async ({
    page,
  }) => {
    await loginAs(page, "admin@example.com", "Admin123!");
    await page.goto("/login");
    await expect(page).toHaveURL(/\/transactions/);
  });

  test("logout clears session and redirects to /login", async ({ page }) => {
    await loginAs(page, "admin@example.com", "Admin123!");
    await page.getByRole("button", { name: /Logout/i }).click();

    await expect(page).toHaveURL(/\/login/);

    // Verify visiting /transactions again redirects to /login
    await page.goto("/transactions");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Role-Based Access & CSV Export", () => {
  test("viewer cannot see Export CSV button and direct export returns HTTP 403", async ({
    page,
    request,
  }) => {
    // 1. Viewer logs in via browser
    await loginAs(page, "viewer@example.com", "Viewer123!");

    // Export CSV button must NOT be visible to viewers
    await expect(page.getByRole("link", { name: /Export CSV/i })).not.toBeVisible();

    // 2. Direct API export access using viewer's session cookies returns HTTP 403
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "merchant_session");

    const response = await request.get("/api/transactions/export", {
      headers: {
        Cookie: `merchant_session=${sessionCookie?.value}`,
      },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Forbidden");
  });

  test("unauthenticated access to API endpoints returns HTTP 401", async ({
    request,
  }) => {
    const txResponse = await request.get("/api/transactions");
    expect(txResponse.status()).toBe(401);

    const exportResponse = await request.get("/api/transactions/export");
    expect(exportResponse.status()).toBe(401);
  });

  test("admin sees Export CSV and can download matching transactions", async ({
    page,
    request,
  }) => {
    await loginAs(page, "admin@example.com", "Admin123!");

    // Admin sees Export CSV button
    const exportBtn = page.getByRole("link", { name: /Export CSV/i });
    await expect(exportBtn).toBeVisible();

    // Verify direct API export with admin session returns HTTP 200 and CSV content
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "merchant_session");

    const response = await request.get("/api/transactions/export?q=Rahul", {
      headers: {
        Cookie: `merchant_session=${sessionCookie?.value}`,
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/csv");
    expect(response.headers()["content-disposition"]).toContain("attachment; filename=");

    const csvText = await response.text();
    expect(csvText).toContain("Transaction ID,Date,Customer,Amount (INR),Payment Method,Status");
    expect(csvText).toContain("Rahul Sharma");
  });
});

test.describe("Merchant Transactions Dashboard Core Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin@example.com", "Admin123!");
  });

  test("loads initial transactions, displays summary cards and pagination", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: "Merchant Transactions" })).toBeVisible();

    // Summary cards visible with INR currency
    await expect(page.getByText("Total Volume")).toBeVisible();
    await expect(page.getByText("Success Rate")).toBeVisible();
    await expect(page.getByText("Failed Transactions")).toBeVisible();

    // Check pagination count info (Showing 1–20 of 200)
    await expect(page.getByText(/Showing 1[–-]20 of 200 transactions/i)).toBeVisible();

    // Verify transactions rendered and visible on screen
    const visibleTxnId = page.locator("text=/TXN100[0-9]+/i").locator("visible=true").first();
    await expect(visibleTxnId).toBeVisible();
  });

  test("filters transactions by search query and reflects in URL", async ({
    page,
  }) => {
    const searchInput = page.getByLabel("Search transactions");
    await searchInput.fill("Rahul");

    // Wait for debounced fetch and URL change
    await expect(page).toHaveURL(/q=Rahul/i);

    // Verify filtered results contain Rahul
    await expect(page.getByText(/Showing 1[–-]4 of 4 transactions/i)).toBeVisible();
    await expect(page.locator("text=Rahul Sharma").locator("visible=true").first()).toBeVisible();
  });

  test("filters transactions by status and resets page to 1", async ({
    page,
  }) => {
    await page.goto("/transactions?page=2");
    await expect(page.getByText(/Showing 21[–-]40 of 200 transactions/i)).toBeVisible();

    // Change status filter to 'FAILED'
    const statusSelect = page.getByLabel("Filter transactions by status");
    await statusSelect.selectOption("FAILED");

    // Verify URL updated and page was reset to 1
    await expect(page).toHaveURL(/status=FAILED/);
    expect(page.url()).not.toContain("page=2");

    // Check that success rate for FAILED filter is 0.0%
    await expect(page.getByText("0.0%")).toBeVisible();
  });

  test("URL persistence on page refresh", async ({ page }) => {
    await page.goto("/transactions?q=Rahul&status=SUCCESS");

    const searchInput = page.getByLabel("Search transactions");
    await expect(searchInput).toHaveValue("Rahul");

    const statusSelect = page.getByLabel("Filter transactions by status");
    await expect(statusSelect).toHaveValue("SUCCESS");

    await page.reload();

    await expect(searchInput).toHaveValue("Rahul");
    await expect(statusSelect).toHaveValue("SUCCESS");
  });

  test("handles empty search results with Clear Filters action", async ({
    page,
  }) => {
    await page.goto("/transactions?q=NonExistentCustomerNameXYZ");

    await expect(page.getByRole("heading", { name: "No transactions found" })).toBeVisible();

    const clearBtn = page.getByRole("button", { name: /Clear Filters/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(page.getByText(/Showing 1[–-]20 of 200 transactions/i)).toBeVisible();
  });

  test("handles HTTP 500 API failure with retry action", async ({ page }) => {
    await page.goto("/transactions?fail=1");

    await expect(page.getByRole("heading", { name: "Failed to load transactions" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Retry Request/i })).toBeVisible();

    const toggleSimulate = page.getByTitle(/Toggle fail=1/i);
    await toggleSimulate.click();

    await expect(page.getByText(/Showing 1[–-]20 of 200 transactions/i)).toBeVisible();
  });

  test("is fully responsive at 360px viewport without page horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/transactions");

    await expect(page.getByRole("heading", { name: "Merchant Transactions" })).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
