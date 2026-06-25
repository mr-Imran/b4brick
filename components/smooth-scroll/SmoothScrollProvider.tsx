"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useDisplayTiming } from "@/components/display/DisplayTimingProvider";
import { LenisContext } from "@/components/smooth-scroll/LenisContext";
import { isMobileDevice } from "@/lib/device";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Lenis + ScrollTrigger. Mobile uses native touch scroll (no syncTouch) for FPS.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { timing } = useDisplayTiming();
  const lenisRef = useRef<Lenis | null>(null);
  const mobileRef = useRef(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    mobileRef.current = isMobileDevice();

    const instance = new Lenis({
      lerp: mobileRef.current ? 0.1 : timing.lenisLerp,
      smoothWheel: true,
      autoRaf: false,
      syncTouch: false,
      touchMultiplier: mobileRef.current ? 1 : 1.15,
      wheelMultiplier: timing.wheelMultiplier,
    });
    lenisRef.current = instance;
    setLenis(instance);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (typeof value === "number") {
          instance.scrollTo(value, { immediate: true });
        }
        return instance.scroll;
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

    instance.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
      ScrollTrigger.update();
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      instance.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize, { passive: true });
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.off("scroll", ScrollTrigger.update);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.options.lerp = mobileRef.current ? 0.1 : timing.lenisLerp;
    lenis.options.wheelMultiplier = timing.wheelMultiplier;
  }, [timing.hz, timing.lenisLerp, timing.wheelMultiplier]);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
