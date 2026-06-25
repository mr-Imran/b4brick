"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrickProductDisplay } from "@/components/landing/BrickProductDisplay";
import { DustField } from "@/components/landing/DustField";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const glow = glowRef.current;
      if (!glow) return;

      gsap.to(glow, {
        opacity: 0.7,
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative overflow-hidden px-6 py-32 md:px-12 md:py-40 lg:px-20"
    >
      <div className="section-line absolute top-0 right-0 left-0" />
      <DustField />

      <div
        ref={glowRef}
        className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,95,0,0.15) 0%, rgba(180,58,40,0.08) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center md:mb-16">
          <p className="text-xs tracking-[0.4em] text-[#D66A3D] uppercase">
            Product Display
          </p>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Elegant Clay Brick
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[#BDBDBD]">
            Every element engineered. Hover to explore the anatomy of perfection.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <BrickProductDisplay />
        </ScrollReveal>
      </div>
    </section>
  );
}
