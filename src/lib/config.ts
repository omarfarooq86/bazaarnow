/**
 * Lightweight config — safe for client components.
 * Does NOT import product JSONs.
 */
import type { Category, Banner, SiteConfig, DeliveryType } from "@/types";
import siteConfigData from "@/../data/site-config.json";
import categoriesData from "@/../data/categories.json";
import bannersData from "@/../data/banners.json";

export function getSiteConfig(): SiteConfig {
  return siteConfigData as SiteConfig;
}

/**
 * The extra charged at checkout for a delivery choice — not the full delivery cost,
 * since standard delivery is already prepaid inside each product price.
 *
 * Falls back to 0 for an unrecognised id so a stale or malformed value can never add
 * a fee the customer never agreed to.
 */
export function getDeliveryFee(id: DeliveryType): number {
  return getSiteConfig().deliveryOptions.find((o) => o.id === id)?.fee ?? 0;
}

export function getCategories(): Category[] {
  return categoriesData as Category[];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return (categoriesData as Category[]).find((c) => c.slug === slug);
}

export function getBanners(): Banner[] {
  return bannersData as Banner[];
}
