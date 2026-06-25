"use client";

import { motion } from "framer-motion";
import { AnimatedGradientBg } from "@/components/ui/AnimatedGradientBg";
import { FlameEffect } from "@/components/ui/FlameEffect";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function CtaSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-32 md:px-12 md:py-48 lg:px-20"
    >
      <div className="section-line absolute top-0 right-0 left-0" />
      <AnimatedGradientBg variant="subtle" />
      <FlameEffect intensity="subtle" />

      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full blur-[100px]"
        style={{ background: "rgba(255,95,0,0.12)" }}
        animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Build Something
            <br />
            <span className="text-gradient-animated">Eternal.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-lg text-[#BDBDBD]">
            Request a sample. Feel the difference. Join the architects who
            already know.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <MagneticButton href="mailto:hello@brik.com" className="btn-glow-animated">
              Request a Sample
            </MagneticButton>
            <MagneticButton href="#hero" variant="ghost">
              Back to Top
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>

      <footer className="relative z-10 mx-auto mt-32 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-12 text-xs tracking-widest text-[#BDBDBD]/50 sm:flex-row">
        <span>© 2026 BRIK. All rights reserved.</span>
        <span className="font-display text-gradient-animated text-sm">BRIK.</span>
        <span>The Foundation of Greatness.</span>
      </footer>
    </section>
  );
}
