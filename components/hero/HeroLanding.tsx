"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getFramePath, FRAME_COUNT } from "@/lib/frames";

interface HeroLandingProps {
  /** When true, Framer Motion entrance animations play. */
  isVisible: boolean;
}

const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.15,
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const brickVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 80 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

/**
 * Premium landing hero revealed after the canvas sequence fades out.
 * The final brick frame animates into center with the brand title.
 */
export function HeroLanding({ isVisible }: HeroLandingProps) {
  const finalFrame = getFramePath(FRAME_COUNT - 1);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(196,30,58,0.18) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-10 px-6"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Final luxury brick — animates from below into center */}
        <motion.div
          variants={brickVariants}
          className="relative"
        >
          <div
            className="absolute -inset-8 rounded-full blur-3xl"
            style={{ background: "rgba(196,30,58,0.25)" }}
            aria-hidden="true"
          />
          <Image
            src={finalFrame}
            alt="Premium red brick"
            width={280}
            height={280}
            className="relative h-auto w-48 object-contain drop-shadow-2xl sm:w-64 md:w-72"
            priority
          />
        </motion.div>

        {/* Brand title */}
        <div className="text-center">
          <motion.h1
            custom={0}
            variants={titleVariants}
            className="font-sans text-5xl font-bold tracking-[0.25em] text-white sm:text-6xl md:text-7xl"
          >
            BRIK.
          </motion.h1>
          <motion.p
            custom={1}
            variants={titleVariants}
            className="mt-4 text-sm font-light tracking-[0.45em] text-white/60 uppercase sm:text-base"
          >
            The Foundation of Greatness.
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-5"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.a
          href="#durability-lab"
          className="rounded-full border border-[#ffd28a]/25 bg-[#ffd28a]/8 px-5 py-2 text-[10px] tracking-[0.32em] text-[#ffd28a]/90 uppercase backdrop-blur-sm transition-colors hover:border-[#ffd28a]/45 hover:bg-[#ffd28a]/12"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Play Mini-Game
        </motion.a>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}
