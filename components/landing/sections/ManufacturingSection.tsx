"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { manufacturingSteps } from "@/lib/brand";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ManufacturingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const line = lineRef.current;
      if (!line) return;

      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative px-6 py-32 md:px-12 md:py-40 lg:px-20"
    >
      <div className="kiln-glow absolute inset-0" aria-hidden="true" />
      <div className="section-line absolute top-0 right-0 left-0" />

      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <p className="text-xs tracking-[0.4em] text-[#D66A3D] uppercase">
            The Journey
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-5xl">
            Manufacturing Excellence
          </h2>
          <p className="mt-6 max-w-xl text-[#BDBDBD]">
            Five precise stages transform raw earth into an object of desire.
          </p>
        </ScrollReveal>

        {/* Progress line */}
        <div className="relative mt-20 hidden md:block">
          <div className="h-px w-full origin-left bg-white/5" />
          <div
            ref={lineRef}
            className="absolute top-0 left-0 h-px w-full origin-left bg-gradient-to-r from-[#B43A28] via-[#D66A3D] to-[#FFD28A]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div className="mt-16 grid gap-8 md:mt-20 md:grid-cols-5 md:gap-6">
          {manufacturingSteps.map((step, i) => (
            <ScrollReveal key={step.step} delay={i * 0.08}>
              <div className="group glass glow-soft rounded-2xl p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(180,58,40,0.15)]">
                <span className="font-mono text-xs text-[#FFD28A]/70">
                  {step.step}
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#BDBDBD]">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
