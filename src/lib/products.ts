import type { Product, Category, Banner, SiteConfig } from "@/types";
import siteConfigData from "@/../data/site-config.json";
import categoriesData from "@/../data/categories.json";
import bannersData from "@/../data/banners.json";
import premiumWirelessEarbuds from "@/../data/products/premium-wireless-earbuds.json";
import smartWatchSeriesX from "@/../data/products/smart-watch-series-x.json";
import designerLeatherJacket from "@/../data/products/designer-leather-jacket.json";
import organicSkincareSet from "@/../data/products/organic-skincare-set.json";
import yogaMatPremium from "@/../data/products/yoga-mat-premium.json";
import blenderPro1500w from "@/../data/products/blender-pro-1500w.json";

const allProducts: Product[] = [
  premiumWirelessEarbuds as Product,
  smartWatchSeriesX as Product,
  designerLeatherJacket as Product,
  organicSkincareSet as Product,
  yogaMatPremium as Product,
  blenderPro1500w as Product,
];

export async function getAllProducts(): Promise<Product[]> {
  return allProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return allProducts.find((p) => p.slug === slug) || null;
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  return allProducts.filter((p) => p.category === category);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return allProducts.filter((p) => p.isFeatured);
}

export async function getRelatedProducts(
  currentSlug: string,
  category: string,
  limit = 4
): Promise<Product[]> {
  return allProducts
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit);
}

export function getAllProductSlugs(): string[] {
  return allProducts.map((p) => p.slug);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const lowerQuery = query.toLowerCase();
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}

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
