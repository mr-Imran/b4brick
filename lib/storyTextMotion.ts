import { easeOutSmooth } from "@/lib/frames";

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

const ENTER_END = 0.38;
const EXIT_START = 0.62;
const RISE_IN = 80;
const RISE_OUT = -56;

/**
 * Bottom-to-top scroll caption: rises in, holds, then exits upward.
 */
export function applyStoryBeatMotion(
  el: HTMLElement,
  storyProgress: number,
  beatStart: number,
  beatEnd: number,
): void {
  const local = segmentProgress(storyProgress, beatStart, beatEnd);

  if (local <= 0) {
    el.style.opacity = "0";
    el.style.transform = `translateY(${RISE_IN}px)`;
    el.style.filter = "blur(6px)";
    return;
  }

  if (local >= 1) {
    el.style.opacity = "0";
    el.style.transform = `translateY(${RISE_OUT}px)`;
    el.style.filter = "blur(4px)";
    return;
  }

  if (local < ENTER_END) {
    const t = easeOutSmooth(local / ENTER_END, 2);
    el.style.opacity = String(t);
    el.style.transform = `translateY(${lerp(RISE_IN, 0, t)}px)`;
    el.style.filter = `blur(${lerp(6, 0, t)}px)`;
    return;
  }

  if (local > EXIT_START) {
    const t = easeOutSmooth((local - EXIT_START) / (1 - EXIT_START), 2);
    el.style.opacity = String(1 - t);
    el.style.transform = `translateY(${lerp(0, RISE_OUT, t)}px)`;
    el.style.filter = `blur(${lerp(0, 4, t)}px)`;
    return;
  }

  el.style.opacity = "1";
  el.style.transform = "translateY(0px)";
  el.style.filter = "blur(0px)";
}

export function resetStoryText(container: HTMLElement | null): void {
  if (!container) return;
  container.querySelectorAll<HTMLElement>("[data-story-beat]").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = `translateY(${RISE_IN}px)`;
    el.style.filter = "blur(6px)";
  });
}

export function updateStoryScrollText(
  container: HTMLElement | null,
  storyProgress: number,
  beats: ReadonlyArray<{ start: number; end: number }>,
): void {
  if (!container) return;

  const elements = container.querySelectorAll<HTMLElement>("[data-story-beat]");
  beats.forEach((beat, i) => {
    const el = elements[i];
    if (el) applyStoryBeatMotion(el, storyProgress, beat.start, beat.end);
  });
}
