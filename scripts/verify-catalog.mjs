// Verify data integrity after the CSV sync.
//   node scripts/verify-catalog.mjs
import fs from "fs";
import path from "path";

const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));
const problems = { unreadable: [], missingLocalImage: [], remoteImage: [], noImage: [], dupSlug: [], dupSku: [], badPrice: [], noName: [], noDesc: [] };
const slugs = new Map(), skus = new Map();
let missingCount = 0, remoteCount = 0, noImgCount = 0;

for (const f of files) {
  let p;
  try { p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8")); }
  catch (e) { problems.unreadable.push(f); continue; }

  if (!p.name) problems.noName.push(f);
  if (!p.description) problems.noDesc.push(f);
  if (typeof p.price !== "number" || p.price <= 0) problems.badPrice.push(`${f} (${p.price})`);

  if (slugs.has(p.slug)) problems.dupSlug.push(p.slug);
  slugs.set(p.slug, f);
  if (p.sku) { if (skus.has(p.sku)) problems.dupSku.push(p.sku); skus.set(p.sku, f); }

  const imgs = p.images || [];
  if (!imgs.length) { problems.noImage.push(p.slug); noImgCount++; }
  for (const img of imgs) {
    if (/^https?:/.test(img)) { problems.remoteImage.push(`${p.slug} -> ${img}`); remoteCount++; continue; }
    const rel = img.replace(/^\//, "");
    if (!fs.existsSync(path.join(PUBLIC_DIR, rel))) {
      problems.missingLocalImage.push(`${p.slug} -> ${img}`);
      missingCount++;
    }
  }
}

console.log("================ CATALOG VERIFICATION ================");
console.log(`product files      : ${files.length}`);
console.log(`unique slugs       : ${slugs.size}`);
console.log(`unique SKUs        : ${skus.size}`);
console.log();
console.log(`products w/o image : ${noImgCount}`);
console.log(`remote image refs  : ${remoteCount}`);
console.log(`missing local files: ${missingCount}`);
console.log();
console.log(`unreadable JSON    : ${problems.unreadable.length}`);
console.log(`duplicate slugs    : ${problems.dupSlug.length}`);
console.log(`duplicate SKUs     : ${problems.dupSku.length}`);
console.log(`no name            : ${problems.noName.length}`);
console.log(`no description     : ${problems.noDesc.length}`);
console.log(`bad price          : ${problems.badPrice.length}`);

for (const [k, v] of Object.entries(problems)) {
  if (!v.length) continue;
  if (["missingLocalImage", "remoteImage", "noImage", "dupSku", "noDesc"].includes(k)) {
    console.log(`\n--- ${k} (${v.length}), first 10 ---`);
    v.slice(0, 10).forEach((x) => console.log("   " + x));
  }
}

// search index vs products
const idx = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, "search-index.json"), "utf-8"));
console.log(`\nsearch-index entries: ${idx.length} ${idx.length === files.length ? "OK" : "MISMATCH"}`);
const idxNoImg = idx.filter((e) => !e.image).length;
console.log(`search-index w/o image: ${idxNoImg}`);

const ok = problems.unreadable.length === 0 && problems.dupSlug.length === 0 &&
  problems.missingLocalImage.length === 0 && problems.remoteImage.length === 0 &&
  problems.badPrice.length === 0 && idx.length === files.length;
console.log(`\nRESULT: ${ok ? "PASS" : "ISSUES FOUND (see above)"}`);
process.exit(ok ? 0 : 1);
