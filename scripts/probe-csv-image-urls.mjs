// Diagnostic: reachability check for every image URL the repair would fetch.
//   node scripts/probe-csv-image-urls.mjs
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

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

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function probe(url, depth = 0) {
  return new Promise((resolve) => {
    if (depth > 5) return resolve({ status: "redir" });
    let proto;
    try { proto = new URL(url).protocol === "https:" ? https : http; } catch { return resolve({ status: "badurl" }); }
    const req = proto.get(url, { timeout: 20000, headers: { "User-Agent": UA, Accept: "image/*,*/*" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(probe(new URL(res.headers.location, url).toString(), depth + 1));
      }
      res.resume();
      resolve({ status: res.statusCode, ct: (res.headers["content-type"] || "").split(";")[0] });
    });
    req.on("error", (e) => resolve({ status: "ERR", ct: e.code }));
    req.on("timeout", () => { req.destroy(); resolve({ status: "timeout" }); });
  });
}

const rows = parseCSV(fs.readFileSync("All_Products_CSV_for_WooCommerce.csv", "utf-8"));
const cols = rows[0].map((h) => h.trim());
const iSku = cols.indexOf("SKU"), iImg = cols.indexOf("Images"), iName = cols.indexOf("Name");
const csvBySku = new Map();
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (r.length !== cols.length) continue;
  csvBySku.set((r[iSku] || "").trim().toLowerCase(), { name: (r[iName] || "").trim(), urls: splitImageCell(r[iImg]) });
}

// only the products the repair script would touch
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const targets = [];
for (const f of fs.readdirSync(PRODUCTS_DIR).filter((x) => x.endsWith(".json"))) {
  const p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8"));
  const row = csvBySku.get(((p.sku || "").trim()).toLowerCase());
  if (!row || !row.urls.length) continue;
  if ((p.images || []).length >= row.urls.length) continue;
  targets.push({ slug: p.slug, sku: p.sku, urls: row.urls });
}

const all = targets.flatMap((t) => t.urls.map((url) => ({ slug: t.slug, url })));
console.log(`probing ${all.length} URLs across ${targets.length} products...\n`);
const results = [];
for (let i = 0; i < all.length; i += 10) {
  const batch = await Promise.all(all.slice(i, i + 10).map(async (a) => ({ ...a, ...(await probe(a.url)) })));
  results.push(...batch);
  process.stdout.write(`\r  ${Math.min(i + 10, all.length)}/${all.length}`);
}
console.log("\n");

const bad = results.filter((r) => r.status !== 200 || !(r.ct || "").startsWith("image/"));
const byHost = {};
for (const r of results) {
  const h = new URL(r.url).host;
  byHost[h] = byHost[h] || { total: 0, bad: 0 };
  byHost[h].total++;
  if (bad.includes(r)) byHost[h].bad++;
}
console.log("reachable:", results.length - bad.length, " unreachable:", bad.length);
console.log("\nby host:");
for (const [h, v] of Object.entries(byHost)) console.log(`  ok=${v.total - v.bad} bad=${v.bad}  ${h}`);

if (bad.length) {
  console.log("\nunreachable sample:");
  bad.slice(0, 15).forEach((b) => console.log(`  ${b.status} ${b.ct || ""}  ${b.slug.slice(0, 34)}  ${b.url.slice(0, 90)}`));
  const byReason = {};
  for (const b of bad) byReason[b.status] = (byReason[b.status] || 0) + 1;
  console.log("\nby status:", JSON.stringify(byReason));
}
