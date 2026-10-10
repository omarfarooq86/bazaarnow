// Sync the new-scheme catalogue to All_Products_CSV_for_WooCommerce.csv
//
//   node scripts/sync-csv-catalog.mjs            # DRY RUN (default, writes nothing)
//   node scripts/sync-csv-catalog.mjs --apply    # perform add / renumber / delete
//
// Scope (agreed with user):
//   * KEEP     - new-scheme products whose SKU is in the CSV (prices untouched)
//   * RENUMBER - new-scheme products whose SKU changed but name is identical (update sku field)
//   * ADD      - CSV products with no counterpart (price = CSV price x 1.2)
//   * REMOVE   - new-scheme products dropped by the CSV, EXCEPT KIDS-BBT-001
//   * UNTOUCHED- all legacy hhc- products
import fs from "fs";
import path from "path";

const APPLY = process.argv.includes("--apply");
const CSV_PATH = "All_Products_CSV_for_WooCommerce.csv";
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const KEEP_EXCEPTIONS = new Set(["KIDS-BBT-001"]);
const PRICE_MULTIPLIER = 1.2;

// ---------- helpers ----------
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
// Split an `Images` cell into URLs. Supplier filenames contain commas
// (e.g. "RefreshingCleanserBright,ClearSkin(83)_1770025834.webp"), so a bare
// split(",") truncates every URL to its directory prefix and 404s on download.
// The real delimiter is a comma immediately followed by a scheme.
const splitImageCell = (cell) =>
  (cell || "").split(/,(?=https?:)/).map((u) => u.trim()).filter((u) => u.startsWith("http"));

const normName = (s) => (s || "").toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]+/g, " ").trim();

// convert HTML to readable plain text, KEEPING line structure
function htmlToText(html) {
  if (!html) return "";
  let s = html;
  s = s.replace(/<\s*br\s*\/?>/gi, "\n");
  s = s.replace(/<\s*\/\s*(p|div|li|tr|h[1-6])\s*>/gi, "\n");
  s = s.replace(/<\s*li[^>]*>/gi, "• ");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
       .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&rsquo;/g, "’").replace(/&hellip;/g, "…")
       .replace(/&#?\w+;/g, "");
  s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{200D}\u{FE0F}]/gu, "");
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  s = s.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

function slugify(text) {
  const s = (text || "")
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return truncateSlug(s);
}

// Cut to the last whole word at or under MAX. A bare substring(0, MAX) leaves
// slugs ending mid-word (…quartz-wrist-, …daily-wear-stret). Only back up a word
// when the cut genuinely lands mid-word.
const MAX_SLUG_LEN = 80;
function truncateSlug(s, max = MAX_SLUG_LEN) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  if (cut.endsWith("-")) return cut.replace(/-+$/g, ""); // already on a boundary
  if (s[max] === "-") return cut;                        // word ends exactly at max
  const lastDash = cut.lastIndexOf("-");                 // mid-word: drop the stub
  return lastDash > 0 ? cut.slice(0, lastDash) : cut;
}

// CSV Categories -> site category, honouring the site's existing prefix convention
const PREFIX_CATEGORY = {
  Ai: "electronics", Ap: "fashion", Ba: "fashion", Ho: "home-living",
  KIDS: "kids", Ki: "kids", Mi: "electronics", Ne: null, Pe: "beauty",
  Sm: null, Vi: "electronics",
};
function mapCategory(csvCategories, sku) {
  const c = (csvCategories || "").toLowerCase();
  if (c.includes("personal care") || c.includes("perfume") || c.includes("fragrance")) return "beauty";
  if (c.includes("bag") || c.includes("apparel") || c.includes("clothing")) return "fashion";
  if (c.includes("kid") || c.includes("gaming")) return "kids";
  if (c.includes("home") || c.includes("kitchen") || c.includes("lifestyle")) return "home-living";
  if (c.includes("smart gadget") || c.includes("video") || c.includes("lighting") ||
      c.includes("airpod") || c.includes("headset") || c.includes("watch")) return "electronics";
  const pre = (sku || "").split("-")[0];
  return PREFIX_CATEGORY[pre] || "electronics";
}

function extractFeatures(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 8 && l.length < 140);
  const feats = [];
  for (const l of lines) {
    if (/^[•\-*]\s*/.test(l) || /^(key features|features|specifications?|product details|how to use)/i.test(l) === false) {
      const t = l.replace(/^[•\-*]\s*/, "").trim();
      if (t.length > 10 && t.length < 120 && !/^(key features|features|product details|how to use|safety information|what's in the box|ideal for|special note|benefits|specifications?)\b/i.test(t)) {
        feats.push(t);
      }
    }
    if (feats.length >= 10) break;
  }
  if (feats.length < 3) {
    // fall back: first few sentences
    const sents = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 15 && s.length < 120);
    for (const s of sents) { if (feats.length >= 5) break; if (!feats.includes(s)) feats.push(s); }
  }
  return feats.slice(0, 10);
}

