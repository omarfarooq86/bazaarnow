import fs from "fs";
import path from "path";

const sourceDir = path.join(process.cwd(), "first100");
const destDir = path.join(process.cwd(), "public", "images", "products");
const productsDir = path.join(process.cwd(), "data", "products");

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// Index source files by filename
const sourceFiles = {};
fs.readdirSync(sourceDir).forEach(f => {
  sourceFiles[f] = path.join(sourceDir, f);
});
console.log(`Source files: ${Object.keys(sourceFiles).length}`);

// Process all product JSONs
const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith(".json"));
let matched = 0, updated = 0, skipped = 0;

for (const pf of productFiles) {
  const product = JSON.parse(fs.readFileSync(path.join(productsDir, pf), "utf-8"));
  let changed = false;

  const newImages = product.images.map((url, idx) => {
    // If already local, keep it
    if (url.startsWith("/images/")) { skipped++; return url; }

    // Extract filename from URL
    const filename = url.split("/").pop()?.split("?")[0];
    if (!filename) { skipped++; return url; }

    // Check if we have this file locally
    if (sourceFiles[filename]) {
      const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
      const newName = `${product.slug}-${idx + 1}.${ext}`;
      const destPath = path.join(destDir, newName);

      // Copy file
      fs.copyFileSync(sourceFiles[filename], destPath);
      const localPath = `/images/products/${newName}`;
      matched++;
      changed = true;
      return localPath;
    }
    return url; // Keep original URL if not in source
  });

  if (changed) {
    product.images = newImages;
    fs.writeFileSync(path.join(productsDir, pf), JSON.stringify(product, null, 2), "utf-8");
    updated++;
  }
}

console.log(`Matched & copied: ${matched} images`);
console.log(`Updated products: ${updated}`);
console.log(`Already local: ${skipped}`);

// Count remaining yourmart URLs
let remaining = 0;
fs.readdirSync(productsDir).filter(f => f.endsWith(".json")).forEach(f => {
  const p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8"));
  p.images?.forEach(u => { if (u.includes("yourmart.pk")) remaining++; });
});
console.log(`\nStill need downloading: ${remaining} yourmart images`);
