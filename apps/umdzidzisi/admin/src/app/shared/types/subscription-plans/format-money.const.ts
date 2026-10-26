/** Formats an amount in its ISO currency, e.g. `formatMoney(12.5, 'USD')` → `$12.50`. */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
