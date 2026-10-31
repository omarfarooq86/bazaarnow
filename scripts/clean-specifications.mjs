// Clean auto-extraction debris out of product specifications.
//
//   node scripts/clean-specifications.mjs            # DRY RUN (default, writes nothing)
//   node scripts/clean-specifications.mjs --apply    # write changes
//
// Why: specs were scraped from supplier descriptions by regexes in the import
// scripts, and the results are shown as a table on every product page. On 922 of
// 2,148 products that table contains things like:
//
//   Product  -> the product's own name, repeated (the name is already the H1)
//   Color    -> "Pink\r\n\r\nProduct Original Video\r\n[video width=474 ...]"
//   Material -> "PU LeatherPattern: EmbroideredGender: Girl'sNumber of Pieces: 2 Pcs"
//   Material -> "Durable,"
//
// The governing principle is that an empty specifications table is better than a
// table that reads like a corrupted field. Pages with nothing left get an empty
// object, and ProductDetailClient hides the section entirely.
//
// What it does NOT do: invent specifications. It only removes entries it can prove
// are debris. Anything it cannot confidently clean is dropped rather than guessed.
import fs from "fs";
import path from "path";

const APPLY = process.argv.includes("--apply");
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");

// Values that are adjectives or section headings, not specifications.
const GENERIC = new Set([
  "durable", "durable,", "recognition", "new", "best", "good", "fine",
  "yes", "no", "product", "feature", "it", "this", "none", "",
]);

// A value that is itself the name of a spec field is an extraction error
// ("Color: Material"), not a value.
const KEY_NAMES = new Set([
  "material", "size", "color", "colour", "weight", "capacity", "brand",
  "model", "type", "style", "key", "options", "product", "feature",
  "pattern", "gender", "quantity", "age",
]);

// Fragments of supplier prose, captured because a "Color:" label happened to be
// followed by a sentence. These read as corruption on a product page.
const PROSE_START = /^(made|comes|crafted|available|perfect|ideal|designed|used|using|you|your|we|our|this|it|its|there|these|they|great|best|good)\b/i;
const JUNK_SINGLE = new Set(["options", "coating", "temperature", "lighting", "lcd", "key", "for", "and", "with", "the", "at"]);

/**
 * True only when a value looks like a real attribute rather than extraction debris.
 * Deliberately conservative: the cost of dropping a good spec is a shorter table,
 * while the cost of keeping a bad one is a table that reads like a corrupted field.
 */
function looksLikeSpec(value) {
  const v = String(value).trim();
  const vl = v.toLowerCase();
  const words = v.split(/\s+/);

  if (v.length < 2 || v.length > 48) return false;
  if (/[:;!?]/.test(v)) return false;              // embedded labels or sentence punctuation
  if (/\.\s*(key|value)\b/i.test(v)) return false;
  if (KEY_NAMES.has(vl)) return false;             // the value is another field's name
  if (words.length > 8) return false;              // a sentence, not a spec
  if (PROSE_START.test(v)) return false;
  if (words.length === 1 && JUNK_SINGLE.has(vl)) return false;
  return true;
}

