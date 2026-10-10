// Diagnostic: show the raw `Images` field for products whose images failed to download.
//   node scripts/inspect-image-rows.mjs
import fs from "fs";
import path from "path";

const CSV = path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv");
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

// Split an `Images` cell correctly. Filenames may contain commas, so a bare
// split(",") truncates them; the real delimiter is a comma followed by a URL.
function splitImageCell(cell) {
  return (cell || "")
    .split(/,(?=https?:)/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith("http"));
}

// Record-aware CSV parse — descriptions contain newlines inside quoted fields,
// so a line-based split mis-reads the file.
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

const rows = parseCSV(fs.readFileSync(CSV, "utf-8"));
const head = rows[0].map((h) => h.trim());
const iSku = head.indexOf("SKU");
const iImg = head.indexOf("Images");
const iName = head.indexOf("Name");

const bySku = new Map();
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (r.length !== head.length) continue;
  bySku.set((r[iSku] || "").trim(), { raw: (r[iImg] || "").trim(), name: (r[iName] || "").trim(), line: i });
}
console.log(`parsed ${bySku.size} CSV records of ${rows.length - 1} data rows\n`);

const bad = [];
for (const f of fs.readdirSync(PRODUCTS_DIR).filter((x) => x.endsWith(".json"))) {
  const p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8"));
  if ((p.images || []).length) continue;
  const row = bySku.get(p.sku);
  const urls = row ? splitImageCell(row.raw) : [];
  const good = urls.filter((u) => IMAGE_EXT.test(u));
  bad.push({ slug: p.slug, sku: p.sku, name: p.name, inCsv: !!row, urls: good.length, broken: urls.length - good.length });
}

console.log("slug".padEnd(46) + "sku".padEnd(18) + "inCsv  goodUrls  brokenUrls");
for (const b of bad.sort((a, b) => b.urls - a.urls)) {
  console.log(
    b.slug.slice(0, 44).padEnd(46) +
    String(b.sku).padEnd(18) +
    (b.inCsv ? "yes" : "NO").padEnd(7) +
    String(b.urls).padEnd(10) +
    b.broken
  );
}

const recoverable = bad.filter((b) => b.urls > 0);
console.log(`\n${bad.length} imageless products; ${recoverable.length} recoverable from CSV, ${bad.length - recoverable.length} with no source`);
