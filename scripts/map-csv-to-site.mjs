// READ-ONLY: build the precise CSV <-> site correspondence map
import fs from "fs";
import path from "path";

const csvPath = process.argv[2] || path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv");
const productsDir = path.join(process.cwd(), "data", "products");

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

const STOP = new Set(["the","for","and","with","pack","pcs","pc","piece","pieces","set","of","in","to","new","best","quality","high","premium","random","color","colour","amp","ml","cm","inch","inches"]);
const toks = (s) => new Set((s || "").toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]+/g, " ")
  .split(" ").filter((w) => w && !STOP.has(w) && w.length > 2));
const contain = (a, b) => {
  const A = toks(a), B = toks(b);
  if (!A.size || !B.size) return 0;
  let i = 0; for (const t of A) if (B.has(t)) i++;
  return i / Math.min(A.size, B.size);
};

const rows = parseCSV(fs.readFileSync(csvPath, "utf-8"));
const H = rows[0].map((h) => h.trim());
const iSku = H.indexOf("SKU"), iName = H.indexOf("Name"), iPrice = H.indexOf("Regular price"), iImg = H.indexOf("Images");
const csv = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i]; if (!r || r.length < 3) continue;
  const name = (r[iName] || "").trim(), sku = (r[iSku] || "").trim();
  if (!name && !sku) continue;
  csv.push({ sku, name, price: (r[iPrice] || "").trim(), imgCount: (r[iImg] || "").split(",").filter((u) => u.trim().startsWith("http")).length });
}

const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
const site = files.map((f) => {
  let p = {}; try { p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8")); } catch (e) {}
  const sku = (p.sku || "").trim();
  return { slug: p.slug || f.replace(/\.json$/, ""), name: p.name || "", sku, price: p.price, images: p.images || [], legacy: /^hhc-/i.test(sku) };
});

const siteBySku = new Map(site.map((s) => [s.sku.toLowerCase(), s]));

// --- CSV internal duplicate names (variants) ---
const byName = {};
csv.forEach((c) => { const k = c.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); (byName[k] = byName[k] || []).push(c); });
const csvDupNameGroups = Object.entries(byName).filter(([, v]) => v.length > 1);
console.log(`CSV products: ${csv.length}`);
console.log(`CSV entries sharing an identical name (variant groups): ${csvDupNameGroups.length} groups covering ${csvDupNameGroups.reduce((a, [, v]) => a + v.length, 0)} entries`);
console.log(`  e.g. ${csvDupNameGroups.slice(0, 3).map(([, v]) => v.length + "x " + v[0].name.slice(0, 40)).join(" | ")}`);
console.log(`CSV entries with 0 images: ${csv.filter((c) => !c.imgCount).length}`);
console.log();

// --- Classify every CSV entry ---
const cls = { skuMatch: [], nameMatchNew: [], nameMatchLegacy: [], noMatch: [] };
for (const c of csv) {
  const bySku = siteBySku.get(c.sku.toLowerCase());
  if (bySku) { cls.skuMatch.push({ csv: c, site: bySku }); continue; }
  let best = 0, bestS = null;
  for (const s of site) { const v = contain(c.name, s.name); if (v > best) { best = v; bestS = s; } }
  if (best >= 0.65) {
    if (bestS.legacy) cls.nameMatchLegacy.push({ csv: c, site: bestS, score: best });
    else cls.nameMatchNew.push({ csv: c, site: bestS, score: best });
  } else cls.noMatch.push({ csv: c, site: bestS, score: best });
}

console.log("=== Every CSV entry classified ===");
console.log(`  A. exact SKU already on site (leave as-is)      : ${cls.skuMatch.length}`);
console.log(`  B. name-matches an existing NEW-scheme product  : ${cls.nameMatchNew.length}`);
console.log(`  C. name-matches an existing LEGACY hhc- product : ${cls.nameMatchLegacy.length}`);
console.log(`  D. no counterpart on site (genuinely new)       : ${cls.noMatch.length}`);
console.log();

// --- How many DISTINCT site products do B/C map to? (many CSV -> one site) ---
const distinctNew = new Set(cls.nameMatchNew.map((x) => x.site.sku));
const distinctLegacy = new Set(cls.nameMatchLegacy.map((x) => x.site.sku));
console.log("=== Distinct existing products involved ===");
console.log(`  B maps ${cls.nameMatchNew.length} CSV entries -> ${distinctNew.size} distinct new-scheme products`);
console.log(`  C maps ${cls.nameMatchLegacy.length} CSV entries -> ${distinctLegacy.size} distinct legacy products`);
console.log();

// --- New-scheme products NOT covered by any CSV entry -> removal candidates ---
const coveredNew = new Set([...cls.skuMatch.filter((x) => !x.site.legacy).map((x) => x.site.sku), ...distinctNew]);
const newSite = site.filter((s) => !s.legacy);
const orphans = newSite.filter((s) => !coveredNew.has(s.sku));
console.log(`=== New-scheme products on site: ${newSite.length} ===`);
console.log(`  covered by CSV : ${newSite.length - orphans.length}`);
console.log(`  ORPHANS (remove): ${orphans.length}`);
orphans.forEach((o) => console.log(`     ${o.sku} | ${o.name.slice(0, 60)}`));
console.log();

console.log("--- C: CSV entries whose only counterpart is a LEGACY hhc- product (conflict cases) ---");
cls.nameMatchLegacy.sort((a, b) => b.score - a.score).slice(0, 20).forEach((x) =>
  console.log(`  [${x.score.toFixed(2)}] CSV(${x.csv.sku}) ${x.csv.name.slice(0, 48)}\n            LEGACY(${x.site.sku}) ${x.site.name.slice(0, 48)}`));

console.log("\n--- B: CSV entries matching an existing NEW-scheme product, first 20 ---");
cls.nameMatchNew.slice(0, 20).forEach((x) =>
  console.log(`  [${x.score.toFixed(2)}] CSV(${x.csv.sku}) ${x.csv.name.slice(0, 48)}\n            NEW(${x.site.sku}) ${x.site.name.slice(0, 48)}`));

// --- Price sanity ---
const csvPrices = csv.map((c) => parseFloat(c.price)).filter((n) => !isNaN(n));
const sitePrices = site.map((s) => s.price).filter((n) => typeof n === "number");
console.log(`\n=== Prices ===`);
console.log(`  CSV  : n=${csvPrices.length} min=${Math.min(...csvPrices)} max=${Math.max(...csvPrices)} median=${csvPrices.sort((a,b)=>a-b)[Math.floor(csvPrices.length/2)]}`);
console.log(`  SITE : n=${sitePrices.length} min=${Math.min(...sitePrices)} max=${Math.max(...sitePrices)}`);

fs.writeFileSync(path.join(process.cwd(), "scripts", "csv-site-map.json"), JSON.stringify({
  counts: { skuMatch: cls.skuMatch.length, nameMatchNew: cls.nameMatchNew.length, nameMatchLegacy: cls.nameMatchLegacy.length, noMatch: cls.noMatch.length },
  orphans: orphans.map((o) => ({ sku: o.sku, slug: o.slug, name: o.name })),
  nameMatchNew: cls.nameMatchNew, nameMatchLegacy: cls.nameMatchLegacy, noMatch: cls.noMatch,
}, null, 2));
console.log(`\nWritten: scripts/csv-site-map.json`);
