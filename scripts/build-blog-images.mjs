// Generate the 1200x630 Open Graph card for each blog post.
//
// Every post in data/blog-index.json points at an /images/blog/*.jpg that has
// never existed — public/images/blog/ was never created — so every post's
// og:image, twitter image and Article schema image has been a 404. This builds
// them from the post's own title.
//
// These are typographic brand cards, not photographs. That is deliberate: a
// designed card makes no claim about any product, so it introduces nothing that
// needs verifying.
//
//   node scripts/build-blog-images.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "images", "blog");
const INDEX = path.join(process.cwd(), "data", "blog-index.json");
const W = 1200;
const H = 630;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// Wrap a title to a character budget so it fits the card, at most `maxLines`.
function wrap(text, perLine, maxLines = 3) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if (!line) { line = w; continue; }
    if ((line + " " + w).length <= perLine) line += " " + w;
    else { lines.push(line); line = w; if (lines.length === maxLines) break; }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    const consumed = lines.join(" ").split(/\s+/).length;
    if (consumed < words.length) {
      lines[maxLines - 1] = lines[maxLines - 1].replace(/[,.\s]+$/, "") + "…";
    }
  }
  return lines;
}

function card({ eyebrow, title, footer }) {
  const lines = wrap(title, 26, 3);
  const titleSize = lines.length >= 3 ? 64 : 76;
  const lineHeight = titleSize * 1.14;
  const blockHeight = lines.length * lineHeight;
  const startY = H / 2 - blockHeight / 2 + titleSize * 0.78 - 24;

  const titleSvg = lines
    .map((l, i) =>
      `<text x="80" y="${(startY + i * lineHeight).toFixed(1)}" font-family="Georgia, 'Times New Roman', serif" ` +
      `font-size="${titleSize}" font-weight="700" fill="#ffffff">${esc(l)}</text>`)
    .join("");

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B35"/>
      <stop offset="100%" stop-color="#D8400F"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#000000" opacity="0.10"/>
  <text x="80" y="120" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24"
        font-weight="700" letter-spacing="3" fill="#FFE1D2">${esc((eyebrow || "").toUpperCase())}</text>
  ${titleSvg}
  <rect x="80" y="${H - 118}" width="88" height="4" fill="#ffffff" opacity="0.85"/>
  <text x="80" y="${H - 66}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="28"
        font-weight="600" fill="#ffffff">${esc(footer || "")}</text>
  <text x="${W - 80}" y="${H - 66}" text-anchor="end" font-family="Georgia, serif" font-size="34"
        font-weight="700" fill="#ffffff">BazaarNow</text>
</svg>`);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const posts = JSON.parse(fs.readFileSync(INDEX, "utf-8"));
let made = 0;
for (const p of posts) {
  if (!p.image) continue;
  const dest = path.join(process.cwd(), "public", p.image.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(card({ eyebrow: p.tag, title: p.title, footer: "bazaarnow.net" }))
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(dest);
  const kb = (fs.statSync(dest).size / 1024).toFixed(0);
  console.log(`  ${kb.padStart(4)} KB  ${p.image}  <- ${p.title.slice(0, 46)}`);
  made++;
}
console.log(`\n  ${made} OG cards written to public/images/blog/`);
