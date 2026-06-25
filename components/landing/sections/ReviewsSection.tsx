"use client";

import { reviews } from "@/lib/brand";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="relative px-6 py-32 md:px-12 md:py-40 lg:px-20"
    >
      <div className="section-line absolute top-0 right-0 left-0" />

      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="text-center">
          <p className="text-xs tracking-[0.4em] text-[#D66A3D] uppercase">
            Testimonials
          </p>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Trusted by Visionaries
          </h2>
        </ScrollReveal>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {reviews.map((review, i) => (
            <ScrollReveal key={review.author} delay={i * 0.12}>
              <blockquote className="glass glow-soft flex h-full flex-col justify-between rounded-2xl p-8 transition-transform duration-500 hover:-translate-y-1">
                <p className="text-base leading-relaxed text-white/90 italic">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <footer className="mt-8 border-t border-white/5 pt-6">
                  <cite className="font-display text-sm font-semibold text-white not-italic">
                    {review.author}
                  </cite>
                  <p className="mt-1 text-xs text-[#BDBDBD]">{review.role}</p>
                </footer>
              </blockquote>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
