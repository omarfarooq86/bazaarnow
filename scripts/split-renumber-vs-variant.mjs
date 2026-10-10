// READ-ONLY: split CSV entries into "true renumber of an existing product" vs "new variant"
import fs from "fs";
import path from "path";

const m = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "csv-site-map.json"), "utf-8"));
const rep = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "csv-diff-report.json"), "utf-8"));
const productsDir = path.join(process.cwd(), "data", "products");

// exact-name comparator (normalised, order preserved)
const ex = (s) => (s || "").toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]+/g, " ").trim();

const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
const site = files.map((f) => {
  let p = {}; try { p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8")); } catch (e) {}
  return { slug: p.slug || f.replace(/\.json$/, ""), name: p.name || "", sku: (p.sku || "").trim(), price: p.price };
});
const siteBySku = new Map(site.map((s) => [s.sku.toLowerCase(), s]));

// ---- B: name-matched a NEW-scheme product ----
const bExact = m.nameMatchNew.filter((x) => ex(x.csv.name) === ex(x.site.name));
const bVariant = m.nameMatchNew.filter((x) => ex(x.csv.name) !== ex(x.site.name));
// ---- C: name-matched a LEGACY product ----
const cExact = m.nameMatchLegacy.filter((x) => ex(x.csv.name) === ex(x.site.name));
const cVariant = m.nameMatchLegacy.filter((x) => ex(x.csv.name) !== ex(x.site.name));

console.log("=== B (matched an existing NEW-scheme product): " + m.nameMatchNew.length + " ===");
console.log(`  same product, renumbered SKU (name identical): ${bExact.length}`);
console.log(`  new VARIANT (name differs, e.g. colour/size) : ${bVariant.length}`);
console.log("\n=== C (matched an existing LEGACY hhc- product): " + m.nameMatchLegacy.length + " ===");
console.log(`  same product, name identical : ${cExact.length}`);
console.log(`  new VARIANT (name differs)   : ${cVariant.length}`);

console.log("\n--- B exact (true renumbers -> update existing in place) ---");
bExact.forEach((x) => console.log(`  CSV(${x.csv.sku}) rs.${x.csv.price}  <->  ${x.site.sku} rs.${x.site.price} | ${x.csv.name.slice(0, 58)}`));

// ---- A: 529 SKU matches - do names/prices differ? ----
const a = rep.toAdd ? null : null;
let aNameDiff = 0, aPriceDiff = 0, aNameSame = 0, aPriceSame = 0, aMissing = 0;
const aExamples = [];
// rebuild A from csv-site-map noMatch? we need full CSV. Re-read CSV quickly.
function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const rows = parseCSV(fs.readFileSync(path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv"), "utf-8"));
const H = rows[0].map((h) => h.trim());
const iSku = H.indexOf("SKU"), iName = H.indexOf("Name"), iPrice = H.indexOf("Regular price");
for (let i = 1; i < rows.length; i++) {
  const r = rows[i]; if (!r || r.length < 3) continue;
  const sku = (r[iSku] || "").trim(); if (!sku) continue;
  const s = siteBySku.get(sku.toLowerCase());
  if (!s) continue;
  const cname = (r[iName] || "").trim();
  const cprice = parseFloat(r[iPrice]) || 0;
  const nameSame = ex(cname) === ex(s.name);
  const priceSame = Math.abs(cprice - (s.price || 0)) < 1;
  if (nameSame) aNameSame++; else { aNameDiff++; if (aExamples.length < 12) aExamples.push({ sku, cname, sname: s.name, cprice, sprice: s.price, nameSame }); }
  if (priceSame) aPriceSame++; else aPriceDiff++;
}
console.log(`\n=== A (529 already-matching SKUs) ===`);
console.log(`  name identical : ${aNameSame}   name DIFFERS : ${aNameDiff}`);
console.log(`  price same     : ${aPriceSame}   price DIFFERS: ${aPriceDiff}`);
console.log("\n  Examples where name differs:");
aExamples.forEach((e) => console.log(`    ${e.sku}\n      CSV : ${e.cname.slice(0, 70)}  (rs.${e.cprice})\n      SITE: ${e.sname.slice(0, 70)}  (rs.${e.sprice})`));

fs.writeFileSync(path.join(process.cwd(), "scripts", "renumber-variant-split.json"),
  JSON.stringify({ bExact, bVariant, cExact, cVariant, a: { nameSame: aNameSame, nameDiff: aNameDiff, priceSame: aPriceSame, priceDiff: aPriceDiff } }, null, 2));
console.log("\nWritten: scripts/renumber-variant-split.json");
