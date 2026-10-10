// Repair images lost to the comma-in-filename CSV bug (see splitImageCell in
// sync-csv-catalog.mjs).
//
// The bug truncated every image URL whose supplier filename contained a comma,
// so those URLs 404'd and download-csv-images.mjs silently dropped them from the
// product's `images` array. Nothing on disk is broken — products are just
// MISSING images. So a product needs repair exactly when the CSV lists more
// images than the product currently has.
//
// For each such product we re-fetch its complete image list from the CSV,
// name the files `{slug}-{n}.{ext}` in CSV order, and rewrite `images`.
//
//   node scripts/repair-csv-images.mjs            # DRY RUN (default, writes nothing)
//   node scripts/repair-csv-images.mjs --apply    # download + rewrite
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const APPLY = process.argv.includes("--apply");
const CSV = path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv");
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "products");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const CONCURRENCY = 8;
const MAX_BYTES = 8 * 1024 * 1024;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function parseCSV(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}

// Filenames contain commas, so a bare split(",") truncates them.
const splitImageCell = (cell) =>
  (cell || "").split(/,(?=https?:)/).map((u) => u.trim()).filter((u) => u.startsWith("http"));

const CT_EXT = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };
const EXT_OK = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function urlExt(url) {
  const raw = (url.split(".").pop() || "").split("?")[0].toLowerCase();
  return EXT_OK.has(raw) ? raw : "jpg";
}

function download(url, depth = 0) {
  return new Promise((resolve) => {
    if (depth > 5) return resolve({ ok: false, reason: "too many redirects" });
    let proto;
    try { proto = new URL(url).protocol === "https:" ? https : http; }
    catch { return resolve({ ok: false, reason: "bad url" }); }
    const req = proto.get(url, {
      timeout: 20000,
      headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
    }, (res) => {
      const { statusCode } = res;
      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(download(new URL(res.headers.location, url).toString(), depth + 1));
      }
      if (statusCode !== 200) { res.resume(); return resolve({ ok: false, reason: `HTTP ${statusCode}` }); }
      const ct = (res.headers["content-type"] || "").split(";")[0].trim();
      if (!ct.startsWith("image/")) { res.resume(); return resolve({ ok: false, reason: `content-type ${ct || "?"}` }); }
      const chunks = [];
      let bytes = 0, aborted = false;
      res.on("data", (ch) => {
        bytes += ch.length;
        if (bytes > MAX_BYTES) { aborted = true; res.destroy(); }
        else chunks.push(ch);
      });
      res.on("end", () => {
        if (aborted) return resolve({ ok: false, reason: "too large" });
        resolve({ ok: true, bytes, buf: Buffer.concat(chunks), ext: CT_EXT[ct] || urlExt(url) });
      });
      res.on("error", () => resolve({ ok: false, reason: "read error" }));
    });
    req.on("error", (e) => resolve({ ok: false, reason: e.code || "network error" }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, reason: "timeout" }); });
  });
}

// ---------- read CSV, index by SKU ----------
const rows = parseCSV(fs.readFileSync(CSV, "utf-8"));
const head = rows[0].map((h) => h.trim());
const iSku = head.indexOf("SKU"), iImg = head.indexOf("Images"), iName = head.indexOf("Name");
const csvBySku = new Map();
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (r.length !== head.length) continue;
  const sku = (r[iSku] || "").trim().toLowerCase();
  if (!sku) continue;
  csvBySku.set(sku, { name: (r[iName] || "").trim(), urls: splitImageCell(r[iImg]) });
}
console.log(`CSV records indexed: ${csvBySku.size}`);

