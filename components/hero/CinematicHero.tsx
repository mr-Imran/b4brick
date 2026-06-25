"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import {
  ImageSequence,
  useImagePreloader,
  type ImageSequenceHandle,
} from "@/components/image-sequence";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { HeroAmbience } from "@/components/hero/HeroAmbience";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { HeroLanding } from "@/components/hero/HeroLanding";
import {
  ALL_FRAME_PATHS,
  FRAME_COUNT,
  STORY_SCROLL_DISTANCE,
  progressToFrameIndex,
} from "@/lib/frames";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Hero intro — brand reveal before transformation begins. */
const INTRO_SCROLL = 1000;
/** Camera zoom + sand reveal + full frame sequence (scales with frame count). */
const STORY_SCROLL = STORY_SCROLL_DISTANCE;
/** Canvas fade into final brick landing. */
const REVEAL_SCROLL = 800;
const TOTAL_SCROLL = INTRO_SCROLL + STORY_SCROLL + REVEAL_SCROLL;

const INTRO_END = INTRO_SCROLL / TOTAL_SCROLL;
const STORY_END = (INTRO_SCROLL + STORY_SCROLL) / TOTAL_SCROLL;

/** Map global progress to 0–1 within a segment. */
function segmentProgress(
  progress: number,
  start: number,
  end: number,
): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Full-viewport pinned cinematic experience.
 *
 * Scroll phases:
 * 1. Hero intro — logo, story copy, scroll cue (no sand visible)
 * 2. Story — logo fades up, camera zooms in, sand transformation plays
 * 3. Reveal — canvas fades, luxury brick landing appears
 */
