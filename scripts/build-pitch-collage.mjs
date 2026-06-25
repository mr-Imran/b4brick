/**
 * Stitch key pitch screenshots into one submission collage.
 */
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "pitch-screenshots");
const OUT = path.join(DIR, "PITCH-COLLAGE.png");

const panels = [
  "01-hero-intro-desktop.png",
  "03-brick-forging-desktop.png",
  "06-brik-strike-desktop.png",
  "07-product-showcase-desktop.png",
];

const tileW = 720;
const tileH = 450;
const gap = 12;
const cols = 2;
const rows = 2;
const canvasW = cols * tileW + gap * (cols + 1);
const canvasH = rows * tileH + gap * (rows + 1) + 72;

const composites = [];
for (let i = 0; i < panels.length; i++) {
  const file = path.join(DIR, panels[i]);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = gap + col * (tileW + gap);
  const y = 72 + gap + row * (tileH + gap);
  const buf = await sharp(file).resize(tileW, tileH, { fit: "cover" }).png().toBuffer();
  composites.push({ input: buf, left: x, top: y });
}

const header = Buffer.from(`
<svg width="${canvasW}" height="72">
  <rect width="100%" height="100%" fill="#050505"/>
  <text x="50%" y="46" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="700" text-anchor="middle" letter-spacing="8">BRIK.</text>
</svg>
`);

await sharp({
  create: {
    width: canvasW,
    height: canvasH,
    channels: 3,
    background: "#050505",
  },
})
  .composite([{ input: header, left: 0, top: 0 }, ...composites])
  .png()
  .toFile(OUT);

console.log(`Collage saved: ${OUT}`);
