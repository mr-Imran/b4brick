"use client";

import { STORY_TEXT_BEATS } from "@/lib/storyScrollText";

/**
 * Scroll-driven captions overlaid on the transformation sequence.
 * Opacity + translateY are driven by CinematicHero each tick.
 */
export function StoryScrollText() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] overflow-hidden"
      aria-live="polite"
    >
      {/* Legibility gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-black/70 via-black/25 to-transparent"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-[16vh] flex flex-col items-center px-6 sm:bottom-[18vh]">
        {STORY_TEXT_BEATS.map((beat) => (
          <div
            key={beat.title}
            data-story-beat
            className="absolute inset-x-0 flex flex-col items-center text-center will-change-[opacity,transform]"
            style={{ opacity: 0, transform: "translateY(80px)" }}
          >
            <p className="font-display text-3xl font-semibold tracking-[0.22em] text-white sm:text-4xl md:text-5xl">
              {beat.title}
            </p>
            <p className="mt-4 max-w-md text-xs font-light tracking-[0.28em] text-white/65 uppercase sm:text-sm">
              {beat.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