export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const blackFadeRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<ImageSequenceHandle>(null);

  const { isLoading, isReady, progress, error, images } =
    useImagePreloader(ALL_FRAME_PATHS);

  const [isLandingVisible, setIsLandingVisible] = useState(false);
  const landingTriggeredRef = useRef(false);
  const currentFrameRef = useRef(-1);

  useGSAP(
    () => {
      if (!isReady || images.length === 0) return;

      let scrollTrigger: ScrollTrigger | undefined;

      const rafId = requestAnimationFrame(() => {
        const sequence = sequenceRef.current;
        if (!sequence || !sectionRef.current || !pinRef.current) return;

        // Canvas hidden until story begins — do not draw sand on load
        sequence.setOpacity(0);

        scrollTrigger = ScrollTrigger.create({
          id: "cinematic-hero",
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${TOTAL_SCROLL}`,
          pin: pinRef.current,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const intro = introRef.current;
            const scrollHint = scrollHintRef.current;
            const canvasWrapper = canvasWrapperRef.current;
            const blackFade = blackFadeRef.current;
            const landing = landingRef.current;

            if (p <= INTRO_END) {
              // ── Phase 1: Hero intro only ──────────────────────────
              if (intro) {
                intro.style.opacity = "1";
                intro.style.transform = "translateY(0px)";
              }
              if (scrollHint) scrollHint.style.opacity = "1";
              if (canvasWrapper) {
                canvasWrapper.style.opacity = "0";
                canvasWrapper.style.transform = "scale(1.25)";
              }
              if (blackFade) blackFade.style.opacity = "1";
              sequence.setOpacity(0);
              if (landing) landing.style.opacity = "0";
              currentFrameRef.current = -1;
              return;
            }

            if (p <= STORY_END) {
              // ── Phase 2: Story — zoom into sand, play sequence ────
              const story = segmentProgress(p, INTRO_END, STORY_END);

              // Logo fades upward in first 14% of story
              const logoFade = Math.min(1, story / 0.14);
              if (intro) {
                intro.style.opacity = String(1 - logoFade);
                intro.style.transform = `translateY(${-90 * logoFade}px)`;
              }
              if (scrollHint) {
                scrollHint.style.opacity = String(Math.max(0, 1 - logoFade * 2));
              }

              // Canvas reveals 8%–28% — cinematic fade from black
              const canvasReveal = segmentProgress(story, 0.08, 0.28);
              const zoomProgress = segmentProgress(story, 0.08, 0.4);
              const scale = lerp(1.28, 1, zoomProgress);

              if (canvasWrapper) {
                canvasWrapper.style.opacity = String(canvasReveal);
                canvasWrapper.style.transform = `scale(${scale})`;
              }
              if (blackFade) {
                const fadeOut = segmentProgress(story, 0.08, 0.32);
                blackFade.style.opacity = String(1 - fadeOut);
              }

              sequence.setOpacity(canvasReveal);

              // Frames begin early — ~1 scroll wheel advances several images
              const frameProgress = segmentProgress(story, 0.1, 0.92);
              const frameIndex = progressToFrameIndex(frameProgress);

              if (frameIndex !== currentFrameRef.current) {
                currentFrameRef.current = frameIndex;
                sequence.drawFrame(frameIndex);
              }

              if (landing) landing.style.opacity = "0";

              // Reset landing animation only when scrolling back from reveal
              if (landingTriggeredRef.current) {
                landingTriggeredRef.current = false;
                setIsLandingVisible(false);
              }
              return;
            }

            // ── Phase 3: Reveal final brick landing ─────────────────
            if (currentFrameRef.current !== FRAME_COUNT - 1) {
              currentFrameRef.current = FRAME_COUNT - 1;
              sequence.drawFrame(FRAME_COUNT - 1);
            }

            if (intro) intro.style.opacity = "0";
            if (scrollHint) scrollHint.style.opacity = "0";
            if (blackFade) blackFade.style.opacity = "0";

            const revealProgress = segmentProgress(p, STORY_END, 1);
            const canvasOpacity = 1 - revealProgress;

            if (canvasWrapper) {
              canvasWrapper.style.opacity = String(canvasOpacity);
              canvasWrapper.style.transform = "scale(1)";
            }
            sequence.setOpacity(canvasOpacity);

            if (landing) {
              landing.style.opacity = String(revealProgress);
            }

            if (revealProgress > 0.35 && !landingTriggeredRef.current) {
              landingTriggeredRef.current = true;
              setIsLandingVisible(true);
            }
          },
          onLeaveBack: () => {
            landingTriggeredRef.current = false;
            setIsLandingVisible(false);
          },
        });
      });

      return () => {
        cancelAnimationFrame(rafId);
        scrollTrigger?.kill();
      };
    },
    {
      scope: sectionRef,
      dependencies: [isReady, images.length],
      revertOnUpdate: true,
    },
  );

  return (
    <>
      {isLoading && <LoadingIndicator progress={progress} />}

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0e] px-6 text-center text-white/70">
          <p>Failed to load animation frames. {error}</p>
        </div>
      )}

      <section
        ref={sectionRef}
        className="relative"
        aria-label="Sand to brick transformation"
      >
        <div
          ref={pinRef}
          className="relative h-svh w-full overflow-hidden bg-[#0c0c0e]"
        >
          <HeroAmbience />

          {/* Final brick landing — beneath canvas */}
          <div
            ref={landingRef}
            className="absolute inset-0 z-[5]"
            style={{ opacity: 0 }}
            aria-hidden={!isLandingVisible}
          >
            <HeroLanding isVisible={isLandingVisible} />
          </div>

          {/* Transformation canvas — hidden until scroll begins */}
          {isReady && images.length > 0 && (
            <div
              ref={canvasWrapperRef}
              className="absolute inset-0 z-10 will-change-transform"
              style={{ opacity: 0, transform: "scale(1.25)" }}
            >
              <ImageSequence
                ref={sequenceRef}
                frameCount={FRAME_COUNT}
                images={images}
                frameIndex={0}
                className="h-full w-full"
                backgroundColor="#0c0c0e"
              />
              {/* Cinematic fade from black into the scene */}
              <div
                ref={blackFadeRef}
                className="pointer-events-none absolute inset-0 bg-black"
                style={{ opacity: 1 }}
              />
            </div>
          )}

          {/* Opening hero — visible before transformation */}
          <div
            ref={introRef}
            className="absolute inset-0 z-20 will-change-transform"
          >
            <HeroIntro scrollHintRef={scrollHintRef} />
          </div>
        </div>
      </section>
    </>
  );
}
