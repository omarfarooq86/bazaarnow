// Migrate the truncated product slugs (…quartz-wrist-, …daily-wear-stret) to
// clean word-boundary slugs, and emit the 301 redirects they need.
//
// Targets come from scripts/slug-migration-targets.json, derived from the GSC
// page export: product URLs carrying >=10 impressions whose slug was cut at the
// old 80-char import limit.
//
// The new slug is produced by the FIXED slugify — the same function now used by
// the import scripts — so migrated URLs and future imports follow one rule:
// truncate to the last whole word at or under 80 characters.
//
//   node scripts/migrate-slugs.mjs            # DRY RUN (default, writes nothing)
//   node scripts/migrate-slugs.mjs --apply    # rename JSON + images, write redirects
import fs from "fs";
import path from "path";

const APPLY = process.argv.includes("--apply");
const PRODUCTS_DIR = path.join(process.cwd(), "data", "products");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "products");
const TARGETS = path.join(process.cwd(), "scripts", "slug-migration-targets.json");
const REDIRECTS = path.join(process.cwd(), "scripts", "slug-redirects.json");
const MAX_SLUG_LEN = 80;

// Mirrors the generator in scripts/import-all-products.mjs (no &amp; special case
// — that variant never produced the live slugs; verified against all 33 targets).
function slugify(text) {
  const s = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return truncateSlug(s);
}
function truncateSlug(s, max = MAX_SLUG_LEN) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  if (cut.endsWith("-")) return cut.replace(/-+$/g, ""); // already on a boundary
  if (s[max] === "-") return cut;                        // word ends exactly at max
  const lastDash = cut.lastIndexOf("-");                 // mid-word: drop the stub
  return lastDash > 0 ? cut.slice(0, lastDash) : cut;
}
// The old generator: slugify then a bare substring, which cut mid-word and could
// leave a trailing hyphen (that is why 216 live slugs end in "-").
function oldTruncate(fullSlug) {
  return fullSlug.length > MAX_SLUG_LEN ? fullSlug.slice(0, MAX_SLUG_LEN) : fullSlug;
}

const imageRe = (slug) =>
  new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)\\.[a-z]+$`, "i");

// ---------- load ----------
const { targets } = JSON.parse(fs.readFileSync(TARGETS, "utf-8"));
const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));
const bySlug = new Map(files.map((f) => [f.replace(/\.json$/, ""), f]));
const allSlugs = new Set(bySlug.keys());

// ---------- plan ----------
const plan = [];
const problems = [];
const claimed = new Map(); // newSlug -> oldSlug, to catch two targets colliding

for (const t of targets) {
  const oldSlug = t.slug;
  const file = bySlug.get(oldSlug);
  if (!file) { problems.push(`${oldSlug}: no product file`); continue; }

  const data = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, file), "utf-8"));
  const full = (data.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const newSlug = slugify(data.name);

  // Sanity: the old slug must genuinely be this product's name truncated at 80,
  // otherwise we would be renaming something that was never a truncation bug.
  const expected = oldTruncate(full);
  if (oldSlug !== expected && oldSlug !== expected.replace(/-+$/g, "")) {
    problems.push(`${oldSlug}: not a truncation of its own name (expected "${expected}")`);
    continue;
  }
  if (newSlug === oldSlug) { problems.push(`${oldSlug}: unchanged, nothing to migrate`); continue; }
  if (newSlug.length > MAX_SLUG_LEN || newSlug.endsWith("-")) {
    problems.push(`${oldSlug}: new slug is malformed ("${newSlug}")`);
    continue;
  }
  if (claimed.has(newSlug)) {
    problems.push(`${oldSlug}: new slug "${newSlug}" already claimed by "${claimed.get(newSlug)}"`);
    continue;
  }
  if (allSlugs.has(newSlug)) {
    problems.push(`${oldSlug}: new slug "${newSlug}" collides with an existing product`);
    continue;
  }

  // every image must be present under the old slug, or the rename would orphan it
  const imgs = data.images || [];
  const missing = imgs.filter((i) => !fs.existsSync(path.join(process.cwd(), "public", i.replace(/^\//, ""))));
  if (missing.length) { problems.push(`${oldSlug}: ${missing.length} image(s) missing on disk`); continue; }

  claimed.set(newSlug, oldSlug);
  plan.push({ oldSlug, newSlug, file, data, imgs, impressions: t.impressions, clicks: t.clicks });
}

// ---------- report ----------
console.log(`targets: ${targets.length}   migratable: ${plan.length}   blocked: ${problems.length}\n`);
console.log("  impr  clicks  old slug -> new slug");
for (const p of plan) {
  console.log(`  ${String(p.impressions).padStart(4)}  ${String(p.clicks).padStart(6)}  ${p.oldSlug}`);
  console.log(`                 -> ${p.newSlug}  (${p.newSlug.length} chars)`);
}
if (problems.length) {
  console.log(`\nblocked (${problems.length}):`);
  problems.forEach((p) => console.log("  " + p));
}
if (!plan.length) { console.log("\nnothing to do."); process.exit(0); }
if (!APPLY) {
  console.log("\nDRY RUN — nothing written. Re-run with --apply to migrate.");
  process.exit(0);
}

// ---------- apply ----------
let renamedFiles = 0, renamedImages = 0;
const redirects = [];

for (const p of plan) {
  // 1. images
  const newImages = [];
  for (const img of p.imgs) {
    const base = img.replace("/images/products/", "");
    const m = imageRe(p.oldSlug).exec(base);
    if (!m) { newImages.push(img); continue; } // not slug-numbered; leave as-is
    const newBase = `${p.newSlug}-${m[1]}${base.slice(base.lastIndexOf("."))}`;
    fs.renameSync(path.join(IMAGES_DIR, base), path.join(IMAGES_DIR, newBase));
    newImages.push(`/images/products/${newBase}`);
    renamedImages++;
  }

  // 2. product JSON
  const updated = { ...p.data, slug: p.newSlug, images: newImages };
  const newFile = `${p.newSlug}.json`;
  fs.writeFileSync(path.join(PRODUCTS_DIR, newFile), JSON.stringify(updated, null, 2) + "\n", "utf-8");
  fs.unlinkSync(path.join(PRODUCTS_DIR, p.file));
  renamedFiles++;

  redirects.push({ source: `/product/${p.oldSlug}`, destination: `/product/${p.newSlug}/`, statusCode: 301 });
}

fs.writeFileSync(REDIRECTS, JSON.stringify(redirects, null, 2) + "\n", "utf-8");
console.log(`\nRenamed ${renamedFiles} product files, ${renamedImages} images.`);
console.log(`Wrote ${redirects.length} redirects -> scripts/slug-redirects.json`);
console.log("\nNext:");
console.log("  1. add the redirects to next.config.ts (see scripts/slug-redirects.json)");
console.log("  2. node scripts/regenerate-catalog.mjs");
console.log("  3. node scripts/verify-catalog.mjs");
