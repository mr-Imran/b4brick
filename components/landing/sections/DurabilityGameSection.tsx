"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { FootballGame } from "@/components/landing/game/FootballGame";
import {
  MILESTONE_GOALS,
  ROUND_TIME_SEC,
  SHOTS_PER_ROUND,
} from "@/components/landing/game/footballGameLogic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GAME_FEATURES = [
  "Physics Kick",
  "Aim & Release",
  "Keeper AI",
  "High Score",
] as const;

/**
 * Featured mini-game section — spotlight treatment for BRIK Strike.
 */
export function DurabilityGameSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pitchGlowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const glow = glowRef.current;
      const pitchGlow = pitchGlowRef.current;
      if (!glow || !pitchGlow || !sectionRef.current) return;

      gsap.fromTo(
        glow,
        { opacity: 0.25, scale: 0.92 },
        {
          opacity: 0.85,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "center center",
            scrub: 1.2,
          },
        },
      );

      gsap.to(pitchGlow, {
        opacity: 0.9,
        y: -24,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="durability-lab"
      className="relative overflow-hidden px-6 py-36 md:px-12 md:py-48 lg:px-20"
      aria-labelledby="brik-strike-heading"
    >
      <div className="section-line absolute inset-x-0 top-0" />

      <div className="pointer-events-none absolute inset-0 bg-[#030806]" aria-hidden="true" />

      <div
        ref={glowRef}
        className="pointer-events-none absolute top-1/2 left-1/2 h-[min(900px,90vw)] w-[min(1100px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[100px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,95,0,0.22) 0%, rgba(34,80,50,0.18) 35%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={pitchGlowRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(34,80,50,0.28) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="game-feature-badge inline-flex items-center gap-2.5 rounded-full border border-[#ffd28a]/35 bg-[#ffd28a]/8 px-5 py-2 text-[10px] tracking-[0.38em] text-[#ffd28a] uppercase"
          >
            <span className="game-live-dot h-1.5 w-1.5 rounded-full bg-[#ff5f00]" />
            Featured Experience
          </motion.div>

          <p className="mt-6 text-xs tracking-[0.45em] text-[#d66a3d] uppercase">
            Interactive Mini-Game
          </p>

          <h2
            id="brik-strike-heading"
            className="font-display mt-4 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          >
            <span className="text-gradient-warm">BRIK Strike</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#bdbdbd] md:text-lg">
            Drag, aim, and launch the brick into the goal. Beat the keeper, chain
            your streak, and unlock the{" "}
            <span className="text-[#ffd28a]">Strong Brick</span> milestone.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {GAME_FEATURES.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] tracking-[0.28em] text-white/70 uppercase backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>

          <p className="mt-6 font-mono text-xs tracking-widest text-[#bdbdbd]/60 uppercase">
            {ROUND_TIME_SEC}s round · {SHOTS_PER_ROUND} shots · {MILESTONE_GOALS} goals = milestone
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-14 md:mt-16">
          <div className="game-spotlight-wrap">
            <FootballGame />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
