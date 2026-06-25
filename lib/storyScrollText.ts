/** Scroll-synced story captions during the cinematic frame sequence. */

export interface StoryTextBeat {
  /** Start of visibility window within story progress (0–1). */
  start: number;
  /** End of visibility window within story progress (0–1). */
  end: number;
  title: string;
  subtitle: string;
}

export const STORY_TEXT_BEATS: readonly StoryTextBeat[] = [
  {
    start: 0.1,
    end: 0.26,
    title: "Raw Earth.",
    subtitle: "Every structure begins beneath the surface.",
  },
  {
    start: 0.24,
    end: 0.42,
    title: "Pressure & Heat.",
    subtitle: "Forged by fire. Shaped by intention.",
  },
  {
    start: 0.4,
    end: 0.58,
    title: "Grain by Grain.",
    subtitle: "Precision in every particle.",
  },
  {
    start: 0.56,
    end: 0.74,
    title: "Form Takes Hold.",
    subtitle: "From dust to density.",
  },
  {
    start: 0.72,
    end: 0.9,
    title: "Refined.",
    subtitle: "Built to endure. Designed to inspire.",
  },
] as const;
