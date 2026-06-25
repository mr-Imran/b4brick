/**
 * Compress PNGs in public/frames → WebP and remove originals.
 * Run from project root: npm run optimize:frames
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const FRAMES_DIR = path.join(ROOT, "public", "frames");
const FRAME_QUALITY = 72;

async function listPngs() {
  try {
    const entries = await fs.readdir(FRAMES_DIR);
    return entries.filter((name) => /\.png$/i.test(name)).map((name) => path.join(FRAMES_DIR, name));
  } catch {
    return [];
  }
}

async function listWebps() {
  try {
    const entries = await fs.readdir(FRAMES_DIR);
    return entries.filter((name) => /\.webp$/i.test(name));
  } catch {
    return [];
  }
}

const pngs = await listPngs();
const existingWebp = await listWebps();

if (pngs.length === 0) {
  console.log(`public/frames: ${existingWebp.length} WebP file(s), no PNGs to convert.`);
  process.exit(0);
}

console.log(`Converting ${pngs.length} frame(s) in public/frames…\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const inputPath of pngs.sort()) {
  const name = path.basename(inputPath);
  const outputPath = inputPath.replace(/\.png$/i, ".webp");

  await sharp(inputPath)
    .webp({ quality: FRAME_QUALITY, effort: 4 })
    .toFile(outputPath);

  const before = (await fs.stat(inputPath)).size;
  const after = (await fs.stat(outputPath)).size;
  totalBefore += before;
  totalAfter += after;
  await fs.unlink(inputPath);

  const pct = ((1 - after / before) * 100).toFixed(0);
  console.log(`  ${name} → ${path.basename(outputPath)}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (−${pct}%)`);
}

console.log(
  `\npublic/frames total: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB`,
);
console.log("\nCommit the .webp files and remove .png from git before deploy.");
