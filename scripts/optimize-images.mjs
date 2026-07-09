import fs from "fs";
import path from "path";
import sharp from "sharp";

const imagesDir = path.join(process.cwd(), "public", "images", "products");
const files = fs.readdirSync(imagesDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

console.log(`Found ${files.length} images to optimize...`);

let optimized = 0;
let skipped = 0;
let saved = 0;
const CONCURRENCY = 5;

async function optimizeFile(file) {
  const filePath = path.join(imagesDir, file);
  const stat = fs.statSync(filePath);

  // Skip small files
  if (stat.size < 50000) {
    skipped++;
    return;
  }

  const ext = path.extname(file).toLowerCase();
  const tmpPath = filePath + ".tmp";

  try {
    let pipeline = sharp(filePath);

    // Resize if too large (max 1200px)
    const metadata = await pipeline.metadata();
    if (metadata.width > 1200) {
      pipeline = pipeline.resize(1200);
    }

    // Compress based on format
    if (ext === ".jpg" || ext === ".jpeg") {
      await pipeline.jpeg({ quality: 80, mozjpeg: true }).toFile(tmpPath);
    } else if (ext === ".png") {
      await pipeline.png({ quality: 80, compressionLevel: 9 }).toFile(tmpPath);
    } else if (ext === ".webp") {
      await pipeline.webp({ quality: 80 }).toFile(tmpPath);
    }

    // Replace original with optimized version
    const newStat = fs.statSync(tmpPath);
    if (newStat.size < stat.size) {
      fs.renameSync(tmpPath, filePath);
      saved += stat.size - newStat.size;
      optimized++;
    } else {
      fs.unlinkSync(tmpPath);
      skipped++;
    }
  } catch (e) {
    // If optimization fails, keep original
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    skipped++;
  }
}

// Process in batches
const batches = [];
for (let i = 0; i < files.length; i += CONCURRENCY) {
  batches.push(files.slice(i, i + CONCURRENCY));
}

for (let i = 0; i < batches.length; i++) {
  await Promise.all(batches[i].map(optimizeFile));
  if ((i + 1) % 20 === 0) {
    const pct = Math.round((i * CONCURRENCY / files.length) * 100);
    console.log(`  ${pct}% — Optimized: ${optimized}, Saved: ${(saved / 1024 / 1024).toFixed(1)}MB`);
  }
}

console.log(`\nDone! Optimized ${optimized} images, saved ${(saved / 1024 / 1024).toFixed(1)}MB`);
console.log(`Skipped ${skipped} (already small or couldn't improve)`);
