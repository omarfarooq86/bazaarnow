// Download images for the newly-added CSV products into public/images/products/
// and rewrite each product's `images` array to local paths. Failed downloads are
// dropped from the array so no product references a missing file.
//
//   node scripts/download-csv-images.mjs            # download
//   node scripts/download-csv-images.mjs --relink   # only fix arrays, no network
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const RELINK_ONLY = process.argv.includes("--relink");
const PREVIEW = path.join(process.cwd(), "scripts", "sync-preview.json");
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "products");
const CONCURRENCY = 8;
const MAX_BYTES = 8 * 1024 * 1024;

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const preview = JSON.parse(fs.readFileSync(PREVIEW, "utf-8"));
const targets = preview.newProducts.filter((p) => Array.isArray(p._remote) && p._remote.length);
console.log(`Products to link: ${targets.length}`);

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function download(url, dest, depth = 0) {
  return new Promise((resolve) => {
    if (depth > 5) return resolve({ ok: false, reason: "too many redirects" });
    let proto;
    try { proto = new URL(url).protocol === "https:" ? https : http; }
    catch { return resolve({ ok: false, reason: "bad url" }); }

    const req = proto.get(url, {
      timeout: 20000,
      headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9" },
    }, (res) => {
      const { statusCode } = res;
      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        return resolve(download(next, dest, depth + 1));
      }
      if (statusCode !== 200) { res.resume(); return resolve({ ok: false, reason: `HTTP ${statusCode}` }); }
      const ct = res.headers["content-type"] || "";
      if (!ct.startsWith("image/")) { res.resume(); return resolve({ ok: false, reason: `content-type ${ct || "?"}` }); }
      const len = parseInt(res.headers["content-length"] || "0", 10);
      if (len && len > MAX_BYTES) { res.resume(); return resolve({ ok: false, reason: "too large" }); }

      const tmp = dest + ".part";
      const out = fs.createWriteStream(tmp);
      let bytes = 0, aborted = false;
      res.on("data", (ch) => {
        bytes += ch.length;
        if (bytes > MAX_BYTES) { aborted = true; res.destroy(); out.destroy(); }
      });
      res.pipe(out);
      out.on("finish", () => {
        out.close(() => {
          if (aborted) { try { fs.unlinkSync(tmp); } catch {} return resolve({ ok: false, reason: "too large" }); }
          try { fs.renameSync(tmp, dest); } catch (e) { return resolve({ ok: false, reason: "rename failed" }); }
          resolve({ ok: true, bytes });
        });
      });
      out.on("error", () => { try { fs.unlinkSync(tmp); } catch {} resolve({ ok: false, reason: "write error" }); });
    });
    req.on("error", (e) => resolve({ ok: false, reason: e.code || "network error" }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, reason: "timeout" }); });
  });
}

// build queue
const queue = [];
for (const p of targets) {
  p._local = [];
  p._remote.forEach((url, j) => {
    const ext = (url.split(".").pop() || "jpg").split("?")[0].toLowerCase();
    const safe = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    queue.push({ product: p, url, name: `${p.slug}-${j + 1}.${safe}` });
  });
}
console.log(`Images to fetch: ${queue.length}${RELINK_ONLY ? " (relink only, no network)" : ""}`);

let done = 0, ok = 0, cached = 0, fail = 0;
const failures = [];

async function run() {
  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    await Promise.all(queue.slice(i, i + CONCURRENCY).map(async (item) => {
      const dest = path.join(IMAGES_DIR, item.name);
      const local = `/images/products/${item.name}`;
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
        item.product._local.push(local); cached++;
      } else if (RELINK_ONLY) {
        fail++; failures.push({ name: item.name, reason: "missing (relink only)" });
      } else {
        const r = await download(item.url, dest);
        if (r.ok) { item.product._local.push(local); ok++; }
        else { fail++; failures.push({ name: item.name, url: item.url, reason: r.reason }); }
      }
      done++;
    }));
    if (i % (CONCURRENCY * 12) === 0 || i + CONCURRENCY >= queue.length) {
      process.stdout.write(`\r  ${done}/${queue.length}  new:${ok} cached:${cached} fail:${fail}   `);
    }
  }
}
await run();
console.log("\n");

// rewrite product JSONs with only successfully-downloaded images
let rewritten = 0, emptied = 0;
for (const p of targets) {
  const file = path.join(PRODUCTS_DIR, `${p.slug}.json`);
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (p._local.length) data.images = p._local;
  else { data.images = []; emptied++; }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  rewritten++;
}
console.log(`Rewrote ${rewritten} product files (${emptied} left with no images)`);

if (failures.length) {
  fs.writeFileSync(path.join(process.cwd(), "scripts", "image-download-failures.json"), JSON.stringify(failures, null, 2));
  console.log(`\n${failures.length} failures -> scripts/image-download-failures.json`);
  const byReason = {};
  for (const f of failures) byReason[f.reason] = (byReason[f.reason] || 0) + 1;
  console.log("By reason:", JSON.stringify(byReason));
  console.log("Sample:", failures.slice(0, 5).map((f) => `${f.name}: ${f.reason}`).join(" | "));
}
console.log(`\nDone. downloaded:${ok} cached:${cached} failed:${fail}`);
