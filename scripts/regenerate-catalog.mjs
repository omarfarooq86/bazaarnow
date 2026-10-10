// Regenerate src/lib/products.ts, public/search-index.json and data/categories.json counts
// from the current contents of data/products/.
//   node scripts/regenerate-catalog.mjs
import fs from "fs";
import path from "path";

const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json")).sort();

const products = [];
for (const f of files) {
  try {
    products.push(JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8")));
  } catch (e) {
    console.error(`  !! unreadable JSON: ${f}`);
  }
}
console.log(`Loaded ${products.length} products from ${files.length} files`);

// ---------- src/lib/products.ts ----------
let imports = "";
let items = "";
files.forEach((f, i) => {
  const s = f.replace(/\.json$/, "");
  imports += `import p${i} from "@/../data/products/${s}.json";\n`;
  items += `  p${i} as Product,\n`;
});

const productsTs = `import type { Product, Category, Banner, SiteConfig } from "@/types";
import siteConfigData from "@/../data/site-config.json";
import categoriesData from "@/../data/categories.json";
import bannersData from "@/../data/banners.json";
${imports}
const allProducts: Product[] = [
${items}];

export async function getAllProducts(): Promise<Product[]> {
  return allProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return allProducts.find((p) => p.slug === slug) || null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return allProducts.filter((p) => p.category === category);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return allProducts.filter((p) => p.isFeatured);
}

export async function getRelatedProducts(currentSlug: string, category: string, limit = 4): Promise<Product[]> {
  return allProducts.filter((p) => p.slug !== currentSlug && p.category === category).slice(0, limit);
}

export function getAllProductSlugs(): string[] {
  return allProducts.map((p) => p.slug);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const lowerQuery = query.toLowerCase();
  return allProducts.filter((p) =>
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
`;
fs.writeFileSync(path.join(process.cwd(), "src", "lib", "products.ts"), productsTs);
console.log(`  src/lib/products.ts -> ${files.length} imports`);

// ---------- public/search-index.json ----------
const index = products.map((p) => {
  const e = {
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
  };
  if (p.salePrice !== undefined) e.salePrice = p.salePrice;
  e.image = p.images?.[0] || "";
  e.tags = p.tags || [];
  if (p.videoUrl) e.videoUrl = p.videoUrl;
  return e;
});
fs.writeFileSync(path.join(process.cwd(), "public", "search-index.json"), JSON.stringify(index));
const noImg = index.filter((e) => !e.image).length;
console.log(`  public/search-index.json -> ${index.length} entries (${noImg} without image)`);

// ---------- public/search-index-slim.json (the file the search UI fetches) ----------
// Key map used by SearchClient/SearchOverlay:
//   s=slug n=name c=category p=price d=salePrice i=image v=videoUrl
// `d` and `v` are optional on the consumer side; omitted when absent.
const slim = products.map((p) => {
  const e = { s: p.slug, n: p.name, c: p.category, p: p.price };
  if (p.salePrice !== undefined) e.d = p.salePrice;
  e.i = p.images?.[0] || "";
  e.v = p.videoUrl || "";
  return e;
});
fs.writeFileSync(path.join(process.cwd(), "public", "search-index-slim.json"), JSON.stringify(slim));
const noDiscount = slim.filter((e) => e.d === undefined).length;
console.log(`  public/search-index-slim.json -> ${slim.length} entries (${noDiscount} with no sale price)`);

// ---------- data/categories.json ----------
const counts = {};
for (const p of products) counts[p.category] = (counts[p.category] || 0) + 1;

const catsPath = path.join(process.cwd(), "data", "categories.json");
const cats = JSON.parse(fs.readFileSync(catsPath, "utf-8"));
console.log("\nCategory count updates:");
for (const c of cats) {
  const old = c.productCount;
  const now = counts[c.slug] || 0;
  if (old !== now) {
    // replace the first standalone mention of the old count inside the description
    c.description = c.description.replace(new RegExp(`\\b${old}\\b`), String(now));
    c.productCount = now;
    console.log(`  ${c.slug.padEnd(12)} ${old} -> ${now}`);
  } else {
    console.log(`  ${c.slug.padEnd(12)} ${old} (unchanged)`);
  }
}
// groceries description quotes the site-wide total
const total = products.length;
const gc = cats.find((c) => c.slug === "groceries");
if (gc) {
  gc.description = gc.description.replace(/[\d,]+(?= products available now)/, total.toLocaleString("en-US"));
  console.log(`  groceries site-wide total -> ${total.toLocaleString("en-US")}`);
}
fs.writeFileSync(catsPath, JSON.stringify(cats, null, 2) + "\n");
console.log("  data/categories.json written");

console.log(`\nTotal products: ${products.length}`);
console.log(`By category: ${JSON.stringify(counts)}`);

// any product whose category has no entry in categories.json?
const known = new Set(cats.map((c) => c.slug));
const orphans = Object.keys(counts).filter((k) => !known.has(k));
if (orphans.length) console.log(`\n!! categories not present in categories.json: ${orphans.join(", ")}`);
