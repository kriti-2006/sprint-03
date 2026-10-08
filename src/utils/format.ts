/** Small presentation helpers shared across components. */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRating(value: number): string {
  return value.toFixed(2);
}

/** Turn an API category slug into a display label: "home-decoration" → "Home Decoration". */
export function formatCategory(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
