// Add the Rs. 150 delivery markup to every catalogue price.
//
//   node scripts/add-delivery-markup.mjs            # DRY RUN (default, writes nothing)
//   node scripts/add-delivery-markup.mjs --apply    # back up the CSV, then write everything
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
// Known consequence
// -----------------
// import-all-products.mjs multiplies the CSV's Regular price by ~1.3 on import (and
// sync-csv-catalog.mjs by 1.2). So a product imported *in future* from this bumped CSV
// gets the markup scaled too: 150 x 1.3 = Rs. 195 baked in, not Rs. 150. Existing
// products are unaffected. That is a real (if mild) inconsistency - it is left alone
// deliberately rather than changing the importers' pricing model as a side effect.
import fs from "fs";
import path from "path";

const APPLY = process.argv.includes("--apply");
const MARKUP = 150;
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const CSV_PATH = path.join(process.cwd(), "All_Products_CSV_for_WooCommerce.csv");
const CSV_BACKUP = CSV_PATH + ".bak";

// ---------- CSV helpers ----------
// Same parser as sync-csv-catalog.mjs. The Description column contains embedded
// commas and newlines, so a naive split(",") would shred the file.
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

// This CSV quotes every field and uses LF with a trailing newline. Verified before
// writing this script: an all-quoted round-trip of the unmodified file is byte-for-byte
// identical to the original, so rewriting this way produces a diff containing only the
// price changes - no reformatting noise, and no risk of a quoting bug corrupting a file
// that is the master for the live WooCommerce store.
const quoteCell = (s) => '"' + String(s).replace(/"/g, '""') + '"';
const serializeCSV = (rows) => rows.map((r) => r.map(quoteCell).join(",")).join("\n") + "\n";

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

// ---------- master CSV ----------
let csvReport = null;
if (fs.existsSync(CSV_PATH)) {
  const original = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(original);
  const header = rows[0];
  const priceCol = header.indexOf("Regular price");
  const origRowCount = rows.length;
  const origColCounts = [...new Set(rows.map((r) => r.length))];

  if (priceCol === -1) {
    csvReport = { error: 'No "Regular price" column found - CSV left untouched.' };
  } else {
    let changed = 0, nonNumeric = [];
    for (let i = 1; i < rows.length; i++) {
      const cell = (rows[i][priceCol] || "").trim();
      if (!cell) continue;
      const n = parseFloat(cell);
      if (!Number.isFinite(n)) { nonNumeric.push({ row: i + 1, value: cell }); continue; }
      rows[i][priceCol] = String(Math.round(n) + MARKUP);
      changed++;
    }

    const serialized = serializeCSV(rows);
    const checkRows = parseCSV(serialized);
    const newColCounts = [...new Set(checkRows.map((r) => r.length))];

    // Verify the rewrite before trusting it: same shape in, same shape out.
    const shapeOk =
      checkRows.length === origRowCount &&
      JSON.stringify(newColCounts) === JSON.stringify(origColCounts);

    csvReport = {
      priceCol,
      products: origRowCount - 1,
      changed,
      nonNumeric,
      shapeOk,
      origRowCount,
      newRowCount: checkRows.length,
      colCounts: origColCounts,
    };

    if (APPLY) {
      if (!shapeOk) {
        throw new Error(
          `CSV shape changed after rewrite (rows ${origRowCount} -> ${checkRows.length}, ` +
            `cols ${JSON.stringify(origColCounts)} -> ${JSON.stringify(newColCounts)}). ` +
            `Refusing to write.`
        );
      }
      if (!fs.existsSync(CSV_BACKUP)) fs.writeFileSync(CSV_BACKUP, original, "utf-8");
      fs.writeFileSync(CSV_PATH, serialized, "utf-8");
    }
  }
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
console.log(path.basename(CSV_PATH));
if (!csvReport) {
  console.log("  not found - skipped");
} else if (csvReport.error) {
  console.log(`  ${csvReport.error}`);
} else {
  console.log(`  products                 ${csvReport.products}`);
  console.log(`  prices updated           ${csvReport.changed}`);
  console.log(`  shape check              rows ${csvReport.origRowCount} -> ${csvReport.newRowCount}, cols ${JSON.stringify(csvReport.colCounts)}  ${csvReport.shapeOk ? "OK" : "FAILED"}`);
  if (csvReport.nonNumeric.length) {
    console.log(`  non-numeric prices kept  ${csvReport.nonNumeric.length} (${csvReport.nonNumeric.slice(0, 3).map((n) => `row ${n.row}: ${n.value}`).join(", ")})`);
  }
  if (APPLY) console.log(`  backup                   ${path.basename(CSV_BACKUP)}`);
}
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
