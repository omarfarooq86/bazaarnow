import fs from "fs";
import path from "path";

const destDir = path.join(process.cwd(), "public", "images", "products");
const productsDir = path.join(process.cwd(), "data", "products");
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// Index ALL files from ALL batch folders
const sourceFiles = {};
const batchDirs = fs.readdirSync(process.cwd()).filter(f => f.match(/^(batch\d*|batch-\d*|first100|yourmart-images)$/));
console.log(`Found batch folders: ${batchDirs.join(", ")}`);

for (const dir of batchDirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.statSync(fullPath).isDirectory()) continue;
  fs.readdirSync(fullPath).forEach(f => {
    if (!sourceFiles[f]) sourceFiles[f] = path.join(fullPath, f);
  });
}
console.log(`Total unique source images: ${Object.keys(sourceFiles).length}`);

// Process all products
const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith(".json"));
let matched = 0, updated = 0, skipped = 0;

for (const pf of productFiles) {
  const product = JSON.parse(fs.readFileSync(path.join(productsDir, pf), "utf-8"));
  let changed = false;

  const newImages = product.images.map((url, idx) => {
    if (url.startsWith("/images/")) { skipped++; return url; }
    let filename = url.split("/").pop()?.split("?")[0];
    if (!filename) return url;
    // Try exact match first, then URL-decoded match
    let match = sourceFiles[filename];
    if (!match) {
      const decoded = decodeURIComponent(filename);
      match = sourceFiles[decoded];
      if (match) filename = decoded;
    }
    if (!match) return url;

    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const newName = `${product.slug}-${idx + 1}.${ext}`;
    const destPath = path.join(destDir, newName);
    fs.copyFileSync(match, destPath);
    matched++;
    changed = true;
    return `/images/products/${newName}`;
  });

  if (changed) {
    product.images = newImages;
    fs.writeFileSync(path.join(productsDir, pf), JSON.stringify(product, null, 2), "utf-8");
    updated++;
  }
}

console.log(`\nMatched & copied: ${matched} images`);
console.log(`Updated products: ${updated}`);
console.log(`Already local / skipped: ${skipped}`);

// Count remaining
let remaining = 0;
fs.readdirSync(productsDir).filter(f => f.endsWith(".json")).forEach(f => {
  const p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8"));
  p.images?.forEach(u => { if (u.includes("yourmart.pk")) remaining++; });
});
console.log(`\nStill need downloading: ${remaining} yourmart images`);

// Find products fully converted
let fullyConverted = 0;
fs.readdirSync(productsDir).filter(f => f.endsWith(".json")).forEach(f => {
  const p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8"));
  const yt = p.images?.filter(u => u.includes("yourmart.pk")).length || 0;
  if (yt === 0 && p.images?.length > 0 && p.images?.every(u => u.startsWith("/images/"))) {
    fullyConverted++;
  }
});
console.log(`Fully converted products (all local): ${fullyConverted}`);
