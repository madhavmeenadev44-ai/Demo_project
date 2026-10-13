/**
 * Formats an integer amount in paise into an Indian Rupee (INR) currency string.
 * e.g., 50000 -> ₹500.00, 12500000 -> ₹1,25,000.00
 */
export function formatINR(paise: number): string {
  const safePaise = typeof paise === "number" && !isNaN(paise) ? paise : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safePaise / 100);
}

