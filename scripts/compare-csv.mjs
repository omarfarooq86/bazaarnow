import fs from "fs";
import path from "path";

const csvPathOld = path.join(process.cwd(), "woocom_products_export.csv");
const csvPathNew = path.join(process.cwd(), "woocom_products_export_new.csv");

function parseCSV(raw) {
  const lines = raw.split("\n");
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));
  const products = [];
  let i = 1;
  while (i < lines.length) {
    let combined = lines[i];
    let quotes = (combined.match(/"/g) || []).length;
    while (quotes % 2 !== 0 && i + 1 < lines.length) {
      i++;
      combined += "\n" + lines[i];
      quotes = (combined.match(/"/g) || []).length;
    }
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < combined.length; i++) {
      const ch = combined[i];
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
    const obj = {};
    header.forEach((h, idx) => {
      obj[h.trim()] = (fields[idx] || "").trim().replace(/^"/, '').replace(/"$/, '');
    });
    products.push(obj);
    i++;
  }
  return products;
}

const rawOld = fs.readFileSync("woocom_products_export.csv", "utf-8");
const rawNew = fs.readFileSync("woocom_products_export_new.csv", "utf-8");

const oldProducts = parseCSV(fs.readFileSync("woocom_products_export.csv", "utf-8"));
const newProducts = parseCSV(fs.readFileSync("woocom_products_export_new.csv", "utf-8"));

console.log(`Old products: ${oldProducts.length}`);
console.log(`New file products: ${newProducts.length}`);

const oldSkus = new Set(oldProducts.map(p => p.SKU?.trim()).filter(Boolean));

const newProductsOnly = newProducts.filter(p => {
  const sku = p.SKU?.trim();
  return sku && !oldSkus.has(sku);
});

console.log(`New products to add: ${newProductsOnly.length}`);

if (newProductsOnly.length > 0) {
  console.log("\nNew products to add:");
  newProductsOnly.forEach(p => {
    console.log(`  SKU: ${p.SKU}, Name: ${(p.Name || '').substring(0, 60)}`);
  });

  // Save new products as JSON files
  const productsDir = "data/products";
  let added = 0;
  for (const p of newProductsOnly) {
    const product = {
      slug: p.SKU?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      name: p.Name || '',
      category: mapCategory(p.Categories || ''),
      price: Math.round((parseFloat(p["Regular price"]) || 0) * 1.3),
      description: p.Description || p["Short description"] || '',
      features: extractFeatures(p.Description || ''),
      specifications: extractSpecs(p.Description || ''),
      images: (p.Images || '').split(',').map(u => u.trim()).filter(u => u.startsWith('http')),
      videoUrl: '',
      inStock: p["In stock?"] === '1',
      stockCount: Math.floor(Math.random() * 30) + 5,
      isFeatured: false,
      tags: extractTags(p.Name || '', p.Categories || ''),
      deliveryInfo: "Delivery in 2-4 working days across Pakistan",
      sku: p.SKU || ''
    };

    // Try to find an existing product with same slug to avoid duplicates
    const slug = product.slug;
    const filePath = `data/products/${slug}.json`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(path.join("data/products", `${slug}.json`), JSON.stringify(product, null, 2));
      console.log(`  Created: ${slug}`);
    }
    added++;
  }

  console.log(`\nAdded ${added} new products`);
}

function mapCategory(cats) {
  const c = cats.toLowerCase();
  if (c.includes("fashion") || c.includes("clothing") || c.includes("apparel") || c.includes("shoe") || c.includes("watch") || c.includes("sunglass")) return "fashion";
  if (c.includes("electronic") || c.includes("mobile") || c.includes("phone") || c.includes("gadget") || c.includes("audio") || c.includes("headphone") || c.includes("earbud")) return "electronics";
  if (c.includes("beauty") || c.includes("cosmetic") || c.includes("makeup") || c.includes("skin") || c.includes("hair") || c.includes("lash") || c.includes("lip") || c.includes("perfume") || c.includes("fragrance")) return "beauty";
  if (c.includes("home") || c.includes("living") || c.includes("decor") || c.includes("furniture") || c.includes("bed") || c.includes("bath")) return "home-living";
  if (c.includes("sport") || c.includes("fitness") || c.includes("exercise") || c.includes("gym") || c.includes("yoga")) return "sports";
  if (c.includes("kid") || c.includes("toy") || c.includes("baby") || c.includes("child")) return "kids";
  if (c.includes("kitchen") || c.includes("cook") || c.includes("dining") || c.includes("food") || c.includes("bake")) return "kitchen";
  if (c.includes("grocery") || c.includes("food") || c.includes("beverage") || c.includes("snack")) return "groceries";
  return "electronics";
}

function extractFeatures(desc) {
  const features = [];
  const cleaned = desc.replace(/\*\*/g, "").replace(/<[^>]+>/g, "");
  const lines = cleaned.split(/\n|•|➤/).filter(l => l.trim().length > 8);
  lines.forEach(l => {
    const trimmed = l.trim().replace(/^[-•●➤]\s*/, "").substring(0, 80);
    if (trimmed) features.push(trimmed);
  });
  return features.slice(0, 12);
}

function extractSpecs(desc) {
  const specs = {};
  const patterns = [
    { regex: /Material[s]?:\s*([^,\n.]+)/i, key: "Material" },
    { regex: /Color[s]?:\s*([^,\n.]+)/i, key: "Color" },
    { regex: /Size[s]?:\s*([^,\n.]+)/i, key: "Size" },
    { regex: /Weight:\s*([^,\n.]+)/i, key: "Weight" },
    { regex: /Brand:\s*([^,\n.]+)/i, key: "Brand" },
    { regex: /Type:\s*([^,\n.]+)/i, key: "Type" },
    { regex: /Warranty:\s*([^,\n.]+)/i, key: "Warranty" },
    { regex: /Battery:\s*([^,\n.]+)/i, key: "Battery" },
    { regex: /Capacity:\s*([^,\n.]+)/i, key: "Capacity" },
    { regex: /Dimension[s]?:\s*([^,\n.]+)/i, key: "Dimensions" },
  ];
  patterns.forEach(({ regex, key }) => {
    const match = desc.match(regex);
    if (match) specs[key] = match[1].trim();
  });
  return specs;
}

function extractTags(name, cats) {
  function extractTags(name, cats) {
  const tags = new Set([
    ...(name || '').toLowerCase().split(/[\s\-–—]+/).filter(w => w.length > 3),
    ...(cats || '').toLowerCase().split(/[\s,>]+/).filter(w => w.length > 3)
  ]);
  return [...tags].slice(0, 8);
}