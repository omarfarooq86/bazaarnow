import fs from "fs";
import path from "path";

const sourceDir = path.join(process.cwd(), "images_missing");
const destDir = path.join(process.cwd(), "public", "images", "products");
const productsDir = path.join(process.cwd(), "data", "products");

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// Index all source files by filename
const sourceFiles = {};
fs.readdirSync(sourceDir).forEach(f => {
  sourceFiles[f] = path.join(sourceDir, f);
  // Also index by decoded name
  try { sourceFiles[decodeURIComponent(f)] = path.join(sourceDir, f); } catch {}
});
console.log(`Source images: ${Object.keys(sourceFiles).length}`);

// Parse CSV to get original URLs for each product
const raw = fs.readFileSync("All_Products_CSV_for_WooCommerce.csv", "utf-8");
const lines = raw.split("\n");
const productUrls = {}; // product_name -> [url, url, ...]

function parseCSVLine(line) {
  const fields = [];
  let current = "", inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) { fields.push(current.trim()); current = ""; }
    else current += ch;
  }
  fields.push(current.trim());
  return fields;
}

for (let i = 1; i < lines.length; i++) {
  let combined = lines[i];
  let quotes = (combined.match(/"/g) || []).length;
  while (quotes % 2 !== 0 && i + 1 < lines.length) { i++; combined += "\n" + lines[i]; quotes = (combined.match(/"/g) || []).length; }
  const fields = parseCSVLine(combined);
  if (fields.length < 9) continue;
  const name = fields[2].replace(/^"/, "").replace(/"$/, "").trim();
  const images = fields[8].replace(/^"/, "").replace(/"$/, "").trim();
  const urls = images.split(",").map(u => u.trim()).filter(u => u.startsWith("http"));
  if (urls.length > 0 && name.length > 5) productUrls[name] = urls;
}

// Process zero-image products
let matched = 0, updated = 0;
const stillMissing = [];

fs.readdirSync(productsDir).filter(f => f.endsWith(".json")).forEach(f => {
  const product = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8"));
  if (product.images && product.images.length > 0) return; // skip if has images

  const name = product.name.trim();
  const urls = productUrls[name];
  if (!urls) { stillMissing.push(name.substring(0, 50)); return; }

  const newImages = [];
  for (const url of urls) {
    const filename = url.split("/").pop()?.split("?")[0];
    if (!filename) continue;

    // Try exact match, then decoded match
    let sourcePath = sourceFiles[filename];
    if (!sourcePath) {
      try { sourcePath = sourceFiles[decodeURIComponent(filename)]; } catch {}
    }
    // Try fuzzy: find file containing the filename base
    if (!sourcePath) {
      const base = filename.replace(/\.[^.]+$/, "").substring(0, 30);
      for (const [sf, sp] of Object.entries(sourceFiles)) {
        if (sf.includes(base)) { sourcePath = sp; filename; break; }
      }
    }

    if (sourcePath) {
      const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
      const newName = `${product.slug}-${newImages.length + 1}.${ext}`;
      const destPath = path.join(destDir, newName);
      fs.copyFileSync(sourcePath, destPath);
      newImages.push(`/images/products/${newName}`);
      matched++;
    }
  }

  if (newImages.length > 0) {
    product.images = newImages;
    fs.writeFileSync(path.join(productsDir, f), JSON.stringify(product, null, 2), "utf-8");
    updated++;
  } else {
    stillMissing.push(name.substring(0, 50));
  }
});

console.log(`\nMatched images: ${matched}`);
console.log(`Updated products: ${updated}`);
if (stillMissing.length > 0) {
  console.log(`\nStill missing (${stillMissing.length}):`);
  stillMissing.forEach(s => console.log(`  - ${s}`));
}
