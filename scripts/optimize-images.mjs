/**
 * Compress public PNGs → WebP and remove originals.
 * Run: npm run optimize:images
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const FRAME_QUALITY = 72;
const BRICK_MAX_WIDTH = 640;
const ASSET_MAX_WIDTH = 1024;
const ASSET_QUALITY = 78;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && /\.png$/i.test(entry.name)) files.push(full);
  }
  return files;
}

async function convertFile(inputPath) {
  const rel = path.relative(PUBLIC, inputPath);
  const outputPath = inputPath.replace(/\.png$/i, ".webp");
  const isFrame = rel.startsWith(`frames${path.sep}`);
  const isBrick = rel === "brick.png";

  let pipeline = sharp(inputPath);

  if (isBrick) {
    pipeline = pipeline.resize({
      width: BRICK_MAX_WIDTH,
      withoutEnlargement: true,
    });
  } else if (!isFrame) {
    pipeline = pipeline.resize({
      width: ASSET_MAX_WIDTH,
      withoutEnlargement: true,
    });
  }

  const quality = isFrame ? FRAME_QUALITY : ASSET_QUALITY;

  await pipeline
    .webp({
      quality,
      effort: 4,
      alphaQuality: 80,
    })
    .toFile(outputPath);

  const before = (await fs.stat(inputPath)).size;
  const after = (await fs.stat(outputPath)).size;
  await fs.unlink(inputPath);

  return { rel, before, after };
}

const files = await walk(PUBLIC);
if (files.length === 0) {
  console.log("No PNG files found in public/");
  process.exit(0);
}

console.log(`Optimizing ${files.length} PNG(s)…\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const result = await convertFile(file);
  totalBefore += result.before;
  totalAfter += result.after;
  const pct = ((1 - result.after / result.before) * 100).toFixed(0);
  console.log(
    `  ${result.rel}: ${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB (−${pct}%)`,
  );
}

console.log(
  `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB (−${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`,
);
