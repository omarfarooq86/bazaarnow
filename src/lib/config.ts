/**
 * Lightweight config — safe for client components.
 * Does NOT import product JSONs.
 */
import type { Category, Banner, SiteConfig } from "@/types";
import siteConfigData from "@/../data/site-config.json";
import categoriesData from "@/../data/categories.json";
import bannersData from "@/../data/banners.json";

export function getSiteConfig(): SiteConfig {
  return siteConfigData as SiteConfig;
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
