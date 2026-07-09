import fs from "fs";
import path from "path";
import sharp from "sharp";

const imagesDir = path.join(process.cwd(), "public", "images", "products");
const productsDir = path.join(process.cwd(), "data", "products");
const files = fs.readdirSync(imagesDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

console.log(`Scanning ${files.length} images...\n`);

const corruptFiles = [];
const corruptMap = {}; // slug -> [filenames]

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const filePath = path.join(imagesDir, file);

  try {
    const metadata = await sharp(filePath).metadata();
    if (!metadata.width || !metadata.height) {
      corruptFiles.push(file);
    }
  } catch (e) {
    corruptFiles.push(file);
  }

  if ((i + 1) % 1000 === 0) {
    console.log(`  ${i + 1}/${files.length} scanned...`);
  }
}

// Build slug -> filenames map
for (const file of corruptFiles) {
  const slug = file.replace(/-\d+\.(jpg|jpeg|png|webp)$/, "");
  if (!corruptMap[slug]) corruptMap[slug] = [];
  corruptMap[slug].push(file);
}

console.log(`Found ${corruptFiles.length} corrupt images across ${Object.keys(corruptMap).length} products\n`);

// Delete corrupt files
let deletedCount = 0;
for (const file of corruptFiles) {
  const filePath = path.join(imagesDir, file);
  try {
    fs.unlinkSync(filePath);
    deletedCount++;
  } catch (e) {
    console.log(`  Could not delete: ${file}`);
  }
}
console.log(`Deleted ${deletedCount} corrupt image files`);

// Update product JSONs to remove corrupt image references
let updatedProducts = 0;
for (const [slug, badFiles] of Object.entries(corruptMap)) {
  const productFile = path.join(productsDir, `${slug}.json`);
  if (!fs.existsSync(productFile)) {
    console.log(`  Product not found: ${slug}`);
    continue;
  }

  try {
    const product = JSON.parse(fs.readFileSync(productFile, "utf8"));
    const badSet = new Set(badFiles.map((f) => `/images/products/${f}`));
    const before = product.images.length;
    product.images = product.images.filter((img) => !badSet.has(img));
    const removed = before - product.images.length;

    if (removed > 0) {
      fs.writeFileSync(productFile, JSON.stringify(product, null, 2), "utf8");
      updatedProducts++;
    }
  } catch (e) {
    console.log(`  Error updating ${slug}: ${e.message}`);
  }
}

console.log(`Updated ${updatedProducts} product JSON files (removed corrupt image refs)`);
console.log(`\nDone! Corrupt images cleaned.`);
