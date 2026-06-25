/** BRIK luxury brand design tokens */
export const colors = {
  background: "#050505",
  primary: "#B43A28",
  secondary: "#D66A3D",
  highlight: "#FFD28A",
  text: "#FFFFFF",
  textMuted: "#BDBDBD",
} as const;

export const productSpecs = [
  { label: "Weight", value: "2.4 kg" },
  { label: "Material", value: "Refined clay & mineral composite" },
  { label: "Fired Temperature", value: "1,150°C" },
  { label: "Durability", value: "150+ years" },
  { label: "Texture", value: "Hand-finished matte" },
  { label: "Lifetime", value: "Generational" },
] as const;

export const manufacturingSteps = [
  {
    step: "01",
    title: "Earth Selection",
    description:
      "Hand-sourced mineral-rich clay from ancient riverbeds. Only the finest grains qualify.",
  },
  {
    step: "02",
    title: "Sand Refinement",
    description:
      "Each particle purified and graded through a precision filtration process.",
  },
  {
    step: "03",
    title: "Compression",
    description:
      "Extreme pressure fuses particles into a dense, flawless rectangular form.",
  },
  {
    step: "04",
    title: "Kiln Firing",
    description:
      "Fired at 1,150°C. The signature crimson hue emerges through controlled heat.",
  },
  {
    step: "05",
    title: "Inspection",
    description:
      "Every brick is examined by master craftsmen. Imperfection is rejected.",
  },
] as const;

export const whyBrik = [
  {
    title: "Architectural Icon",
    description:
      "Specified by the world's most visionary architects for landmark structures.",
  },
  {
    title: "Generational Durability",
    description:
      "Engineered to outlast trends, weather, and time itself.",
  },
  {
    title: "Sustainable Legacy",
    description:
      "Responsibly sourced earth. Zero compromise on environmental integrity.",
  },
] as const;

export const reviews = [
  {
    quote:
      "I've specified materials for fifty years. BRIK is the only brick that feels like art.",
    author: "Elena Vasquez",
    role: "Principal Architect, Vasquez & Partners",
  },
  {
    quote:
      "Our clients don't ask what it costs. They ask where they can get more.",
    author: "James Whitfield",
    role: "Creative Director, Whitfield Studio",
  },
  {
    quote:
      "One brick changed how I think about foundations. That is not hyperbole.",
    author: "Amara Okafor",
    role: "Award-Winning Designer",
  },
] as const;
