/**
 * Ensures all 102 scroll frames exist in public/frames as WebP.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FRAMES_DIR = path.join(ROOT, "public", "frames");
const FRAME_COUNT = 102;
const BASENAME = "Create_an_ultra_realistic_cin_gwr_video_mvp";

const missing = [];

for (let i = 0; i < FRAME_COUNT; i++) {
  const filename = `${BASENAME}_${String(i).padStart(3, "0")}.webp`;
  const filePath = path.join(FRAMES_DIR, filename);
  if (!fs.existsSync(filePath)) missing.push(filename);
}

if (missing.length > 0) {
  console.error(`\nMissing ${missing.length} frame(s) in public/frames/:`);
  missing.slice(0, 5).forEach((f) => console.error(`  - ${f}`));
  if (missing.length > 5) console.error(`  … and ${missing.length - 5} more`);
  console.error("\nRun: npm run optimize:frames  (after adding PNGs)");
  console.error("Or commit all .webp files from public/frames/\n");
  process.exit(1);
}

const webpCount = fs
  .readdirSync(FRAMES_DIR)
  .filter((f) => f.endsWith(".webp")).length;

console.log(`✓ public/frames: ${webpCount} WebP frame(s) ready`);
