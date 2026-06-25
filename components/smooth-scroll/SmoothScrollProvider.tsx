"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useDisplayTiming } from "@/components/display/DisplayTimingProvider";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Lenis + ScrollTrigger, tuned to the detected display refresh rate.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { timing } = useDisplayTiming();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: timing.lenisLerp,
      smoothWheel: true,
      autoRaf: false,
      syncTouch: true,
      touchMultiplier: 1.15,
      wheelMultiplier: timing.wheelMultiplier,
    });
    lenisRef.current = lenis;

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
      ScrollTrigger.update();
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize, { passive: true });
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.options.lerp = timing.lenisLerp;
    lenis.options.wheelMultiplier = timing.wheelMultiplier;
  }, [timing.hz, timing.lenisLerp, timing.wheelMultiplier]);

  return <>{children}</>;
}
