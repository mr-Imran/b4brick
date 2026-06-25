"use client";

import { whyBrik } from "@/lib/brand";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function WhyBrikSection() {
  return (
    <section
      id="why"
      className="relative px-6 py-32 md:px-12 md:py-40 lg:px-20"
    >
      <div className="section-line absolute top-0 right-0 left-0" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 80% 50%, rgba(180,58,40,0.06) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal className="text-center">
          <p className="text-xs tracking-[0.4em] text-[#D66A3D] uppercase">
            Why BRIK
          </p>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Beyond Masonry
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[#BDBDBD]">
            This is not construction material. This is a statement.
          </p>
        </ScrollReveal>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {whyBrik.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <div className="group relative overflow-hidden rounded-2xl p-8 transition-transform duration-500 hover:-translate-y-2">
                <div className="glass absolute inset-0 transition-[border-color,box-shadow] duration-500 group-hover:border-[#B43A28]/30 group-hover:shadow-[0_0_40px_rgba(180,58,40,0.12)]" />
                <div className="relative">
                  <div className="mb-6 h-px w-10 bg-gradient-to-r from-[#B43A28] to-[#FFD28A]" />
                  <h3 className="font-display text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#BDBDBD]">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
