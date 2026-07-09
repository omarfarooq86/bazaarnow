import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const productsDir = path.join(process.cwd(), "data", "products");
const imagesDir = path.join(process.cwd(), "public", "images", "products");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(url, { timeout: 15000 }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        file.close();
        fs.unlinkSync(destPath);
        resolve(downloadFile(redirectUrl, destPath));
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        resolve(false);
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(true);
      });
    });
    req.on("error", () => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
    req.on("timeout", () => {
      req.destroy();
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

// Get all products
const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
const products = [];
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(productsDir, file), "utf-8"));
    products.push({ file, data });
  } catch (e) {
    console.log(`Skip corrupt: ${file}`);
  }
}

console.log(`Processing ${products.length} products...`);

let totalImages = 0;
let downloaded = 0;
let failed = 0;
let skipped = 0;
const CONCURRENCY = 10;

// Build download queue
const queue = [];
for (const { data } of products) {
  const images = data.images || [];
  for (let j = 0; j < images.length; j++) {
    const url = images[j];
    if (url.startsWith("/images/")) { skipped++; continue; }
    totalImages++;
    const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
    const validExts = ["jpg", "jpeg", "png", "webp", "gif"];
    const safeExt = validExts.includes(ext) ? ext : "jpg";
    const localName = `${data.slug}-${j + 1}.${safeExt}`;
    queue.push({ url, localName, slug: data.slug, index: j, data });
  }
}

console.log(`Downloading ${queue.length} images with ${CONCURRENCY} parallel connections...\n`);

let completed = 0;
async function processQueue() {
  const batches = [];
  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    batches.push(queue.slice(i, i + CONCURRENCY));
  }

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map(async (item) => {
        const localPath = path.join(imagesDir, item.localName);
        if (fs.existsSync(localPath)) return { ...item, success: true, cached: true };
        const success = await downloadFile(item.url, localPath);
        return { ...item, success, cached: false };
      })
    );

    // Update product data
    const byProduct = {};
    for (const r of results) {
      if (!byProduct[r.slug]) byProduct[r.slug] = { data: r.data, images: [...(r.data.images || [])] };
      if (r.success) {
        byProduct[r.slug].images[r.index] = `/images/products/${r.localName}`;
        if (!r.cached) downloaded++;
        else skipped++;
      } else {
        failed++;
        console.log(`  FAIL: ${r.slug} image ${r.index + 1}`);
      }
    }

    for (const [slug, info] of Object.entries(byProduct)) {
      info.data.images = info.images;
      const fileName = `${slug}.json`;
      fs.writeFileSync(path.join(productsDir, fileName), JSON.stringify(info.data, null, 2), "utf-8");
    }

    completed += batch.length;
    console.log(`  ${Math.round(completed / queue.length * 100)}% — DL: ${downloaded}, Local: ${skipped}, Fail: ${failed}`);
  }
}

await processQueue();

// Also copy kids building blocks table images if they exist
const kidsDir = path.join(process.cwd(), "kids building blocks table");
if (fs.existsSync(kidsDir)) {
  // Already copied earlier
}

console.log(`\nDone! Total images: ${totalImages}, Downloaded: ${downloaded}, Already local: ${skipped}, Failed: ${failed}`);
