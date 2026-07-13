import fs from "fs";
import https from "https";

const cookie = fs.readFileSync("cookie.txt", "utf-8").trim();
const url = "https://admin.yourmart.pk/storage/uploads/inventory/products/media/4_1727090992.jpg";

console.log("Downloading WITHOUT Accept header...");
const file = fs.createWriteStream("test-result.jpg");
https.get(url, { headers: { 'Cookie': cookie } }, res => {
  console.log("Status:", res.statusCode);
  console.log("Content-Type:", res.headers['content-type']);
  console.log("Content-Length:", res.headers['content-length']);
  let size = 0;
  res.on('data', chunk => { size += chunk.length; });
  res.pipe(file);
  file.on('finish', () => {
    console.log("Actual size:", size, "bytes");
    // Check magic bytes to identify real file type
    const buf = fs.readFileSync("test-result.jpg");
    const magic = buf.slice(0, 8).toString('hex');
    console.log("Magic bytes:", magic);
    if (magic.startsWith('ffd8')) console.log("REAL JPEG IMAGE - SUCCESS!");
    else if (magic.startsWith('89504e47')) console.log("PNG detected");
    else if (magic.startsWith('52494646')) console.log("WEBP detected");
    else if (magic.startsWith('3c21444f') || magic.startsWith('3c68746d') || magic.startsWith('3c2144')) console.log("HTML DETECTED - image blocked");
    else console.log("Unknown format");
  });
}).on('error', e => console.log("Error:", e.message));
