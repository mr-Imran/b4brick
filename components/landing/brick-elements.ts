export interface BrickElement {
  id: string;
  title: string;
  description: string;
  /** Hotspot position on brick image (% of brick wrapper) */
  hotspot: { x: number; y: number };
}

export const BRICK_ELEMENTS: BrickElement[] = [
  {
    id: "clay",
    title: "Clay Composition",
    description:
      "Mineral-rich earth, hand-selected and purified for unmatched density.",
    hotspot: { x: 68, y: 30 },
  },
  {
    id: "compression",
    title: "Compression Density",
    description:
      "Extreme hydraulic pressure fuses particles into a flawless form.",
    hotspot: { x: 64, y: 40 },
  },
  {
    id: "kiln",
    title: "Kiln Fired",
    description:
      "Cured at 1,150°C. The signature crimson hue emerges through fire.",
    hotspot: { x: 60, y: 50 },
  },
  {
    id: "texture",
    title: "Surface Texture",
    description:
      "Hand-finished matte surface with micro-grain architectural detail.",
    hotspot: { x: 72, y: 60 },
  },
  {
    id: "engraving",
    title: "BRIK Engraving",
    description:
      "Precision-etched brand mark. A signature of authenticity.",
    hotspot: { x: 58, y: 70 },
  },
];
