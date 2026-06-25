"use client";

import { motion } from "framer-motion";
import { ShimmerText } from "@/components/ui/AnimatedText";

const ease = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.25 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease },
  },
};

interface HeroIntroProps {
  scrollHintRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Cinematic opening hero — Apple keynote style brand reveal.
 */
export function HeroIntro({ scrollHintRef }: HeroIntroProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6">
      <motion.div
        className="flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Accent line */}
        <motion.div
          variants={itemVariants}
          className="mb-8 h-px w-16 bg-gradient-to-r from-transparent via-[#FF5F00] to-transparent"
        />

        <motion.h1
          variants={itemVariants}
          className="font-display text-6xl font-bold tracking-[0.32em] text-white sm:text-7xl md:text-8xl lg:text-9xl"
        >
          <ShimmerText>BRIK.</ShimmerText>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-8 max-w-lg text-sm font-light tracking-[0.42em] text-white/90 uppercase sm:text-base"
        >
          The Foundation of Greatness.
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mt-5 max-w-md text-xs leading-relaxed font-light tracking-[0.14em] text-white/50 sm:text-sm"
        >
          Every masterpiece begins with a single grain.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </motion.div>

      {/* Scroll to begin */}
      <motion.div
        ref={scrollHintRef}
        className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1, ease }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] tracking-[0.38em] text-white/60 uppercase">
            Scroll to Begin
          </span>
          <div className="relative flex h-10 w-5 items-start justify-center rounded-full border border-white/30 p-1">
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="h-1.5 w-1 rounded-full bg-gradient-to-b from-[#FFD28A] to-[#FF5F00]"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
