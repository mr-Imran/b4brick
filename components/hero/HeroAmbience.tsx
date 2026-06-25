"use client";

import { AnimatedGradientBg } from "@/components/ui/AnimatedGradientBg";
import { FlameEffect } from "@/components/ui/FlameEffect";

/** Pre-generated particle layout — stable across renders. */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${((i * 37 + 13) % 97) + 1}%`,
  top: `${((i * 53 + 7) % 93) + 3}%`,
  size: 1 + (i % 3) * 0.5,
  delay: (i % 7) * 0.6,
  duration: 10 + (i % 5) * 2,
  opacity: 0.15 + (i % 4) * 0.08,
}));

/**
 * Cinematic atmosphere — animated gradients, flames, dust, volumetric light.
 */
export function HeroAmbience() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#050505]" />
      <AnimatedGradientBg variant="cinematic" />

      {/* Soft volumetric light */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 50% 35%, rgba(255,248,240,0.09) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 15% 65%, rgba(255,255,255,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 85% 20%, rgba(255,95,0,0.07) 0%, transparent 55%)
          `,
        }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 120%, transparent 35%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <FlameEffect intensity="subtle" />

      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="hero-dust absolute rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
