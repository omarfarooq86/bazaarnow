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

/**
 * Simple fuzzy match — checks if all query chars appear in order in the target
 * "airpod" matches "AirPods", "chrgr" matches "Charger"
 */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return true; // exact substring
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (q[qi] === t[ti]) qi++;
  }
  return qi === q.length;
}

/**
 * Find the best suggestion when no results found
 */
export function findClosestMatch(
  query: string,
  candidates: string[],
  limit = 3
): string[] {
  if (query.length < 2) return [];
  const lower = query.toLowerCase();
  const scored = candidates
    .map((c) => {
      const cl = c.toLowerCase();
      // Score: exact substring > starts with > fuzzy match > Levenshtein-like
      let score = 0;
      if (cl === lower) score = 100;
      else if (cl.includes(lower)) score = 80 + (20 - Math.min(20, cl.indexOf(lower)));
      else if (cl.startsWith(lower)) score = 70;
      else if (fuzzyMatch(lower, cl)) score = 40;
      else {
        // Simple edit distance approximation
        const maxLen = Math.max(lower.length, cl.length);
        let matches = 0;
        for (let i = 0; i < Math.min(lower.length, cl.length); i++) {
          if (lower[i] === cl[i]) matches++;
        }
        score = (matches / maxLen) * 20;
      }
      return { candidate: c, score };
    })
    .filter((s) => s.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.candidate);
  return scored;
}

/**
 * Get category name from slug
 */
export function getCategoryLabel(slug: string): string {
  const labels: Record<string, string> = {
    fashion: "Fashion",
    electronics: "Electronics",
    beauty: "Beauty",
    "home-living": "Home",
    kids: "Kids",
    kitchen: "Kitchen",
    sports: "Sports",
    groceries: "Groceries",
  };
  return labels[slug] || slug;
}
