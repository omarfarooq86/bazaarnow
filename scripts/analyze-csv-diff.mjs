// READ-ONLY analysis: compare All_Products_CSV_for_WooCommerce.csv against data/products/*.json
// Usage: node scripts/analyze-csv-diff.mjs [csvPath]
import fs from "fs";
import path from "path";

const csvPath = process.argv[2] || path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv");
const productsDir = path.join(process.cwd(), "data", "products");

// --- RFC4180-ish CSV parser ---
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch === "\r") { /* skip */ }
      else field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const norm = (s) => (s || "").trim().toLowerCase();

// --- Load CSV ---
const raw = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(raw);
const header = rows[0].map((h) => h.trim());
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const csvProducts = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length < 3) continue;
  const sku = (r[idx["SKU"]] || "").trim();
  const name = (r[idx["Name"]] || "").trim();
  if (!sku && !name) continue;
  csvProducts.push({
    sku,
    name,
    type: (r[idx["Type"]] || "").trim(),
    published: (r[idx["Published"]] || "").trim(),
    price: (r[idx["Regular price"]] || "").trim(),
    inStock: (r[idx["In stock?"]] || "").trim(),
    images: (r[idx["Images"]] || "").trim(),
    categories: (r[idx["Categories"]] || "").trim(),
    parent: (r[idx["Parent"]] || "").trim(),
  });
}

// --- Load existing site products ---
const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
const siteProducts = files.map((f) => {
  let p = {};
  try { p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8")); } catch (e) {}
  return { file: f, slug: p.slug || f.replace(/\.json$/, ""), name: p.name || "", sku: (p.sku || "").trim() };
});

// --- Compare by SKU ---
const csvBySku = new Map();
const csvDupSkus = [];
for (const p of csvProducts) {
  if (!p.sku) continue;
  const k = norm(p.sku);
  if (csvBySku.has(k)) csvDupSkus.push(p.sku);
  else csvBySku.set(k, p);
}
const siteBySku = new Map();
const siteNoSku = [];
for (const p of siteProducts) {
  if (!p.sku) { siteNoSku.push(p); continue; }
  const k = norm(p.sku);
  if (!siteBySku.has(k)) siteBySku.set(k, []);
  siteBySku.get(k).push(p);
}

const toAdd = csvProducts.filter((p) => p.sku && !siteBySku.has(norm(p.sku)));
const matched = csvProducts.filter((p) => p.sku && siteBySku.has(norm(p.sku)));
const toRemove = siteProducts.filter((p) => p.sku && !csvBySku.has(norm(p.sku)));
const csvNoSku = csvProducts.filter((p) => !p.sku);

// --- Report ---
const out = [];
const log = (s = "") => { out.push(s); console.log(s); };

log("=".repeat(70));
log("CSV vs SITE DIFF ANALYSIS");
log("=".repeat(70));
log(`CSV file      : ${csvPath}`);
log(`CSV rows      : ${csvProducts.length}`);
log(`  Simple      : ${csvProducts.filter((p) => p.type === "Simple").length}`);
log(`  Variable    : ${csvProducts.filter((p) => p.type === "Variable").length}`);
log(`  Other/blank : ${csvProducts.filter((p) => p.type !== "Simple" && p.type !== "Variable").length}`);
log(`  No SKU      : ${csvNoSku.length}`);
log(`  Duplicate SKUs in CSV: ${csvDupSkus.length}`);
log("");
log(`Site products : ${siteProducts.length}`);
log(`  with SKU    : ${siteProducts.length - siteNoSku.length}`);
log(`  WITHOUT SKU : ${siteNoSku.length}`);
log("");
log("-".repeat(70));
log(`MATCHED (in both)        : ${matched.length}`);
log(`TO ADD (CSV only)        : ${toAdd.length}`);
log(`TO REMOVE (site only)    : ${toRemove.length}`);
log("-".repeat(70));

log("\n### Products in CSV but NOT on site (candidates to ADD) — first 60:");
toAdd.slice(0, 60).forEach((p) => log(`  [${p.type}] ${p.sku} | ${p.name.slice(0, 70)}`));
if (toAdd.length > 60) log(`  ... and ${toAdd.length - 60} more`);

log("\n### Products on site but NOT in CSV (candidates to REMOVE) — first 60:");
toRemove.slice(0, 60).forEach((p) => log(`  ${p.sku} | ${p.name.slice(0, 70)}`));
if (toRemove.length > 60) log(`  ... and ${toRemove.length - 60} more`);

if (siteNoSku.length) {
  log(`\n### Site products with NO SKU (cannot match) — first 40:`);
  siteNoSku.slice(0, 40).forEach((p) => log(`  ${p.slug.slice(0, 60)} | ${p.name.slice(0, 50)}`));
}

if (csvDupSkus.length) {
  log(`\n### Duplicate SKUs within CSV — first 20: ${csvDupSkus.slice(0, 20).join(", ")}`);
}

fs.writeFileSync(
  path.join(process.cwd(), "scripts", "csv-diff-report.json"),
  JSON.stringify({ toAdd, toRemove, matched: matched.length, siteNoSku, csvDupSkus }, null, 2)
);
log(`\nFull lists written to scripts/csv-diff-report.json`);
fs.writeFileSync(path.join(process.cwd(), "scripts", "csv-diff-report.txt"), out.join("\n"));
