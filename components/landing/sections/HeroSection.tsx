"use client";

import { motion } from "framer-motion";
import { Brick3D } from "@/components/landing/Brick3D";
import { DustField } from "@/components/landing/DustField";
import { AnimatedGradientBg } from "@/components/ui/AnimatedGradientBg";
import { SplitHeadline } from "@/components/ui/AnimatedText";
import { FlameEffect } from "@/components/ui/FlameEffect";
import { MagneticButton } from "@/components/ui/MagneticButton";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay: 0.6 + i * 0.12, ease },
  }),
};

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24 pb-20 md:px-12 lg:px-20"
    >
      <AnimatedGradientBg variant="hero" />
      <DustField />
      <FlameEffect intensity="intense" />

      {/* Top spotlight */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-[55%] w-[80%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-8">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="flex items-center gap-4"
          >
            <div className="accent-line h-px w-10 bg-gradient-to-r from-[#FF5F00] to-[#FFD28A]" />
            <p className="text-xs tracking-[0.4em] text-[#D66A3D] uppercase">
              Introducing BRIK
            </p>
          </motion.div>

          <SplitHeadline
            text="The World's Most Luxurious Brick."
            highlight="Luxurious"
            className="font-display mt-8 text-4xl leading-[1.08] font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          />

          <motion.p
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-8 max-w-md text-base leading-relaxed text-[#BDBDBD] md:text-lg"
          >
            Crafted from earth. Refined through fire. Built to inspire.
          </motion.p>

          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-12 flex flex-wrap gap-4"
          >
            <MagneticButton href="#showcase" className="btn-glow-animated">
              Discover BRIK
            </MagneticButton>
            <MagneticButton href="#durability-lab" variant="ghost">
              Play BRIK Strike
            </MagneticButton>
            <MagneticButton href="#specs" variant="ghost">
              View Specifications
            </MagneticButton>
          </motion.div>
        </div>

        {/* Floating brick */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.3, ease }}
          className="flex justify-center lg:justify-end"
        >
          <Brick3D />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.35em] text-white/50 uppercase">
            Explore
          </span>
          <div className="h-10 w-px bg-gradient-to-b from-[#FFD28A]/60 via-[#FF5F00]/40 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
