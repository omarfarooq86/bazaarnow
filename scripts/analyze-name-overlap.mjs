// READ-ONLY: name-based overlap between CSV and site products, split by SKU generation
import fs from "fs";
import path from "path";

const csvPath = process.argv[2] || path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv");
const productsDir = path.join(process.cwd(), "data", "products");

function parseCSV(text) {
  const rows = []; let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch !== "\r") field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Aggressive normaliser: strip punctuation, stopwords, units, sizes
const STOP = new Set(["the","for","and","with","pack","pcs","pc","piece","pieces","set","of","in","to","new","best","quality","high","premium","pink","black","white","blue","red","green","random","color","colour","amp","x"]);
function normName(s) {
  return (s || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && !STOP.has(w) && w.length > 1)
    .sort()
    .join(" ");
}
// Token-set similarity (Jaccard)
function jaccard(a, b) {
  const A = new Set(a.split(" ")), B = new Set(b.split(" "));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

const raw = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(raw);
const header = rows[0].map((h) => h.trim());
const iSku = header.indexOf("SKU"), iName = header.indexOf("Name");
const csv = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i]; if (!r || r.length < 3) continue;
  const name = (r[iName] || "").trim(); const sku = (r[iSku] || "").trim();
  if (!name && !sku) continue;
  csv.push({ sku, name, n: normName(name) });
}

const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
const site = files.map((f) => {
  let p = {}; try { p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8")); } catch (e) {}
  const sku = (p.sku || "").trim();
  const name = p.name || "";
  return { file: f, slug: p.slug || f.replace(/\.json$/, ""), name, sku, n: normName(name), old: /^hhc-/i.test(sku) };
});

const csvNorm = new Set(csv.map((c) => c.n));
const csvSku = new Set(csv.map((c) => c.sku.toLowerCase()));

const oldSite = site.filter((s) => s.old);
const newSite = site.filter((s) => !s.old);
console.log(`CSV: ${csv.length} | site total: ${site.length} (old hhc-: ${oldSite.length}, new-sku: ${newSite.length})`);

// exact normalised-name match
const exactOld = oldSite.filter((s) => csvNorm.has(s.n));
const exactNew = newSite.filter((s) => csvNorm.has(s.n));
console.log(`\nExact normalised-name match with CSV:`);
console.log(`  old hhc- products : ${exactOld.length} / ${oldSite.length}`);
console.log(`  new-sku products  : ${exactNew.length} / ${newSite.length}`);

// fuzzy match for the old ones that did NOT match exactly
const unmatchedOld = oldSite.filter((s) => !csvNorm.has(s.n));
console.log(`\nOld hhc- products with NO exact name match: ${unmatchedOld.length}`);
console.log(`Running fuzzy match (Jaccard >= 0.6) on those...`);
const strong = [], weak = [], none = [];
for (const s of unmatchedOld) {
  let best = 0, bestC = null;
  for (const c of csv) {
    const j = jaccard(s.n, c.n);
    if (j > best) { best = j; bestC = c; }
  }
  if (best >= 0.6) strong.push({ ...s, best, match: bestC });
  else if (best >= 0.4) weak.push({ ...s, best, match: bestC });
  else none.push({ ...s, best });
}
console.log(`  strong (>=0.6): ${strong.length}`);
console.log(`  weak (0.4-0.6): ${weak.length}`);
console.log(`  no match (<0.4): ${none.length}`);

console.log(`\n--- STRONG fuzzy matches (old site product <-> CSV product), first 25 ---`);
strong.slice(0, 25).forEach((s) =>
  console.log(`  [${s.best.toFixed(2)}] SITE(${s.sku}) ${s.name.slice(0, 55)}\n            CSV(${s.match.sku}) ${s.match.name.slice(0, 55)}`)
);
console.log(`\n--- WEAK fuzzy matches, first 15 ---`);
weak.slice(0, 15).forEach((s) =>
  console.log(`  [${s.best.toFixed(2)}] SITE(${s.sku}) ${s.name.slice(0, 55)}\n            CSV(${s.match.sku}) ${s.match.name.slice(0, 55)}`)
);
console.log(`\n--- Sample of old products with NO CSV counterpart, first 25 ---`);
none.slice(0, 25).forEach((s) => console.log(`  (${s.best.toFixed(2)}) ${s.sku} | ${s.name.slice(0, 65)}`));

fs.writeFileSync(
  path.join(process.cwd(), "scripts", "name-overlap-report.json"),
  JSON.stringify({ exactOld: exactOld.length, exactNew: exactNew.length, strong, weak, none, unmatchedOldCount: unmatchedOld.length }, null, 2)
);
console.log(`\nWritten: scripts/name-overlap-report.json`);
