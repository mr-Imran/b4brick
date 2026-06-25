"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  ImageSequence,
  useImagePreloader,
  type ImageSequenceHandle,
} from "@/components/image-sequence";
import {
  ALL_FRAME_PATHS,
  easeOutSmooth,
  FRAME_COUNT,
  storyFramePosition,
  STORY_SCROLL_DISTANCE,
} from "@/lib/frames";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { HeroAmbience } from "@/components/hero/HeroAmbience";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { HeroLanding } from "@/components/hero/HeroLanding";
import { StoryScrollText } from "@/components/hero/StoryScrollText";
import { STORY_TEXT_BEATS } from "@/lib/storyScrollText";
import {
  resetStoryText,
  updateStoryScrollText,
} from "@/lib/storyTextMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Hero intro — brand reveal before transformation begins. */
const INTRO_SCROLL = 1000;
/** Camera zoom + sand reveal + full frame sequence (scales with frame count). */
const STORY_SCROLL = STORY_SCROLL_DISTANCE;
/** Canvas fade into final brick landing — longer for smooth fade-out */
const REVEAL_SCROLL = 1100;
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
  const introContentRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const blackFadeRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const storyTextRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<ImageSequenceHandle>(null);

  const { isLoading, isReady, isFullyLoaded, progress, error, images } =
    useImagePreloader(ALL_FRAME_PATHS);

  const isMobile = useIsMobile();
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  const [isLandingVisible, setIsLandingVisible] = useState(false);
  const landingTriggeredRef = useRef(false);
  const currentFrameRef = useRef(-1);

  const setCanvasVisible = (wrapper: HTMLDivElement | null, visible: boolean) => {
    if (!wrapper) return;
    wrapper.style.visibility = visible ? "visible" : "hidden";
    wrapper.style.pointerEvents = visible ? "auto" : "none";
  };

  useGSAP(
    () => {
      if (!isReady || images.length === 0) return;

      let scrollTrigger: ScrollTrigger | undefined;
      let onTick: (() => void) | undefined;
      let rafId = 0;

      const applyHeroProgress = (p: number) => {
        const sequence = sequenceRef.current;
        if (!sequence) return;

        const intro = introRef.current;
        const introContent = introContentRef.current;
        const scrollHint = scrollHintRef.current;
        const canvasWrapper = canvasWrapperRef.current;
        const blackFade = blackFadeRef.current;
        const landing = landingRef.current;
        const storyText = storyTextRef.current;

        if (p <= INTRO_END) {
          if (intro) {
            intro.style.visibility = "visible";
            intro.style.opacity = "1";
          }
          if (introContent) {
            introContent.style.opacity = "1";
            introContent.style.transform = "translateY(0px)";
          }
          if (scrollHint) scrollHint.style.opacity = "1";
          if (canvasWrapper) {
            canvasWrapper.style.opacity = "0";
            canvasWrapper.style.transform = "scale(1.25)";
          }
          setCanvasVisible(canvasWrapper, false);
          if (blackFade) blackFade.style.opacity = "1";
          sequence.setOpacity(0);
          if (landing) landing.style.opacity = "0";
          resetStoryText(storyText);
          currentFrameRef.current = -1;
          return;
        }

        if (p <= STORY_END) {
          const story = segmentProgress(p, INTRO_END, STORY_END);

          const logoFade = Math.min(1, story / 0.14);
          const introOpacity = 1 - logoFade;

          if (intro) {
            intro.style.visibility = logoFade < 0.995 ? "visible" : "hidden";
            intro.style.opacity = "1";
          }
          if (introContent) {
            introContent.style.opacity = String(introOpacity);
            introContent.style.transform = `translateY(${-90 * logoFade}px)`;
          }
          if (scrollHint) {
            scrollHint.style.opacity = String(Math.max(0, 1 - logoFade * 2));
          }

          const canvasReveal = segmentProgress(story, 0.08, 0.28);
          const canvasGate = segmentProgress(logoFade, 0.88, 1);
          const zoomProgress = segmentProgress(story, 0.08, 0.4);
          const scale = lerp(1.28, 1, zoomProgress);

          if (blackFade) {
            const fadeOut = segmentProgress(story, 0.08, 0.32);
            blackFade.style.opacity = String(1 - fadeOut);
          }

          const frameProgress = segmentProgress(story, 0.06, 0.94);
          const framePos = storyFramePosition(frameProgress);
          const combinedOpacity = canvasReveal * canvasGate;

          if (combinedOpacity > 0.01) {
            setCanvasVisible(canvasWrapper, true);
            if (isMobileRef.current) {
              sequence.drawFrame(Math.round(framePos));
            } else {
              sequence.drawFrameBlend(framePos);
            }
            currentFrameRef.current = Math.round(framePos);

            const storyTailFade = segmentProgress(story, 0.75, 1);
            const tailOpacity = 1 - easeOutSmooth(storyTailFade, 2) * 0.5;
            const finalOpacity = combinedOpacity * tailOpacity;

            if (canvasWrapper) {
              canvasWrapper.style.opacity = String(finalOpacity);
              canvasWrapper.style.transform = `scale(${scale})`;
            }
            sequence.setOpacity(finalOpacity);
          } else {
            setCanvasVisible(canvasWrapper, false);
            if (canvasWrapper) {
              canvasWrapper.style.opacity = "0";
              canvasWrapper.style.transform = "scale(1.25)";
            }
            sequence.setOpacity(0);
            currentFrameRef.current = -1;
          }

          if (landing) landing.style.opacity = "0";
          updateStoryScrollText(storyText, story, STORY_TEXT_BEATS);

          if (landingTriggeredRef.current) {
            landingTriggeredRef.current = false;
            setIsLandingVisible(false);
          }
          return;
        }

        if (intro) {
          intro.style.visibility = "hidden";
          intro.style.opacity = "1";
        }
        if (introContent) {
          introContent.style.opacity = "0";
          introContent.style.transform = "translateY(-90px)";
        }
        if (scrollHint) scrollHint.style.opacity = "0";
        if (blackFade) blackFade.style.opacity = "0";
        resetStoryText(storyText);

        if (currentFrameRef.current !== FRAME_COUNT - 1) {
          currentFrameRef.current = FRAME_COUNT - 1;
          setCanvasVisible(canvasWrapper, true);
          sequence.drawFrameBlend(FRAME_COUNT - 1);
        }

        const revealRaw = segmentProgress(p, STORY_END, 1);
        const revealProgress = easeOutSmooth(revealRaw, 2.2);
        const canvasOpacity = 1 - revealProgress;

        setCanvasVisible(canvasWrapper, canvasOpacity > 0.01);
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
      };

      rafId = requestAnimationFrame(() => {
        const sequence = sequenceRef.current;
        if (!sequence || !sectionRef.current || !pinRef.current) return;

        sequence.resize();
        sequence.drawFrame(0);
        sequence.setOpacity(0);

        scrollTrigger = ScrollTrigger.create({
          id: "cinematic-hero",
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${TOTAL_SCROLL}`,
          pin: pinRef.current,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeaveBack: () => {
            landingTriggeredRef.current = false;
            setIsLandingVisible(false);
          },
        });

        onTick = () => {
          if (!scrollTrigger) return;
          applyHeroProgress(scrollTrigger.progress);
        };

        gsap.ticker.add(onTick);
        applyHeroProgress(scrollTrigger.progress);
      });

      return () => {
        cancelAnimationFrame(rafId);
        if (onTick) gsap.ticker.remove(onTick);
        scrollTrigger?.kill();
      };
    },
    {
      scope: sectionRef,
      dependencies: [isReady],
      revertOnUpdate: true,
    },
  );

  return (
    <>
      {isLoading && !isFullyLoaded && (
        <LoadingIndicator progress={progress} variant="bar" />
      )}

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
              className="absolute inset-0 z-10 contain-paint"
              style={{ opacity: 0, transform: "scale(1.25)", visibility: "hidden" }}
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

          {/* Scroll-synced story captions */}
          <div ref={storyTextRef}>
            <StoryScrollText />
          </div>

          {/* Opening hero — visible before transformation */}
          <div
            ref={introRef}
            className="absolute inset-0 z-20 bg-[#0c0c0e]"
          >
            <div ref={introContentRef} className="h-full w-full">
              <HeroIntro scrollHintRef={scrollHintRef} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
