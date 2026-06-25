"use client";

interface AnimatedGradientBgProps {
  className?: string;
  variant?: "hero" | "cinematic" | "subtle";
}

/**
 * Slowly shifting kiln-inspired gradient mesh.
 * GPU-friendly — animates background-position only.
 */
export function AnimatedGradientBg({
  className = "",
  variant = "hero",
}: AnimatedGradientBgProps) {
  const variantClass = {
    hero: "gradient-bg-hero",
    cinematic: "gradient-bg-cinematic",
    subtle: "gradient-bg-subtle",
  }[variant];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className={`gradient-mesh absolute inset-[-50%] ${variantClass}`} />
      {/* Warm pulse orb */}
      <div className="gradient-orb absolute top-1/4 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full" />
      <div className="gradient-orb-secondary absolute right-0 bottom-0 h-[400px] w-[500px] rounded-full" />
    </div>
  );
}
