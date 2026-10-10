// READ-ONLY: produce the definitive action plan (keep / renumber / remove / add)
import fs from "fs";
import path from "path";

const productsDir = path.join(process.cwd(), "data", "products");

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
const ex = (s) => (s || "").toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]+/g, " ").trim();

const rows = parseCSV(fs.readFileSync("All_Products_CSV_for_WooCommerce.csv", "utf-8"));
const H = rows[0].map((h) => h.trim());
const iSku = H.indexOf("SKU"), iName = H.indexOf("Name"), iP = H.indexOf("Regular price");
const csv = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i]; if (!r || r.length < 3) continue;
  const sku = (r[iSku] || "").trim(), name = (r[iName] || "").trim();
  if (!sku && !name) continue;
  csv.push({ sku, name, price: parseFloat(r[iP]) || 0, norm: ex(name) });
}
const csvSkuSet = new Set(csv.map((c) => c.sku.toLowerCase()));
const csvNormSet = new Set(csv.map((c) => c.norm));

const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
const site = files.map((f) => {
  let p = {}; try { p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8")); } catch (e) {}
  const sku = (p.sku || "").trim();
  return { file: f, slug: p.slug || f.replace(/\.json$/, ""), name: p.name || "", sku, price: p.price, legacy: /^hhc-/i.test(sku), norm: ex(p.name) };
});
const siteBySku = new Map(site.map((s) => [s.sku.toLowerCase(), s]));

const newScheme = site.filter((s) => !s.legacy);
const legacy = site.filter((s) => s.legacy);

// 1. KEEP: site SKU appears in CSV
const keep = newScheme.filter((s) => csvSkuSet.has(s.sku.toLowerCase()));
// 2. RENUMBER: site SKU not in CSV, but a CSV entry has the IDENTICAL name
const renumber = [];
for (const s of newScheme) {
  if (csvSkuSet.has(s.sku.toLowerCase())) continue;
  const c = csv.find((c) => c.norm === s.norm);
  if (c) renumber.push({ site: s, csv: c });
}
const renumberSkus = new Set(renumber.map((r) => r.site.sku));
// 3. REMOVE: new-scheme products neither kept nor renumbered
const remove = newScheme.filter((s) => !csvSkuSet.has(s.sku.toLowerCase()) && !renumberSkus.has(s.sku));
// 4. ADD: CSV entries with no site SKU match and not consumed by a renumber
const renumberCsvSkus = new Set(renumber.map((r) => r.csv.sku.toLowerCase()));
const add = csv.filter((c) => !siteBySku.has(c.sku.toLowerCase()) && !renumberCsvSkus.has(c.sku.toLowerCase()));

console.log("================ DEFINITIVE ACTION PLAN ================");
console.log(`Site today            : ${site.length}  (legacy hhc-: ${legacy.length}, new-scheme: ${newScheme.length})`);
console.log(`CSV                   : ${csv.length}`);
console.log();
console.log(`1. KEEP     (SKU matches CSV)        : ${keep.length}`);
console.log(`2. RENUMBER (same name, new SKU)     : ${renumber.length}`);
console.log(`3. ADD      (new listings)           : ${add.length}`);
console.log(`4. REMOVE   (dropped from CSV)       : ${remove.length}`);
console.log(`   legacy hhc- products UNTOUCHED    : ${legacy.length}`);
console.log();
console.log(`EXPECTED SITE TOTAL: ${legacy.length} + ${keep.length} + ${renumber.length} + ${add.length} = ${legacy.length + keep.length + renumber.length + add.length}`);
console.log();

console.log("--- 2. RENUMBER (update SKU in place) ---");
renumber.forEach((r) => console.log(`  ${r.site.sku}  ->  ${r.csv.sku}   | ${r.site.name.slice(0, 55)}`));

console.log("\n--- 3. REMOVE (new-scheme products the CSV dropped) ---");
remove.forEach((r) => console.log(`  ${r.sku} | ${r.name.slice(0, 62)}`));

console.log("\n--- 4. ADD: breakdown ---");
const addVariant = add.filter((c) => {
  // does a site product share the same name minus the trailing colour/size token?
  const t = c.norm.split(" "); const head = t.slice(0, Math.max(1, t.length - 2)).join(" ");
  return site.some((s) => s.norm.startsWith(head));
});
console.log(`   variants of existing products : ${addVariant.length}`);
console.log(`   no site counterpart at all    : ${add.length - addVariant.length}`);
console.log(`   total to add                  : ${add.length}`);

fs.writeFileSync(path.join(process.cwd(), "scripts", "action-plan.json"), JSON.stringify({
  counts: { keep: keep.length, renumber: renumber.length, add: add.length, remove: remove.length, legacy: legacy.length },
  keep: keep.map((k) => ({ sku: k.sku, slug: k.slug, name: k.name, price: k.price })),
  renumber: renumber.map((r) => ({ siteSku: r.site.sku, csvSku: r.csv.sku, slug: r.site.slug, name: r.site.name, sitePrice: r.site.price, csvPrice: r.csv.price })),
  remove: remove.map((r) => ({ sku: r.sku, slug: r.slug, name: r.name })),
  add: add,
}, null, 2));
console.log("\nWritten: scripts/action-plan.json");
