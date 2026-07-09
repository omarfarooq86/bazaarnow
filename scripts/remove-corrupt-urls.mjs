import fs from "fs";
import path from "path";

const productsDir = path.join(process.cwd(), "data", "products");
const corruptList = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "corrupt-images.json"), "utf-8")
);

// Parse each corrupt filename: {slug}-{n}.{ext}
const corruptBySlug = {};
for (const item of corruptList) {
  const match = item.file.match(/^(.+)-(\d+)\.(jpg|jpeg|png|webp)$/i);
  if (!match) {
    console.log("  Skip (no match):", item.file);
    continue;
  }
  const slug = match[1];
  const index = parseInt(match[2]) - 1; // 0-based
  if (!corruptBySlug[slug]) corruptBySlug[slug] = [];
  corruptBySlug[slug].push(index);
}

console.log(`Corrupt images mapped to ${Object.keys(corruptBySlug).length} products\n`);

let totalRemoved = 0;
let updatedProducts = 0;

for (const [slug, indices] of Object.entries(corruptBySlug)) {
  const productFile = path.join(productsDir, `${slug}.json`);
  if (!fs.existsSync(productFile)) {
    console.log(`  Not found: ${slug}`);
    continue;
  }

  try {
    const product = JSON.parse(fs.readFileSync(productFile, "utf-8"));
    const before = product.images.length;

    // Remove images at corrupt indices (process in reverse to maintain index order)
    const toRemove = new Set(indices);
    product.images = product.images.filter((_, i) => !toRemove.has(i));

    const removed = before - product.images.length;
    if (removed > 0) {
      fs.writeFileSync(productFile, JSON.stringify(product, null, 2), "utf-8");
      totalRemoved += removed;
      updatedProducts++;
    }
  } catch (e) {
    console.log(`  Error: ${slug}: ${e.message}`);
  }
}

console.log(`\nDone! Removed ${totalRemoved} corrupt URLs from ${updatedProducts} products`);
// Count remaining images
let total = 0;
let withNone = 0;
fs.readdirSync(productsDir).forEach((f) => {
  if (!f.endsWith(".json")) return;
  try {
    const p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8"));
    total += p.images?.length || 0;
    if (!p.images || p.images.length === 0) withNone++;
  } catch (e) {}
});
console.log(`Total healthy images remaining: ${total}`);
console.log(`Products with zero images: ${withNone}`);
