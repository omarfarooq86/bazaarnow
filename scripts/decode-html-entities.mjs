// Decode the HTML entities that leaked into the catalogue during import, so
// product names read "Face, Eyes & Lips" instead of "Face, Eyes &amp; Lips".
//
// 172 product names, 661 descriptions and 217 feature lists carry these. They
// surface as literal "&amp;" in the <title>, the <h1>, product cards, the search
// index and the Product JSON-LD — React escapes the string a second time, so the
// page shows "&amp;amp;".
//
// Only four entities appear, all unambiguous. Slugs are untouched (no slug
// contains an entity), so no URLs change.
//
//   node scripts/decode-html-entities.mjs            # DRY RUN (default)
//   node scripts/decode-html-entities.mjs --apply
import fs from "fs";
import path from "path";

const APPLY = process.argv.includes("--apply");
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");

// &amp; must be replaced last, or "&amp;lt;" would become "<".
const ORDERED = [
  [/\n/g, "\n"], // no-op anchor keeping the list explicit
  [/&nbsp;/g, " "],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&quot;/g, '"'],
  [/&#0?39;/g, "'"],
  [/&apos;/g, "'"],
  [/&amp;/g, "&"],
];

function decode(s) {
  if (typeof s !== "string" || !s.includes("&")) return s;
  let out = s;
  for (const [re, to] of ORDERED) out = out.replace(re, to);
  return out;
}

const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));
let changed = 0;
const fieldCounts = {};
const samples = [];
const dangerous = [];

for (const f of files) {
  const file = path.join(PRODUCTS_DIR, f);
  const p = JSON.parse(fs.readFileSync(file, "utf-8"));
  const before = JSON.stringify(p);

  const next = { ...p };
  if (typeof p.name === "string") next.name = decode(p.name);
  if (typeof p.description === "string") next.description = decode(p.description);
  if (Array.isArray(p.features)) next.features = p.features.map(decode);
  if (Array.isArray(p.tags)) next.tags = p.tags.map(decode);
  if (typeof p.deliveryInfo === "string") next.deliveryInfo = decode(p.deliveryInfo);
  if (p.specifications && typeof p.specifications === "object") {
    const specs = {};
    for (const [k, v] of Object.entries(p.specifications)) specs[decode(k)] = decode(v);
    next.specifications = specs;
  }

  if (JSON.stringify(next) === before) continue;
  changed++;

  // Decoding &lt; into "<" must never produce a sequence that closes the
  // JSON-LD <script> tag it is embedded in.
  const blob = JSON.stringify(next);
  if (/<\/script/i.test(blob)) { dangerous.push(f); continue; }

  for (const [label, a, b] of [
    ["name", p.name, next.name],
    ["description", p.description, next.description],
    ["features", JSON.stringify(p.features), JSON.stringify(next.features)],
    ["specifications", JSON.stringify(p.specifications), JSON.stringify(next.specifications)],
  ]) {
    if (a !== b) fieldCounts[label] = (fieldCounts[label] || 0) + 1;
  }
  if (samples.length < 5 && p.name !== next.name) samples.push([p.name, next.name]);

  if (APPLY) fs.writeFileSync(file, JSON.stringify(next, null, 2), "utf-8");
}

console.log(`product files scanned : ${files.length}`);
console.log(`files with entities   : ${changed}`);
console.log(`fields decoded        : ${JSON.stringify(fieldCounts)}`);
console.log("\nname examples:");
samples.forEach(([a, b]) => {
  console.log("  before: " + a.slice(0, 88));
  console.log("  after : " + b.slice(0, 88));
});
if (dangerous.length) {
  console.log(`\n!! skipped ${dangerous.length} file(s) that would emit "</script" after decoding:`);
  dangerous.slice(0, 10).forEach((f) => console.log("   " + f));
}
console.log(APPLY ? "\nAPPLIED." : "\nDRY RUN — nothing written. Re-run with --apply.");
