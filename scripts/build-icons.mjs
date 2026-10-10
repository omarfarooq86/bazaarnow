// Build the raster icon set from public/favicon.svg.
//
// The site declared /favicon.svg for icon, shortcut AND apple-touch-icon. Two
// problems with that: Google still probes /favicon.ico (which 404'd), and iOS
// cannot render SVG for apple-touch-icon, so "Add to Home Screen" produced a
// blank tile.
//
// favicon.svg is already the brand mark - the orange rounded "B" square from
// the logo - so this rasterises it rather than redesigning it.
//
//   node scripts/build-icons.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC = path.join(process.cwd(), "public");
const SVG = path.join(PUBLIC, "favicon.svg");
const svg = fs.readFileSync(SVG, "utf-8");

// Full-bleed variant (no corner radius) for the Apple icon: iOS applies its own
// rounded mask, so a pre-rounded icon would show white corners inside it.
const square = svg.replace(/rx="24"/, 'rx="0"');

const render = (source, size) =>
  sharp(Buffer.from(source), { density: 400 }).resize(size, size).png().toBuffer();

// ---------- favicon.ico (multi-size, PNG-compressed entries) ----------
// ICO header + directory, then the raw PNG payloads. PNG entries are legal
// since Vista and understood by every current browser and by Googlebot.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + 16 * images.length;
  images.forEach((img, i) => {
    const b = i * 16;
    dir.writeUInt8(img.size >= 256 ? 0 : img.size, b + 0); // width (0 = 256)
    dir.writeUInt8(img.size >= 256 ? 0 : img.size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette size
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // colour planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(img.data.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += img.data.length;
  });

  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) icoImages.push({ size, data: await render(svg, size) });
const ico = buildIco(icoImages);
fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), ico);

// ---------- apple-touch-icon (180x180, full-bleed, opaque) ----------
fs.writeFileSync(path.join(PUBLIC, "apple-touch-icon.png"), await render(square, 180));

// ---------- PWA / high-DPI raster ----------
fs.writeFileSync(path.join(PUBLIC, "icon-192.png"), await render(svg, 192));
fs.writeFileSync(path.join(PUBLIC, "icon-512.png"), await render(svg, 512));

// ---------- report ----------
for (const f of ["favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png"]) {
  const p = path.join(PUBLIC, f);
  const head = fs.readFileSync(p).subarray(0, 4);
  const kind = head.toString("hex") === "00000100" ? "ICO " : head.toString("hex").startsWith("89504e47") ? "PNG " : "?   ";
  console.log(`  ${kind} ${String(fs.statSync(p).size).padStart(7)} B  ${f}`);
}
console.log(`\n  favicon.ico holds ${icoSizes.join("/")} px entries`);
