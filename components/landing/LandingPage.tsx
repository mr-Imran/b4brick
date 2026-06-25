"use client";

import { CursorSpotlight } from "@/components/ui/CursorSpotlight";
import { CtaSection } from "@/components/landing/sections/CtaSection";
import { DurabilityGameSection } from "@/components/landing/sections/DurabilityGameSection";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { ManufacturingSection } from "@/components/landing/sections/ManufacturingSection";
import { ReviewsSection } from "@/components/landing/sections/ReviewsSection";
import { ShowcaseSection } from "@/components/landing/sections/ShowcaseSection";
import { SpecificationsSection } from "@/components/landing/sections/SpecificationsSection";
import { WhyBrikSection } from "@/components/landing/sections/WhyBrikSection";

/**
 * Luxury product launch page for BRIK.
 * Follows the cinematic scroll sequence from CinematicHero.
 */
export default function LandingPage() {
  return (
    <CursorSpotlight>
      <main className="relative bg-[#050505] text-white">
        <HeroSection />
        <ManufacturingSection />
        <ShowcaseSection />
        <SpecificationsSection />
        <DurabilityGameSection />
        <WhyBrikSection />
        <ReviewsSection />
        <CtaSection />
      </main>
    </CursorSpotlight>
  );
}
