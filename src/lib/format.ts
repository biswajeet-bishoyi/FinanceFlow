/**
 * Format a minor-unit amount (e.g. paise) as a currency string.
 * All monetary values in the app are stored as integers in minor units.
 */
export function formatMoney(amount: number, currency = "INR"): string {
  return (amount / 100).toLocaleString("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse a user-input string (e.g. "500.50") into minor units (e.g. 50050).
 * Returns null if the input is invalid.
 */
export function parseMoney(input: string): number | null {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

/**
 * Parse a user-input string into minor units, defaulting to 0 if invalid.
 */
export function parseMoneyInput(input: string): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}
