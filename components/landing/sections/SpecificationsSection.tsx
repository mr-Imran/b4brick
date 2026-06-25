"use client";

import Image from "next/image";
import { productSpecs } from "@/lib/brand";
import { getFramePath, FRAME_COUNT } from "@/lib/frames";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function SpecificationsSection() {
  const brickSrc = getFramePath(FRAME_COUNT - 1);

  return (
    <section
      id="specs"
      className="relative px-6 py-32 md:px-12 md:py-40 lg:px-20"
    >
      <div className="section-line absolute top-0 right-0 left-0" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <ScrollReveal>
          <div className="glass-strong glow-soft relative overflow-hidden rounded-3xl p-8 md:p-12">
            <div
              className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl"
              style={{ background: "rgba(255,210,138,0.08)" }}
              aria-hidden="true"
            />

            <div className="relative flex flex-col items-center">
              <Image
                src={brickSrc}
                alt="BRIK luxury brick"
                width={240}
                height={240}
                className="h-48 w-48 object-contain md:h-56 md:w-56"
              />
              <h3 className="font-display mt-8 text-2xl font-bold tracking-wide text-white">
                BRIK. Signature
              </h3>
              <p className="mt-2 text-sm text-[#BDBDBD]">
                The definitive luxury brick
              </p>
            </div>

            <div className="mt-10 space-y-0 divide-y divide-white/5">
              {productSpecs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between py-4">
                  <span className="text-sm text-[#BDBDBD]">{spec.label}</span>
                  <span className="text-sm font-medium text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-xs tracking-[0.4em] text-[#D66A3D] uppercase">
            Specifications
          </p>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Engineered Without Compromise
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-[#BDBDBD]">
            Every dimension, every gram, every degree of heat — calibrated for
            those who accept nothing less than extraordinary.
          </p>
          <p className="mt-6 text-[#BDBDBD]">
            BRIK Signature represents the pinnacle of masonry science. A single
            brick that carries the weight of architectural legacy.
          </p>
          <div className="mt-10">
            <MagneticButton href="#durability-lab" className="btn-glow-animated">
              Play BRIK Strike
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
