import fs from "fs";
import path from "path";

const productsDir = path.join(process.cwd(), "data", "products");

// Read all products
const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
console.log(`Total products: ${files.length}\n`);

const products = [];
for (const file of files) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(productsDir, file), "utf-8"));
    products.push({ file, data: p });
  } catch (e) {
    console.log(`  Skip corrupt: ${file}`);
  }
}

// Normalize name for comparison
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove special chars
    .replace(/\s+/g, " ")        // normalize spaces
    .replace(/\bpack of \d+\b/gi, "")
    .replace(/\b\d+\s*pc(s)?\b/gi, "")
    .replace(/\bset\b/gi, "")
    .replace(/\bcombo\b/gi, "")
    .replace(/\bcolour(s)?\b/gi, "color")
    .replace(/\brandom color(s)?\b/gi, "")
    .replace(/\bassorted\b/gi, "")
    .replace(/\bmultipack\b/gi, "")
    .replace(/\bmulticolor(s)?\b/gi, "")
    .replace(/\bpack of\b/gi, "")
    .replace(/\bupdated\b/gi, "")
    .replace(/\bnew\b/gi, "")
    .replace(/\blatest\b/gi, "")
    .replace(/\bpremium\b/gi, "")
    .replace(/\bdeluxe\b/gi, "")
    .replace(/\boriginal\b/gi, "")
    .replace(/\bgenuine\b/gi, "")
    .replace(/\bauthentic\b/gi, "")
    .trim();
}

// Also extract core product identifier (first 4-5 meaningful words)
function coreName(name) {
  const words = normalize(name).split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, Math.min(5, words.length)).join(" ");
}

// Find duplicates using normalized name matching
console.log("Scanning for duplicates...\n");

const seen = {}; // normalized core name -> {file, data, count}
const duplicates = [];

for (const { file, data } of products) {
  const core = coreName(data.name);
  if (core.length < 8) continue;

  if (!seen[core]) {
    seen[core] = { file, data, count: 1, names: [data.name] };
  } else {
    seen[core].count++;
    seen[core].names.push(data.name);
    duplicates.push({ file, data, keptAs: seen[core].file });
  }
}

console.log(`Found ${duplicates.length} duplicate products across ${Object.values(seen).filter(s => s.count > 1).length} groups\n`);

// Show the duplicate groups
const groups = Object.values(seen).filter(s => s.count > 1).sort((a, b) => b.count - a.count);
console.log("=== DUPLICATE GROUPS ===\n");
groups.forEach((g, i) => {
  console.log(`${i + 1}. "${g.names[0].substring(0, 60)}..." (${g.count} copies)`);
  g.names.slice(1).forEach(n => console.log(`   ↳ "${n.substring(0, 60)}..."`));
  console.log();
});

// Delete duplicate files
console.log(`\nDeleting ${duplicates.length} duplicate files...`);
let deleted = 0;
for (const dup of duplicates) {
  const filePath = path.join(productsDir, dup.file);
  try {
    fs.unlinkSync(filePath);
    deleted++;
  } catch (e) {
    console.log(`  Could not delete: ${dup.file}`);
  }
}
console.log(`Deleted ${deleted} duplicates`);

// Count remaining
const remaining = fs.readdirSync(productsDir).filter(f => f.endsWith(".json")).length;
console.log(`\nRemaining products: ${remaining}`);
console.log(`Removed: ${files.length - remaining}`);
