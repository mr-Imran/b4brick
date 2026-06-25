/** Display refresh profiles for adaptive scroll + frame playback */

export type DisplayProfile = "standard" | "high" | "ultra";

export interface DisplayTiming {
  hz: number;
  profile: DisplayProfile;
  /** Lenis wheel inertia — moderate lerp like GTA VI / Lenis + GSAP demos */
  lenisLerp: number;
  wheelMultiplier: number;
}

export const DEFAULT_DISPLAY_TIMING: DisplayTiming = {
  hz: 60,
  profile: "standard",
  lenisLerp: 0.055,
  wheelMultiplier: 0.86,
};

function snapRefreshRate(measured: number): number {
  if (measured >= 138) return 144;
  if (measured >= 110) return 120;
  if (measured >= 85) return 90;
  if (measured >= 68) return 75;
  return 60;
}

export function measureRefreshRate(sampleMs = 480): Promise<number> {
  if (typeof window === "undefined") return Promise.resolve(60);

  const screenHz = (window.screen as Screen & { refreshRate?: number }).refreshRate;
  if (screenHz && screenHz >= 30) {
    return Promise.resolve(snapRefreshRate(screenHz));
  }

  return new Promise((resolve) => {
    const deltas: number[] = [];
    let last = performance.now();
    let start = last;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      if (delta > 0 && delta < 100) deltas.push(delta);

      if (now - start >= sampleMs) {
        if (deltas.length < 4) {
          resolve(60);
          return;
        }
        const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        resolve(snapRefreshRate(Math.round(1000 / avg)));
        return;
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

/** Softer Lenis + gentler wheel for silkier cinematic scrub */
export function getDisplayTiming(hz: number): DisplayTiming {
  if (hz >= 140) {
    return { hz, profile: "ultra", lenisLerp: 0.07, wheelMultiplier: 0.88 };
  }
  if (hz >= 110) {
    return { hz, profile: "high", lenisLerp: 0.062, wheelMultiplier: 0.87 };
  }
  return { hz, profile: "standard", lenisLerp: 0.055, wheelMultiplier: 0.86 };
}
