"use client";

import { FootballGame } from "@/components/landing/game/FootballGame";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function DurabilityGameSection() {
  return (
    <section
      id="durability-lab"
      className="relative px-6 py-32 md:px-12 md:py-40 lg:px-20"
    >
      <div className="section-line absolute inset-x-0 top-0" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(34,80,50,0.12) 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center md:mb-16">
          <p className="text-xs tracking-[0.4em] text-[#D66A3D] uppercase">
            Mini-Game
          </p>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            BRIK Strike
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[#BDBDBD]">
            Drag, aim, and shoot the brick into the goal. Dodge the keeper, build
            your streak, and chase the high score.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <FootballGame />
        </ScrollReveal>
      </div>
    </section>
  );
}
