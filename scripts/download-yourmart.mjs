import fs from "fs";
import path from "path";
import https from "https";

const COOKIE = "eyJpdiI6Inl2VTRSRC93cm02bjJlRSsvQkFnUWc9PSIsInZhbHVlIjoiU1dXR1pWZldzaXNKKzRVMWFuNXhicGNkM1VzUGw0dUIyR0hhdjdFWDY0bWtDWW1wU1VHM2QwN3hXdlFBcHdDMWlpaG53d29GT0pJSWN5aXc0Q3dpV2FKVjRRaFFhZHZ6MkE2UjZsQk5HRERSK2MzQTFEWDJpL0l1Zk9TOTlFb04iLCJtYWMiOiIxMWJhMDM0OGFlM2JlYTlhOWFkNWZhMDAzYjg2YzEzODdmMWUxNTE0MjUzMzNiNDk5Y2JjMGVmMzQ3NzgwODlkIiwidGFnIjoiIn0=";

const urlsFile = path.join(process.cwd(), "yourmart-urls.txt");
const outputDir = path.join(process.cwd(), "yourmart-images");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const urls = fs.readFileSync(urlsFile, "utf-8").replace(/\r/g, "").split("\n").filter(u => u.trim().startsWith("http"));
console.log(`Downloading ${urls.length} images...`);

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    url = url.trim();
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, {
      timeout: 15000,
      headers: {
        'Cookie': 'yourmart_session=' + COOKIE,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*;q=0.8',
      }
    }, (res) => {
      if (res.statusCode !== 200) { file.close(); fs.unlinkSync(destPath); resolve(false); return; }
      const ct = res.headers['content-type'] || '';
      if (!ct.startsWith('image/')) { file.close(); fs.unlinkSync(destPath); resolve(false); return; }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    });
    req.on('error', () => { file.close(); try { fs.unlinkSync(destPath); } catch {} resolve(false); });
    req.on('timeout', () => { req.destroy(); file.close(); try { fs.unlinkSync(destPath); } catch {} resolve(false); });
  });
}

let done = 0, ok = 0, fail = 0;
const CONCURRENCY = 10;

for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(async (url) => {
    const filename = url.split('/').pop().split('?')[0];
    const dest = path.join(outputDir, filename);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return true;
    return downloadFile(url, dest);
  }));
  results.forEach(r => r ? ok++ : fail++);
  done += batch.length;
  if (done % 100 === 0) console.log(`  ${Math.round(done/urls.length*100)}% — OK: ${ok}, Fail: ${fail}`);
}

console.log(`\nDone! Downloaded: ${ok}, Failed: ${fail}`);
