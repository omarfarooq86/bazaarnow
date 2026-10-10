// Diagnostic: for a SKU, show current on-disk images vs the CSV-derived image URLs.
//   node scripts/inspect-sku-images.mjs <SKU> [SKU...]
import fs from "fs";
import path from "path";

function parseCSV(t) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const splitImageCell = (c) => (c || "").split(/,(?=https?:)/).map((u) => u.trim()).filter((u) => u.startsWith("http"));

const rows = parseCSV(fs.readFileSync("All_Products_CSV_for_WooCommerce.csv", "utf-8"));
const head = rows[0].map((h) => h.trim());
const iSku = head.indexOf("SKU"), iImg = head.indexOf("Images");
const csvBySku = new Map();
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (r.length !== head.length) continue;
  csvBySku.set((r[iSku] || "").trim().toLowerCase(), splitImageCell(r[iImg]));
}

const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const all = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));

for (const sku of process.argv.slice(2)) {
  const file = all.find((f) => {
    try { return (JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8")).sku || "").toLowerCase() === sku.toLowerCase(); }
    catch { return false; }
  });
  if (!file) { console.log(`\n${sku}: no product file`); continue; }
  const p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, file), "utf-8"));
  const urls = csvBySku.get(sku.toLowerCase()) || [];
  console.log(`\n=== ${sku}  ${file}`);
  console.log(`  name: ${p.name}`);
  console.log(`  csv urls (${urls.length}):`);
  urls.forEach((u, j) => console.log(`    [${j + 1}] ${u}`));
  console.log(`  current images (${(p.images || []).length}):`);
  for (const img of p.images || []) {
    const abs = path.join(process.cwd(), "public", img.replace(/^\//, ""));
    let size = "-";
    try { size = fs.statSync(abs).size; } catch { size = "MISSING"; }
    console.log(`    ${img}  size=${size}`);
  }
  // what else sits on disk under this slug?
  const dir = path.join(process.cwd(), "public", "images", "products");
  const stray = fs.readdirSync(dir).filter((n) => n.startsWith(p.slug + "-"));
  console.log(`  files on disk for this slug (${stray.length}):`);
  stray.forEach((n) => console.log(`    ${n}  size=${fs.statSync(path.join(dir, n)).size}`));
}
