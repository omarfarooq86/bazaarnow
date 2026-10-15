// Add the Rs. 150 delivery markup to every catalogue price.
//
//   node scripts/add-delivery-markup.mjs            # DRY RUN (default, writes nothing)
//   node scripts/add-delivery-markup.mjs --apply    # write the new prices
//
// This is the one-time migration that introduced the markup on 2026-10-15. It only
// touches data/products/*.json, which is the live catalogue. The markup is NOT written
// into All_Products_CSV_for_WooCommerce.csv: that file is an *input* holding supplier
// prices, and a business rule baked into source data is how the markup gets applied
// twice. Importers apply it instead, as a DELIVERY_MARKUP constant added after their
// margin multiplier.
//
// Why this exists
// ---------------
// Standard delivery is prepaid: Rs. 150 is folded into the product price instead of
// being charged at checkout, so the "Free delivery across Pakistan" promise stays
// literally true for the customer. Checkout then offers a Fast *upgrade* of Rs. 150 on
// top, which is the only delivery money collected at the till.
//
// Why BOTH price and salePrice move
// ---------------------------------
// getEffectivePrice() and the cart's getSubtotal() both treat salePrice as the price
// the customer actually pays. 1,951 of 2,148 products carry a salePrice below price, so
// bumping `price` alone would leave the rendered price untouched on ~91% of the
// catalogue and collect nothing. Both fields move by the same absolute Rs. 150, which
// also nudges each discount percentage slightly down - the honest direction.
//
// A warning about the importers
// -----------------------------
// The catalogue's prices are a historical patchwork: measured against the CSV, only
// 197 of 729 matched products follow the sync script's round(csv x 1.2) + markup rule.
// The rest came from earlier import runs with different multipliers. So ANY full
// re-import rewrites prices that no single formula reproduces, quite apart from the
// markup. sync-csv-catalog.mjs is the safe path - it leaves existing products' prices
// untouched and only prices genuinely new ones. import-csv.mjs and
// import-all-products.mjs are full rebuilds and will also drop salePrice, which the
// CSV does not carry.
import fs from "fs";
import path from "path";

const APPLY = process.argv.includes("--apply");
const MARKUP = 150;
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");

// ---------- product JSON ----------
const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json")).sort();

let touched = 0, priceOnly = 0, missingPrice = 0, skipped = [];
const before = [], after = [];

for (const f of files) {
  const full = path.join(PRODUCTS_DIR, f);
  const raw = fs.readFileSync(full, "utf-8");

  let p;
  try { p = JSON.parse(raw); } catch (e) { skipped.push(`${f} (unreadable JSON)`); continue; }

  if (typeof p.price !== "number" || !(p.price > 0)) { missingPrice++; skipped.push(`${f} (no numeric price)`); continue; }

  before.push(p.price);
  const nextPrice = p.price + MARKUP;
  after.push(nextPrice);

  const hasSale = typeof p.salePrice === "number" && p.salePrice > 0;
  if (!hasSale) priceOnly++;

  p.price = nextPrice;
  if (hasSale) p.salePrice = p.salePrice + MARKUP;

  // Preserve each file's exact trailing-newline state, otherwise the diff reports
  // 2,148 changed files instead of the ~2,148 real changes plus newline noise.
  const trailing = raw.endsWith("\n") ? "\n" : "";
  const out = JSON.stringify(p, null, 2) + trailing;

  if (APPLY && out !== raw) fs.writeFileSync(full, out, "utf-8");
  touched++;
}

// ---------- report ----------
const mean = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
const sorted = [...before].sort((a, b) => a - b);
const sortedAfter = [...after].sort((a, b) => a - b);

console.log("");
console.log(APPLY ? "=== APPLIED ===" : "=== DRY RUN (nothing written — pass --apply) ===");
console.log("");
console.log(`Markup per product: Rs. ${MARKUP}`);
console.log("");
console.log("data/products/*.json");
console.log(`  files scanned            ${files.length}`);
console.log(`  updated                  ${touched}`);
console.log(`    of which price only    ${priceOnly} (no salePrice)`);
console.log(`    of which price + sale  ${touched - priceOnly}`);
console.log(`  price min                Rs. ${sorted[0]}  ->  Rs. ${sortedAfter[0]}`);
console.log(`  price median             Rs. ${sorted[Math.floor(sorted.length / 2)]}  ->  Rs. ${sortedAfter[Math.floor(sortedAfter.length / 2)]}`);
console.log(`  price max                Rs. ${sorted[sorted.length - 1]}  ->  Rs. ${sortedAfter[sortedAfter.length - 1]}`);
console.log(`  price mean               Rs. ${mean(before)}  ->  Rs. ${mean(after)}`);
if (missingPrice) console.log(`  no numeric price         ${missingPrice} (skipped)`);
console.log("");
if (skipped.length) {
  console.log("");
  console.log(`Skipped ${skipped.length} file(s):`);
  skipped.slice(0, 10).forEach((s) => console.log(`  - ${s}`));
  if (skipped.length > 10) console.log(`  ... and ${skipped.length - 10} more`);
}
console.log("");
if (APPLY) {
  console.log("Next: node scripts/regenerate-catalog.mjs");
  console.log("      (required - it rewrites the price/salePrice in public/search-index*.json)");
  console.log("");
}
