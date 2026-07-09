/**
 * Format a number as Pakistani Rupees (PKR)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calculate the 5% advance payment discount
 */
export function calculateAdvanceDiscount(subtotal: number): number {
  return Math.round(subtotal * 0.05);
}

/**
 * Calculate savings percentage between original and sale price
 */
export function calculateSavings(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to a given length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

/**
 * Get the discounted price or original price
 */
export function getEffectivePrice(
  price: number,
  salePrice?: number
): { original: number; current: number; hasDiscount: boolean } {
  const hasDiscount = !!salePrice && salePrice < price;
  return {
    original: price,
    current: hasDiscount ? salePrice! : price,
    hasDiscount,
  };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Classname merger (simple version)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
