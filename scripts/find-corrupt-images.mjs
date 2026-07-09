import fs from "fs";
import path from "path";
import sharp from "sharp";

const imagesDir = path.join(process.cwd(), "public", "images", "products");
const files = fs.readdirSync(imagesDir).filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

console.log(`Scanning ${files.length} images for corruption...\n`);

const corrupt = [];

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const filePath = path.join(imagesDir, file);

  try {
    const metadata = await sharp(filePath).metadata();
    // Valid image has width and height
    if (!metadata.width || !metadata.height) {
      corrupt.push({ file, reason: "Missing dimensions", size: fs.statSync(filePath).size });
    }
  } catch (e) {
    corrupt.push({ file, reason: e.message.substring(0, 60), size: fs.statSync(filePath).size });
  }

  if ((i + 1) % 500 === 0) {
    console.log(`  ${i + 1}/${files.length} scanned...`);
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Total scanned: ${files.length}`);
console.log(`Corrupt: ${corrupt.length}`);
console.log(`Healthy: ${files.length - corrupt.length}\n`);

if (corrupt.length > 0) {
  console.log(`=== CORRUPT IMAGES (${corrupt.length}) ===\n`);

  // Group by product
  const byProduct = {};
  for (const c of corrupt) {
    const slug = c.file.replace(/-\d+\.(jpg|jpeg|png|webp)$/, "");
    if (!byProduct[slug]) byProduct[slug] = [];
    byProduct[slug].push(c);
  }

  let idx = 1;
  for (const [slug, imgs] of Object.entries(byProduct)) {
    console.log(`${idx}. Product: ${slug.substring(0, 70)}`);
    imgs.forEach((img) => {
      const sizeKB = (img.size / 1024).toFixed(1);
      console.log(`   📄 ${img.file} (${sizeKB}KB) — ${img.reason}`);
    });
    console.log();
    idx++;
  }

  // Save corrupt list to file for cleanup
  const listFile = path.join(process.cwd(), "corrupt-images.json");
  fs.writeFileSync(listFile, JSON.stringify(corrupt, null, 2));
  console.log(`Full list saved to corrupt-images.json`);
} else {
  console.log("No corrupt images found!");
}
