"use client";

import dynamic from "next/dynamic";
import { SmoothScrollProvider } from "@/components/smooth-scroll/SmoothScrollProvider";

const CinematicHero = dynamic(
  () =>
    import("@/components/hero/CinematicHero").then((mod) => mod.CinematicHero),
  { ssr: false },
);

const LandingPage = dynamic(
  () => import("@/components/landing/LandingPage"),
  { ssr: false },
);

/**
 * Client shell for scroll-driven hero + lazy-loaded landing content.
 */
export function HomeClient() {
  return (
    <SmoothScrollProvider>
      <CinematicHero />
      <LandingPage />
    </SmoothScrollProvider>
  );
}
