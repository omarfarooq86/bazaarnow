// READ-ONLY: do the 200 CSV products to ADD duplicate products already on the site?
import fs from "fs";
import path from "path";

const rep = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "csv-diff-report.json"), "utf-8"));
const productsDir = path.join(process.cwd(), "data", "products");

const STOP = new Set(["the","for","and","with","pack","pcs","pc","piece","pieces","set","of","in","to","new","best","quality","high","premium","random","color","colour","amp","x","ml","cm","inch","inches","pcs","pcs.","1","2","3","4","5","6","7","8","9","10","12","16","24","in1"]);
function toks(s) {
  return new Set(
    (s || "").toLowerCase()
      .replace(/&amp;/g, "&")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w && !STOP.has(w) && w.length > 2)
  );
}
// containment: share of the smaller token set found in the larger
function containment(a, b) {
  const A = toks(a), B = toks(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.min(A.size, B.size);
}

const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
const site = files.map((f) => {
  let p = {}; try { p = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf-8")); } catch (e) {}
  return { slug: p.slug || f.replace(/\.json$/, ""), name: p.name || "", sku: (p.sku || "").trim() };
});

const dupeRisk = [], clean = [];
for (const c of rep.toAdd) {
  let best = 0, bestS = null;
  for (const s of site) {
    const v = containment(c.name, s.name);
    if (v > best) { best = v; bestS = s; }
  }
  if (best >= 0.65) dupeRisk.push({ csvSku: c.sku, csvName: c.name, score: best, siteSku: bestS.sku, siteName: bestS.name });
  else clean.push({ csvSku: c.sku, csvName: c.name, score: best, siteSku: bestS?.sku, siteName: bestS?.name });
}

console.log(`CSV products to ADD: ${rep.toAdd.length}`);
console.log(`  likely DUPLICATE of an existing site product (>=0.65): ${dupeRisk.length}`);
console.log(`  no strong match (safe to add): ${clean.length}`);
console.log(`\n--- Possible duplicates, top 30 by score ---`);
dupeRisk.sort((a, b) => b.score - a.score).slice(0, 30).forEach((d) =>
  console.log(`  [${d.score.toFixed(2)}] ADD(${d.csvSku}) ${d.csvName.slice(0, 52)}\n            EXISTING(${d.siteSku}) ${d.siteName.slice(0, 52)}`)
);
fs.writeFileSync(path.join(process.cwd(), "scripts", "add-duplicate-check.json"), JSON.stringify({ dupeRisk, clean }, null, 2));
console.log(`\nWritten: scripts/add-duplicate-check.json`);