const SPEC_KEYS = ["Model", "Brand", "Material", "Color", "Colour", "Size", "Weight", "Battery", "Capacity",
  "Dimensions", "Warranty", "Power", "Voltage", "Type", "Bluetooth", "Charging", "Compatibility"];
function extractSpecs(text, fallbackName) {
  const specs = {};
  for (const k of SPEC_KEYS) {
    const re = new RegExp("(?:^|\\n)\\s*" + k + "\\s*[:\\-]\\s*([^\\n]{2,60})", "i");
    const m = text.match(re);
    if (m) { const v = m[1].trim().replace(/[.,;]$/, ""); if (v && !specs[k]) specs[k] = v; }
  }
  const bullet = text.match(/[•]\s*(Model|Chipset|Bluetooth Version|Battery|Weight|Material|Size|Color)\s*[:]\s*([^\n•]{2,50})/i);
  if (bullet && !specs[bullet[1]]) specs[bullet[1]] = bullet[2].trim();
  if (Object.keys(specs).length === 0) specs["Product"] = (fallbackName || "").split("|")[0].trim().slice(0, 60);
  return specs;
}

function tagsFrom(name, categories) {
  const stop = new Set(["the","and","for","with","from","this","that","your","you","are","has","its","all","new","pcs","pc","set","pack","best","quality"]);
  const words = `${name} ${categories}`.toLowerCase().replace(/&amp;/g, " ").split(/[\s\-–—|,/()]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 3 && !stop.has(w));
  return [...new Set(words)].slice(0, 8);
}

// deterministic pseudo-random stock so results are reproducible
function stockFor(sku) {
  let h = 0; for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) >>> 0;
  return 5 + (h % 26);
}

// ---------- load ----------
const rows = parseCSV(fs.readFileSync(CSV_PATH, "utf-8"));
const H = rows[0].map((h) => h.trim());
const col = (r, name) => (r[H.indexOf(name)] || "").trim();
const csv = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length < 3) continue;
  const sku = col(r, "SKU"), name = col(r, "Name");
  if (!sku && !name) continue;
  csv.push({
    sku, name,
    short: col(r, "Short description"),
    desc: col(r, "Description"),
    price: parseFloat(col(r, "Regular price")) || 0,
    inStock: col(r, "In stock?") === "1",
    images: splitImageCell(col(r, "Images")),
    categories: col(r, "Categories"),
    norm: normName(name),
  });
}

const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));
const site = files.map((f) => {
  let p = {}; try { p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), "utf-8")); } catch (e) {}
  const sku = (p.sku || "").trim();
  return { file: f, path: path.join(PRODUCTS_DIR, f), data: p, slug: p.slug || f.replace(/\.json$/, ""), name: p.name || "", sku, legacy: /^hhc-/i.test(sku) };
});
const siteBySku = new Map(site.map((s) => [s.sku.toLowerCase(), s]));
const csvSkuSet = new Set(csv.map((c) => c.sku.toLowerCase()));

const newScheme = site.filter((s) => !s.legacy);
const legacy = site.filter((s) => s.legacy);

// ---------- plan ----------
const keep = newScheme.filter((s) => csvSkuSet.has(s.sku.toLowerCase()));
const keepSkus = new Set(keep.map((s) => s.sku));
const renumber = [];
for (const s of newScheme) {
  if (keepSkus.has(s.sku)) continue;
  const c = csv.find((c) => c.norm === normName(s.name));
  if (c) renumber.push({ site: s, csv: c });
}
const renumberSkus = new Set(renumber.map((r) => r.site.sku));
const remove = newScheme.filter(
  (s) => !keepSkus.has(s.sku) && !renumberSkus.has(s.sku) && !KEEP_EXCEPTIONS.has(s.sku)
);
const removeSkus = new Set(remove.map((s) => s.sku));
const renumberCsvSkus = new Set(renumber.map((r) => r.csv.sku.toLowerCase()));
const add = csv.filter((c) => !siteBySku.has(c.sku.toLowerCase()) && !renumberCsvSkus.has(c.sku.toLowerCase()));