// ---------- find products whose images are incomplete or out of order ----------
// A repaired product can still be wrong if `images` is not in CSV order, so check
// the index embedded in each filename too: images[i] should be `{slug}-{i+1}.ext`.
const slugRe = (slug) => new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)\\.[a-z]+$`, "i");
const imageIndex = (slug, p) => {
  const m = slugRe(slug).exec(p.replace("/images/products/", ""));
  return m ? Number(m[1]) : NaN;
};
// Images should run in ascending index order, because images[0] is the gallery
// and OG thumbnail. Gaps are fine — a dead source image leaves one — but a
// shuffle is not. Arrays that use some other naming scheme yield no indices and
// are left alone rather than guessed at.
function indicesAscending(slug, images) {
  const idx = images.map((p) => imageIndex(slug, p));
  if (idx.some((n) => !Number.isFinite(n))) return true; // not our convention
  return idx.every((n, i) => i === 0 || n > idx[i - 1]);
}

const targets = [];
for (const f of fs.readdirSync(PRODUCTS_DIR).filter((x) => x.endsWith(".json"))) {
  const p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8"));
  const row = csvBySku.get(((p.sku || "").trim()).toLowerCase());
  if (!row || !row.urls.length) continue;
  const current = p.images || [];
  const missing = current.length < row.urls.length;
  const unordered = !missing && !indicesAscending(p.slug, current);
  if (!missing && !unordered) continue;
  targets.push({
    file: f, slug: p.slug, name: p.name, sku: p.sku, current, urls: row.urls,
    lost: row.urls.length - current.length, reason: missing ? "missing" : "order",
  });
}

targets.sort((a, b) => b.lost - a.lost);
console.log(`\nproducts needing image repair: ${targets.length}\n`);
console.log("  why      lost  have  csv   sku               product");
for (const t of targets) {
  console.log(
    `  ${t.reason.padEnd(8)} ${String(t.lost).padStart(4)}  ${String(t.current.length).padStart(4)}  ${String(t.urls.length).padStart(3)}   ` +
    `${String(t.sku).padEnd(17)} ${t.name.slice(0, 40)}`
  );
}
const totalLost = targets.reduce((s, t) => s + t.lost, 0);
console.log(`\nproducts: ${targets.length}   images to recover: ${totalLost}   (of ${targets.reduce((s, t) => s + t.urls.length, 0)} listed)`);
if (!APPLY) {
  console.log("\nDRY RUN — nothing written. Re-run with --apply to download and rewrite.");
  process.exit(0);
}

// ---------- fetch every CSV image for each target ----------
// Images resolve concurrently, so completion order is arbitrary. Carry the CSV
// index through and sort by it at the end — images[0] is the gallery and OG
// thumbnail, so order is meaningful.
let ok = 0, fail = 0, cached = 0;
const failures = [];
const work = targets.filter((t) => t.reason === "missing").flatMap((t) => t.urls.map((url, j) => ({ t, url, j })));
console.log(`\nfetching ${work.length} images...`);
const fetched = new Map(); // slug -> [{ j, rel, buf }]

for (let i = 0; i < work.length; i += CONCURRENCY) {
  await Promise.all(work.slice(i, i + CONCURRENCY).map(async (item) => {
    const prefix = `${item.t.slug}-${item.j + 1}.`;
    // reuse a file already on disk for this position so re-runs are idempotent
    const existing = fs.readdirSync(IMAGES_DIR).find((n) => n.startsWith(prefix));
    if (existing) {
      const buf = fs.readFileSync(path.join(IMAGES_DIR, existing));
      if (buf.length) {
        if (!fetched.has(item.t.slug)) fetched.set(item.t.slug, []);
        fetched.get(item.t.slug).push({ j: item.j, rel: `/images/products/${existing}`, buf });
        cached++;
        return;
      }
    }
    const r = await download(item.url);
    if (r.ok) {
      const rel = `/images/products/${item.t.slug}-${item.j + 1}.${r.ext}`;
      if (!fetched.has(item.t.slug)) fetched.set(item.t.slug, []);
      fetched.get(item.t.slug).push({ j: item.j, rel, buf: r.buf });
      ok++;
    } else {
      const rel = `/images/products/${item.t.slug}-${item.j + 1}.${urlExt(item.url)}`;
      fail++;
      failures.push({ slug: item.t.slug, url: item.url, rel, reason: r.reason });
    }
  }));
  process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, work.length)}/${work.length}  ok:${ok} cached:${cached} fail:${fail}   `);
}
console.log("\n");
for (const list of fetched.values()) list.sort((a, b) => a.j - b.j);

// ---------- write files + rewrite arrays (never regress) ----------
// 33 slugs are prefixes of other slugs (e.g. "...-lcd-dis" and "...-lcd-dis-2"),
// so a naive `startsWith(slug + "-")` cleanup would delete another product's
// images. Collect every referenced filename first and never delete those.
const targetFiles = new Set(targets.map((t) => t.file));
const referenced = new Set();
for (const f of fs.readdirSync(PRODUCTS_DIR).filter((x) => x.endsWith(".json"))) {
  if (targetFiles.has(f)) continue; // a target's own array must not block its cleanup
  try {
    for (const img of JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8")).images || []) {
      referenced.add(img.replace("/images/products/", ""));
    }
  } catch {}
}

let repaired = 0, reordered = 0, skipped = 0;

// --- order-only: the files are all present, the array is just shuffled.
// Sorting by the index in each filename is a pure JSON edit — no disk I/O.
for (const t of targets.filter((x) => x.reason === "order")) {
  const sorted = [...t.current].sort((a, b) => imageIndex(t.slug, a) - imageIndex(t.slug, b));
  const file = path.join(PRODUCTS_DIR, t.file);
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  data.images = sorted;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  reordered++;
}

// --- missing: fetch the full list and rewrite
for (const t of targets.filter((x) => x.reason === "missing")) {
  const got = fetched.get(t.slug) || [];
  if (!got.length || got.length < t.current.length) { skipped++; continue; }
  for (const g of got) {
    const name = g.rel.replace("/images/products/", "");
    fs.writeFileSync(path.join(PUBLIC_DIR, g.rel.replace(/^\//, "")), g.buf);
    referenced.add(name);
  }
  const images = got.map((g) => g.rel);
  // drop now-unreferenced files belonging to THIS slug's own numbering only
  const keep = new Set(images.map((r) => r.replace("/images/products/", "")));
  const ownNumbered = new RegExp(`^${t.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+\\.[a-z]+$`, "i");
  for (const n of fs.readdirSync(IMAGES_DIR)) {
    if (!ownNumbered.test(n)) continue;
    if (keep.has(n) || referenced.has(n)) continue;
    fs.unlinkSync(path.join(IMAGES_DIR, n));
  }
  const file = path.join(PRODUCTS_DIR, t.file);
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  data.images = images;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  repaired++;
}
console.log(`Repaired ${repaired} products (images fetched), reordered ${reordered} (order only), skipped ${skipped}.`);

if (failures.length) {
  fs.writeFileSync(path.join(process.cwd(), "scripts", "image-repair-failures.json"), JSON.stringify(failures, null, 2));
  console.log(`\n${failures.length} images still failed -> scripts/image-repair-failures.json`);
  const byReason = {};
  for (const f of failures) byReason[f.reason] = (byReason[f.reason] || 0) + 1;
  console.log("By reason:", JSON.stringify(byReason));
}
console.log("\nNext: node scripts/regenerate-catalog.mjs");
