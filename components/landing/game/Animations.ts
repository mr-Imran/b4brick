import gsap from "gsap";

export const PRESS_EASE = "power4.inOut";
export const BOUNCE_EASE = "elastic.out(1, 0.5)";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function mapPressureToPressProgress(pressure: number): number {
  return clamp(pressure / 100, 0, 1);
}

export function createButtonRipple(target: HTMLElement) {
  const ripple = document.createElement("span");
  ripple.className = "press-ripple";
  target.appendChild(ripple);
  gsap.fromTo(
    ripple,
    { scale: 0.2, opacity: 0.6 },
    {
      scale: 2.2,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    },
  );
}