// ---------- build new products ----------
const existingSlugs = new Set(site.map((s) => s.slug));
const usedSlugs = new Set(existingSlugs);
const newProducts = [];
for (const c of add) {
  let slug = slugify(c.name) || `product-${c.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (usedSlugs.has(slug)) {
    const base = slug;
    let n = 2;
    while (usedSlugs.has(`${base}-${n}`)) n++;
    slug = `${base}-${n}`;
  }
  usedSlugs.add(slug);
  const description = htmlToText(c.desc) || htmlToText(c.short);
  const nameKey = normName(c.name);
  const features = extractFeatures(description).filter((f) => {
    const fk = normName(f);
    return fk && fk !== nameKey && !nameKey.startsWith(fk) && !fk.startsWith(nameKey);
  });
  newProducts.push({
    slug,
    name: c.name,
    category: mapCategory(c.categories, c.sku),
    price: Math.max(1, Math.round(c.price * PRICE_MULTIPLIER)),
    description,
    features,
    specifications: extractSpecs(description, c.name),
    images: c.images.map((u, j) => {
      const ext = (u.split(".").pop() || "jpg").split("?")[0].toLowerCase();
      const safe = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      return `/images/products/${slug}-${j + 1}.${safe}`;
    }),
    inStock: c.inStock,
    stockCount: stockFor(c.sku),
    isFeatured: false,
    tags: tagsFrom(c.name, c.categories),
    deliveryInfo: "Delivery in 2-4 working days across Pakistan",
    sku: c.sku,
    _remote: c.images,
  });
}

// ---------- report ----------
console.log("=".repeat(64));
console.log(APPLY ? "MODE: APPLY (writing changes)" : "MODE: DRY RUN (no changes written)");
console.log("=".repeat(64));
console.log(`Site now       : ${site.length}  (legacy ${legacy.length}, new-scheme ${newScheme.length})`);
console.log(`KEEP           : ${keep.length}`);
console.log(`RENUMBER       : ${renumber.length}`);
console.log(`ADD            : ${newProducts.length}`);
console.log(`REMOVE         : ${remove.length}   (exempt: ${[...KEEP_EXCEPTIONS].join(", ")})`);
console.log(`Legacy untouched: ${legacy.length}`);
console.log(`PROJECTED TOTAL: ${legacy.length + keep.length + renumber.length + KEEP_EXCEPTIONS.size + newProducts.length}`);
console.log();

const byCat = {};
for (const p of newProducts) byCat[p.category] = (byCat[p.category] || 0) + 1;
console.log("New products by category:", JSON.stringify(byCat));
const prices = newProducts.map((p) => p.price);
console.log(`New price range: Rs.${Math.min(...prices)} - Rs.${Math.max(...prices)}  (avg Rs.${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)})`);
console.log(`Features extracted: avg ${(newProducts.reduce((a, p) => a + p.features.length, 0) / newProducts.length).toFixed(1)}/product`);
const noFeat = newProducts.filter((p) => p.features.length === 0).length;
const noDesc = newProducts.filter((p) => !p.description).length;
console.log(`Products with 0 features: ${noFeat} | with 0 description: ${noDesc}`);
console.log();

// collision check against ALL existing slugs
const collisions = newProducts.filter((p) => existingSlugs.has(p.slug));
console.log(`Slug collisions with existing products: ${collisions.length}`);

fs.writeFileSync(path.join(process.cwd(), "scripts", "sync-preview.json"),
  JSON.stringify({ keep: keep.length, renumber: renumber.map((r) => ({ from: r.site.sku, to: r.csv.sku, name: r.site.name })), remove: remove.map((r) => ({ sku: r.sku, slug: r.slug, name: r.name })), newProducts }, null, 2));
console.log("Preview written: scripts/sync-preview.json");

if (!APPLY) {
  console.log("\nDry run complete. Re-run with --apply to write changes.");
  process.exit(0);
}

// ---------- apply ----------
console.log("\nApplying...");

// renumber
for (const r of renumber) {
  r.site.data.sku = r.csv.sku;
  fs.writeFileSync(r.site.path, JSON.stringify(r.site.data, null, 2), "utf-8");
  console.log(`  renumbered ${r.site.sku} -> ${r.csv.sku}`);
}

// add
for (const p of newProducts) {
  const { _remote, ...clean } = p;
  fs.writeFileSync(path.join(PRODUCTS_DIR, `${p.slug}.json`), JSON.stringify(clean, null, 2), "utf-8");
}
console.log(`  wrote ${newProducts.length} new product files`);

// remove
let removed = 0;
for (const r of remove) {
  fs.unlinkSync(r.path);
  removed++;
}
console.log(`  deleted ${removed} product files`);

console.log("\nDone. Now run: node scripts/regenerate-catalog.mjs && node scripts/download-csv-images.mjs");