const hasMarkup = (v) => /\[video|\[audio|\[gallery|https?:\/\/|width=|height=|mp4=|\.mp4|\.jpg|\.png/i.test(v);
const hasLayoutNoise = (v) => /[\r\n\t]/.test(v);
const isTooLong = (v) => v.length > 80;

/** Names of keys that only ever held the product name back at us. */
const isRedundantNameKey = (key) => /^product$/i.test(key.trim());

/**
 * True when `value` is just the product name (whole, truncated, or a prefix of it).
 * Compared on a normalised prefix so trailing punctuation and truncation don't save it.
 */
function isNameEcho(value, productName) {
  const norm = (s) =>
    String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const v = norm(value);
  const n = norm(productName);
  if (!v || !n) return false;
  if (v.length < 12) return false;
  return n.startsWith(v.slice(0, 40)) || v.startsWith(n.slice(0, 40));
}

/** "color" -> "Color", "number of pieces" -> "Number of pieces". */
function tidyKey(key) {
  const k = String(key).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (!k) return "";
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/** Strip trailing punctuation left behind by the extractors. */
function tidyValue(value) {
  return String(value).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().replace(/[,;:\-\s]+$/, "");
}

/**
 * Some values are several pairs run together with no separator, e.g.
 * "PU LeatherPattern: EmbroideredGender: Girl'sNumber of Pieces: 2 Pcs".
 * Split on capitalised "Label:" boundaries and keep the parts that look like specs.
 * Returns [] when the shape is not confidently splittable.
 */
function splitEmbedded(value) {
  const parts = String(value).split(/(?=[A-Z][A-Za-z ]{2,20}:)/);
  const pairs = [];
  for (const part of parts) {
    const m = part.match(/^([A-Z][A-Za-z ]{2,20}):\s*(.+)$/);
    if (!m) return []; // not a clean key:value run — refuse to guess
    const v = tidyValue(m[2]);
    if (v) pairs.push([m[1].trim(), v]);
  }
  return pairs;
}

const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json")).sort();

let touched = 0, removedEntries = 0, emptied = 0;
const before = { withSpecs: 0, entries: 0 };
const after = { withSpecs: 0, entries: 0 };
const emptiedSlugs = [];

for (const file of files) {
  const full = path.join(PRODUCTS_DIR, file);
  const raw = fs.readFileSync(full, "utf-8");

  let p;
  try { p = JSON.parse(raw); } catch { continue; }

  const specs = p.specifications;
  if (!specs || typeof specs !== "object") continue;

  before.entries += Object.keys(specs).length;
  if (Object.keys(specs).length) before.withSpecs++;

  const cleaned = {};

  for (const [rawKey, rawValue] of Object.entries(specs)) {
    const key = tidyKey(rawKey);
    const value = tidyValue(rawValue);
    if (!key || !value) continue;

    // The product name echoed back as a "Product" spec adds nothing.
    if (isRedundantNameKey(key) && isNameEcho(value, p.name)) continue;

    // Supplier markup, embedded video embeds, layout rubble.
    if (hasMarkup(value)) continue;

    // Values with layout noise usually mean several fields were jammed together.
    if (hasLayoutNoise(String(rawValue))) {
      const split = splitEmbedded(value);
      if (split.length > 1) {
        for (const [k, v] of split) {
          if (!GENERIC.has(v.toLowerCase()) && !isTooLong(v) && looksLikeSpec(v)) cleaned[tidyKey(k)] ||= v;
        }
      }
      continue;
    }

    // Long values are description dumps, not specifications.
    if (isTooLong(value)) continue;

    // Adjectives and section headings masquerading as specs.
    if (GENERIC.has(value.toLowerCase())) continue;

    // Prose fragments, embedded labels, and other extraction debris.
    if (!looksLikeSpec(value)) continue;

    cleaned[key] ||= value;
  }

  const changed =
    JSON.stringify(cleaned) !== JSON.stringify(specs);

  if (changed) {
    removedEntries += Object.keys(specs).length - Object.keys(cleaned).length;
    p.specifications = cleaned;
    if (!Object.keys(cleaned).length) { emptied++; if (emptiedSlugs.length < 10) emptiedSlugs.push(p.slug); }
    touched++;

    if (APPLY) {
      const trailing = raw.endsWith("\n") ? "\n" : "";
      fs.writeFileSync(full, JSON.stringify(p, null, 2) + trailing, "utf-8");
    }
  }

  after.entries += Object.keys(cleaned).length;
  if (Object.keys(cleaned).length) after.withSpecs++;
}

console.log("");
console.log(APPLY ? "=== APPLIED ===" : "=== DRY RUN (nothing written — pass --apply) ===");
console.log("");
console.log(`products scanned            ${files.length}`);
console.log(`products with spec changes  ${touched}`);
console.log(`spec entries removed        ${removedEntries}`);
console.log(`products left with NO specs ${emptied}   (section is hidden on these)`);
console.log("");
console.log(`spec entries   ${before.entries} -> ${after.entries}`);
console.log(`products with >=1 spec  ${before.withSpecs} -> ${after.withSpecs}`);
if (emptiedSlugs.length) {
  console.log("");
  console.log("examples that end up with no specs:");
  emptiedSlugs.forEach((s) => console.log("  - " + s));
}
console.log("");
