import fs from "fs";
import path from "path";

const csvPath = path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv");
const productsDir = path.join(process.cwd(), "data", "products");
const raw = fs.readFileSync(csvPath, "utf-8");

// Parse CSV with proper multi-line field handling
function parseCSV(raw) {
  const lines = raw.split("\n");
  const header = parseLine(lines[0]);
  const products = [];
  let i = 1;

  while (i < lines.length) {
    let combined = lines[i];
    // Handle multi-line quoted fields
    let quoteCount = (combined.match(/"/g) || []).length;
    while (quoteCount % 2 !== 0 && i + 1 < lines.length) {
      i++;
      combined += "\n" + lines[i];
      quoteCount = (combined.match(/"/g) || []).length;
    }
    const fields = parseLine(combined);
    if (fields.length >= 10 && fields[1] === "Simple") {
      const obj = {};
      header.forEach((h, idx) => (obj[h.trim()] = (fields[idx] || "").trim()));
      products.push(obj);
    }
    i++;
  }
  return products;
}

function parseLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Sanitize text
function sanitize(str) {
  if (!str) return "";
  return str
    .replace(/<[^>]+>/g, "")        // strip HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#?\w+;/g, "")         // strip HTML entities
    .replace(/[\u{1F600}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{200D}\u{FE0F}]/gu, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/➤/g, "•")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Slugify
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

// Category mapping
function mapCategory(catStr) {
  const c = catStr.toLowerCase();
  if (c.includes("fashion") || c.includes("clothing") || c.includes("shoe") || c.includes("watch") || c.includes("bag") || c.includes("wallet") || c.includes("jewel") || c.includes("sunglass")) return "fashion";
  if (c.includes("electronic") || c.includes("mobile") || c.includes("phone") || c.includes("audio") || c.includes("earbud") || c.includes("headphone") || c.includes("gadget") || c.includes("charger") || c.includes("cable")) return "electronics";
  if (c.includes("beauty") || c.includes("cosmetic") || c.includes("makeup") || c.includes("skin") || c.includes("hair") || c.includes("perfume") || c.includes("fragrance") || c.includes("lash")) return "beauty";
  if (c.includes("home") || c.includes("living") || c.includes("decor") || c.includes("furniture") || c.includes("kitchen") || c.includes("cook")) return "home-living";
  if (c.includes("sport") || c.includes("fitness") || c.includes("gym") || c.includes("exercise") || c.includes("yoga")) return "sports";
  if (c.includes("kid") || c.includes("toy") || c.includes("baby") || c.includes("child")) return "kids";
  if (c.includes("grocery") || c.includes("food") || c.includes("snack") || c.includes("beverage")) return "groceries";
  return "electronics";
}

// Extract features from description
function extractFeatures(desc) {
  const features = [];
  const cleaned = desc.replace(/\*\*/g, "").replace(/<[^>]+>/g, "");
  const lines = cleaned.split(/\n|•|➤/).filter(l => l.trim().length > 8);
  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-•●➤]\s*/, "").substring(0, 80);
    if (trimmed && trimmed.length > 8 && !trimmed.startsWith("Key Features")) {
      features.push(trimmed);
    }
  }
  return features.slice(0, 12);
}

// Normalize for dedup comparison
function coreName(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim().split(/\s+/).filter(w => w.length > 2).slice(0, 6).join(" ");
}

// Load existing products
console.log("Loading existing products...");
const existingFiles = fs.readdirSync(productsDir).filter(f => f.endsWith(".json"));
const existingNames = new Set();
for (const f of existingFiles) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8"));
    existingNames.add(coreName(p.name));
  } catch (e) {}
}
console.log(`  ${existingNames.size} existing products loaded`);

// Parse CSV
console.log("Parsing CSV...");
const products = parseCSV(raw);
console.log(`  ${products.length} products found`);

// Process
let added = 0;
let skipped = 0;
const skippedList = [];
const newSlugs = [];

for (const p of products) {
  const name = sanitize(p["Name"] || "");
  if (!name || name.length < 10) continue;

  const core = coreName(name);
  if (core.length < 8) continue;

  // Check duplicate
  if (existingNames.has(core)) {
    skipped++;
    skippedList.push({ name: name.substring(0, 80), reason: "Duplicate by core name" });
    continue;
  }

  // Generate product
  const slug = slugify(name);
  const price = Math.round((parseFloat(p["Regular price"]) || 999) * 1.3);
  const images = (p["Images"] || "")
    .split(",")
    .map(u => u.trim())
    .filter(u => u.startsWith("http"));
  const description = sanitize(p["Description"] || p["Short description"] || "");
  const shortDesc = sanitize(p["Short description"] || "");
  const category = mapCategory(p["Categories"] || "");
  const features = extractFeatures(description);

  // Extract specs from description
  const specs = {};
  const specMatches = description.match(/Model[:\s]+([^\n•]+)|Brand[:\s]+([^\n•]+)|Color[:\s]+([^\n•]+)|Weight[:\s]+([^\n•]+)|Material[:\s]+([^\n•]+)/gi);
  if (specMatches) {
    specMatches.forEach(m => {
      const [key, val] = m.split(/[:\s]+/, 2);
      if (val) specs[key] = val.trim();
    });
  }
  if (Object.keys(specs).length === 0) {
    specs["Product"] = name.split("–")[0]?.trim() || name.substring(0, 40);
  }

  const product = {
    slug,
    name,
    category,
    price,
    description: description || shortDesc,
    features,
    specifications: specs,
    images,
    inStock: p["In stock?"] === "1",
    stockCount: Math.floor(Math.random() * 25) + 5,
    isFeatured: added < 8,
    tags: name.toLowerCase().split(/[\s-–—]+/).filter(w => w.length > 3).slice(0, 8),
    deliveryInfo: "Delivery in 2-4 working days across Pakistan",
    sku: p["SKU"] || `hhc2-${slug}`,
  };

  const filePath = path.join(productsDir, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(product, null, 2), "utf-8");
  existingNames.add(core); // prevent duplicates within same batch
  newSlugs.push(slug);
  added++;

  if (added % 50 === 0) console.log(`  ${added} added, ${skipped} skipped...`);
}

console.log(`\nDone! Added: ${added}, Skipped: ${skipped}`);

// Write skipped list
fs.writeFileSync(
  path.join(process.cwd(), "skipped-duplicates.json"),
  JSON.stringify(skippedList, null, 2)
);
console.log(`Skipped list: skipped-duplicates.json (${skipped} items)`);

// Regenerate products.ts
console.log("\nRegenerating products.ts...");
const allFiles = fs.readdirSync(productsDir).filter(f => f.endsWith(".json")).sort();
let imports = "";
let items = "";
allFiles.forEach((f, i) => {
  const s = f.replace(".json", "");
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
console.log(`  products.ts updated with ${allFiles.length} total products`);

// Regenerate search index
console.log("Regenerating search index...");
const index = [];
for (const f of allFiles) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8"));
    index.push({
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      salePrice: p.salePrice,
      image: p.images?.[0] || "",
      tags: p.tags || [],
    });
  } catch (e) {}
}
fs.writeFileSync(path.join(process.cwd(), "public", "search-index.json"), JSON.stringify(index));
console.log(`  search-index.json: ${index.length} entries`);
console.log("\nAll done!");
