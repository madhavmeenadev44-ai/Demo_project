import { test, expect } from "@playwright/test";

test.describe("Merchant Transactions Dashboard", () => {
  test("loads initial transactions, displays summary cards and pagination", async ({
    page,
  }) => {
    await page.goto("/transactions");

    // Header title
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
    await page.goto("/transactions");

    // Type 'Rahul' into search input
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
    // Navigate to page 2 first
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

    // Ensure the filter input and select reflect URL parameters
    const searchInput = page.getByLabel("Search transactions");
    await expect(searchInput).toHaveValue("Rahul");

    const statusSelect = page.getByLabel("Filter transactions by status");
    await expect(statusSelect).toHaveValue("SUCCESS");

    // Reload page
    await page.reload();

    // Values should persist
    await expect(searchInput).toHaveValue("Rahul");
    await expect(statusSelect).toHaveValue("SUCCESS");
  });

  test("handles empty search results with Clear Filters action", async ({
    page,
  }) => {
    await page.goto("/transactions?q=NonExistentCustomerNameXYZ");

    // Empty state should be visible
    await expect(page.getByRole("heading", { name: "No transactions found" })).toBeVisible();

    // Click clear filters button
    const clearBtn = page.getByRole("button", { name: /Clear Filters/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Returns to full dataset
    await expect(page.getByText(/Showing 1[–-]20 of 200 transactions/i)).toBeVisible();
  });

  test("handles HTTP 500 API failure with retry action", async ({ page }) => {
    await page.goto("/transactions?fail=1");

    // Error state visible
    await expect(page.getByRole("heading", { name: "Failed to load transactions" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Retry Request/i })).toBeVisible();

    // Toggle off fail mode using dev simulate button
    const toggleSimulate = page.getByTitle(/Toggle fail=1/i);
    await toggleSimulate.click();

    // Transactions load successfully
    await expect(page.getByText(/Showing 1[–-]20 of 200 transactions/i)).toBeVisible();
  });

  test("is fully responsive at 360px viewport without page horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/transactions");

    // Confirm title and cards are visible
    await expect(page.getByRole("heading", { name: "Merchant Transactions" })).toBeVisible();

    // Check page horizontal scroll width does not exceed viewport width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 0-1px tolerance for subpixel antialiasing
  });
});

