"use client";

import dynamic from "next/dynamic";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { DisplayTimingProvider } from "@/components/display/DisplayTimingProvider";
import { SmoothScrollProvider } from "@/components/smooth-scroll/SmoothScrollProvider";

const LandingPage = dynamic(
  () => import("@/components/landing/LandingPage"),
  { ssr: false },
);

/**
 * Client shell for scroll-driven hero + lazy-loaded landing content.
 */
export function HomeClient() {
  return (
    <DisplayTimingProvider>
      <SmoothScrollProvider>
        <CinematicHero />
        <LandingPage />
      </SmoothScrollProvider>
    </DisplayTimingProvider>
  );
}
