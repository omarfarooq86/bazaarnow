import fs from "fs";
import path from "path";

const csvPath = path.join(process.cwd(), "woocom_products_export.csv");
const productsDir = path.join(process.cwd(), "data", "products");

// Read CSV
const raw = fs.readFileSync(csvPath, "utf-8");

// Parse CSV (handle quoted fields with commas and newlines)
function parseCSVLine(line, rest) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
    i++;
  }
  fields.push(current.trim());
  return fields;
}

// Better CSV parser that handles multi-line quoted fields
const lines = raw.split("\n");
const header = parseCSVLine(lines[0], null);
const products = [];
let i = 1;

while (i < lines.length) {
  let combined = lines[i];
  // If line starts a quoted field that continues, keep appending
  while (combined && (combined.match(/"/g) || []).length % 2 !== 0 && i + 1 < lines.length) {
    i++;
    combined += "\n" + lines[i];
  }

  const fields = parseCSVLine(combined, null);
  if (fields.length >= 14 && fields[1] === "variable") {
    const obj = {};
    header.forEach((h, idx) => {
      obj[h.trim()] = (fields[idx] || "").trim();
    });
    products.push(obj);
  }
  i++;
}

console.log(`Found ${products.length} parent products`);

// Category mapping
function mapCategory(csvCategories) {
  const cat = csvCategories.toLowerCase();
  if (cat.includes("fashion") || cat.includes("apparel") || cat.includes("men") || cat.includes("women") || cat.includes("clothing") || cat.includes("shoes") || cat.includes("watch") || cat.includes("sunglass")) return "fashion";
  if (cat.includes("electronic") || cat.includes("mobile") || cat.includes("phone") || cat.includes("gadget") || cat.includes("audio") || cat.includes("headphone") || cat.includes("earbuds")) return "electronics";
  if (cat.includes("beauty") || cat.includes("cosmetic") || cat.includes("makeup") || cat.includes("skin") || cat.includes("hair") || cat.includes("lash") || cat.includes("lip") || cat.includes("perfume") || cat.includes("fragrance")) return "beauty";
  if (cat.includes("home") || cat.includes("living") || cat.includes("decor") || cat.includes("furniture") || cat.includes("bed") || cat.includes("bath")) return "home-living";
  if (cat.includes("sport") || cat.includes("fitness") || cat.includes("exercise") || cat.includes("gym") || cat.includes("yoga")) return "sports";
  if (cat.includes("kid") || cat.includes("toy") || cat.includes("baby") || cat.includes("child")) return "kids";
  if (cat.includes("kitchen") || cat.includes("cook") || cat.includes("dining") || cat.includes("food") || cat.includes("bake")) return "kitchen";
  if (cat.includes("grocery") || cat.includes("food") || cat.includes("beverage") || cat.includes("snack")) return "groceries";
  return "electronics"; // default
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function extractFeatures(desc) {
  const features = [];
  const cleaned = desc.replace(/\*\*/g, "");

  // Try to find "Key Features:" section
  const keyFeatMatch = cleaned.match(/Key Features[:]?\s*(.+?)(?:\n\n|$)/s);
  if (keyFeatMatch) {
    const featText = keyFeatMatch[1];
    // Split by common delimiters
    const parts = featText.split(/(?=[A-Z][a-z]+(?: [a-z]+)*[:])/).filter(Boolean);
    parts.forEach((p) => {
      const trimmed = p.trim().replace(/^[-•●]\s*/, "").substring(0, 80);
      if (trimmed && trimmed.length > 5) features.push(trimmed);
    });
  }

  // Fallback: split by period and take promising sentences
  if (features.length === 0) {
    const sentences = cleaned.split(/[.!]/).filter((s) => s.trim().length > 15 && s.trim().length < 100);
    features.push(...sentences.slice(0, 6).map((s) => s.trim().replace(/^[-•●]\s*/, "")));
  }

  return features.slice(0, 10);
}

function extractSpecs(desc, name) {
  const specs = {};

  // Common patterns
  const patterns = [
    { regex: /Material[s]?:\s*([^,.]+)/i, key: "Material" },
    { regex: /Color[s]?:\s*([^,.]+)/i, key: "Color" },
    { regex: /Size[s]?:\s*([^,.]+)/i, key: "Size" },
    { regex: /Weight:\s*([^,.]+)/i, key: "Weight" },
    { regex: /Brand:\s*([^,.]+)/i, key: "Brand" },
    { regex: /Type:\s*([^,.]+)/i, key: "Type" },
    { regex: /Warranty:\s*([^,.]+)/i, key: "Warranty" },
    { regex: /Battery:\s*([^,.]+)/i, key: "Battery" },
    { regex: /Capacity:\s*([^,.]+)/i, key: "Capacity" },
    { regex: /Dimension[s]?:\s*([^,.]+)/i, key: "Dimensions" },
  ];

  patterns.forEach(({ regex, key }) => {
    const match = desc.match(regex);
    if (match) specs[key] = match[1].trim();
  });

  if (Object.keys(specs).length === 0) {
    specs["Product"] = name.split("–")[0]?.trim() || name.substring(0, 40);
  }

  return specs;
}

// Generate product JSON files
const generated = [];
const skipped = [];

products.forEach((p, idx) => {
  // Sanitize: remove emojis and non-printable chars, strip surrounding quotes
  const sanitize = (str) => {
    if (!str) return "";
    return str
      .replace(/^"|"$/g, "")
      .replace(/[\u{1F600}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{200D}\u{FE0F}]/gu, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();
  };

  const name = sanitize(p["Name"]);
  if (!name || name.length < 10) {
    skipped.push(`Row ${idx + 2}: empty name`);
    return;
  }

  const slug = slugify(name);
  const price = Math.round((parseFloat(p["Regular price"]) || 999) * 1.3);
  const images = (p["Images"] || "")
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.startsWith("http"));
  const description = sanitize(p["Description"] || p["Short description"] || "");
  const category = mapCategory(p["Categories"] || "");
  const shortDesc = sanitize(p["Short description"] || "");
  const features = extractFeatures(description);
  const specs = extractSpecs(description, name);

  // Keep CDN URLs — don't replace with local paths
  const productImages = images;

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
    stockCount: Math.floor(Math.random() * 30) + 5,
    isFeatured: idx < 12,
    tags: name.toLowerCase().split(/[\s-–—]+/).filter((w) => w.length > 3).slice(0, 8),
    deliveryInfo: "Delivery in 2-4 working days across Pakistan",
    sku: p["SKU"] || `hhc-${slug}`,
  };

  // Only set salePrice if it's different (we're not using discounts for now)
  // Don't set salePrice so price is the sole price

  const filePath = path.join(productsDir, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(product, null, 2), "utf-8");
  generated.push(slug);
});

console.log(`Generated ${generated.length} product files`);
if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length}:`);
  skipped.slice(0, 5).forEach((s) => console.log(`  ${s}`));
}

// Generate products.ts
const imports = generated
  .map((slug, i) => `import p${i} from "@/../data/products/${slug}.json";`)
  .join("\n");

const arrayItems = generated.map((_, i) => `  p${i} as Product,`).join("\n");

const productsTs = `import type { Product, Category, Banner, SiteConfig } from "@/types";
import siteConfigData from "@/../data/site-config.json";
import categoriesData from "@/../data/categories.json";
import bannersData from "@/../data/banners.json";
${imports}

const allProducts: Product[] = [
${arrayItems}
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
`;

fs.writeFileSync(path.join(process.cwd(), "src", "lib", "products.ts"), productsTs, "utf-8");
console.log("Updated products.ts with all imports");
